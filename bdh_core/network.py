import json
import os
import hashlib
from typing import List, Dict, Tuple
from .primitives import Neuron, Synapse

DATA_PATH = os.path.join(os.getcwd(), "data", "network_state.json")

class BDHNetwork:
    def __init__(self):
        self.neurons: Dict[str, Neuron] = {}
        self.synapses: List[Synapse] = []
        self.adverse_neuron_id = "outcome:adverse_event"
        
        # Initialize Output Neuron if not present
        if self.adverse_neuron_id not in self.neurons:
            self.neurons[self.adverse_neuron_id] = Neuron(
                self.adverse_neuron_id, "output", "Adverse Event"
            )
        
        self.load()

    def _get_synapse(self, source: str, target: str) -> Synapse:
        for s in self.synapses:
            if s.source_id == source and s.target_id == target:
                return s
        return None

    def _create_or_get_input_neuron(self, category: str, value: str) -> Neuron:
        # Sanitize value
        clean_value = value.strip().lower()
        neuron_id = f"{category}:{clean_value}"
        if neuron_id not in self.neurons:
            self.neurons[neuron_id] = Neuron(neuron_id, "input", f"{category}: {value}")
        return self.neurons[neuron_id]

    def _calculate_activation(self, neuron_id: str, visited: set) -> float:
        # Simple recursive activation propagation
        # For this BDH, we simply sum weighted inputs
        # Activation = sum(input_activation * weight)
        
        # Avoid cycles
        if neuron_id in visited:
            return 0.0
        visited.add(neuron_id)

        neuron = self.neurons[neuron_id]
        
        # If input layer, return its set activation
        if neuron.layer == "input":
            return neuron.activation

        total_input = 0.0
        # Find all synapses pointing to this neuron
        incoming = [s for s in self.synapses if s.target_id == neuron_id]
        
        for syn in incoming:
            source_neuron = self.neurons[syn.source_id]
            # Recursively get activation of source
            # Note: In a real recurrent net, we'd use time steps. 
            # Here we assume feed-forward hierarchy for inference step.
            act = self._calculate_activation(source_neuron.id, visited.copy())
            total_input += act * syn.weight
            
        # Activation function: ReLU-like or just identity/clamped
        # Let's use simple clamping
        activation = min(max(total_input, 0.0), 10.0) # Cap at 10 to prevent explosion
        neuron.activation = activation
        neuron.fired = activation > 0.1
        return activation

    def forward(self, inputs: Dict[str, str | List[str]]) -> Dict:
        # Reset all activations
        for n in self.neurons.values():
            n.activation = 0.0
            n.fired = False
            
        # 1. Activate Input Neurons
        active_input_ids = []
        
        # Handle 'medications' list
        if "medications" in inputs:
            meds = inputs["medications"]
            if isinstance(meds, str): meds = [meds]
            for med in meds:
                if med:
                    n = self._create_or_get_input_neuron("drug", med)
                    n.activation = 1.0
                    n.fired = True
                    active_input_ids.append(n.id)

        # Handle 'conditions' list
        if "conditions" in inputs:
            conds = inputs["conditions"]
            if isinstance(conds, str): conds = [conds]
            for cond in conds:
                if cond:
                    n = self._create_or_get_input_neuron("condition", cond)
                    n.activation = 1.0
                    n.fired = True
                    active_input_ids.append(n.id)

        # Handle dosage/freq as simpler inputs for now or combinatorics
        # Let's just treat them as input nodes if provided
        for key in ["dosage", "frequency"]:
            if key in inputs and inputs[key]:
                val = str(inputs[key])
                n = self._create_or_get_input_neuron(key, val)
                n.activation = 1.0
                n.fired = True
                active_input_ids.append(n.id)

        # 2. Propagate to Hidden/Pattern Layer
        # We need to find all neurons that are NOT input and calculate their activation
        # To ensure order (Input -> Hidden -> Output), we can iterate layers or just dependency graph
        # Simple approach: Calculate Output directly, the recursion will handle intermediates
        
        risk_score = self._calculate_activation(self.adverse_neuron_id, set())
        
        # 3. Generate Explanation
        # Trace back high weighted paths
        explanation = []
        output_neuron = self.neurons[self.adverse_neuron_id]
        
        # Find active paths
        triggered_synapses = []
        for s in self.synapses:
            if self.neurons[s.source_id].fired and self.neurons[s.target_id].fired:
                triggered_synapses.append(s)
                
        return {
            "risk_score": risk_score,
            "active_neurons": [n.to_dict() for n in self.neurons.values() if n.fired],
            "triggered_synapses": [s.to_dict() for s in triggered_synapses]
        }

    def learn(self, inputs: Dict, is_adverse: bool):
        # Run forward first to set state
        result = self.forward(inputs)
        
        if not is_adverse:
            # Maybe weaken connections? For now, we only learn on Adverse Events (Hebbian)
            # Or we could implement LTD (Long Term Depression) for non-events
            return result

        # Hebbian Learning: "Neurons that fire together, wire together"
        # We want to associate the CURRENT active inputs with the ADVERSE outcome.
        
        active_inputs = [n for n in self.neurons.values() if n.layer == "input" and n.fired]
        if not active_inputs:
            return result

        # 1. Create a Pattern Neuron representing this specific combination
        # This creates the "Hierarchy"
        input_ids = sorted([n.id for n in active_inputs])
        combo_key = "|".join(input_ids)
        combo_id = f"pattern:{hashlib.md5(combo_key.encode()).hexdigest()[:8]}"
        
        if combo_id not in self.neurons:
            # Create new hidden neuron
            label = " + ".join([n.label.split(': ')[1] for n in active_inputs])
            combo_neuron = Neuron(combo_id, "hidden", f"Pattern: {label}")
            self.neurons[combo_id] = combo_neuron
            
            # Connect Inputs -> Pattern
            for n in active_inputs:
                self.synapses.append(Synapse(n.id, combo_id, weight=1.0)) # Strong connection to pattern
            
            # Connect Pattern -> Adverse Event
            self.synapses.append(Synapse(combo_id, self.adverse_neuron_id, weight=0.5))
        else:
            # Pattern exists, strengthen connection to Adverse Event
            syn = self._get_synapse(combo_id, self.adverse_neuron_id)
            if syn:
                syn.weight = min(syn.weight + 0.2, 5.0) # Strengthen significantly
        
        # 2. Also strengthen direct individual connections (optional, but good for simple risk)
        # for n in active_inputs:
        #     syn = self._get_synapse(n.id, self.adverse_neuron_id)
        #     if not syn:
        #         self.synapses.append(Synapse(n.id, self.adverse_neuron_id, weight=0.1))
        #     else:
        #         syn.weight += 0.1
        
        self.save()
        return self.forward(inputs) # Re-run to show increased risk immediately

    def save(self):
        data = {
            "neurons": [n.to_dict() for n in self.neurons.values()],
            "synapses": [s.to_dict() for s in self.synapses]
        }
        with open(DATA_PATH, "w") as f:
            json.dump(data, f, indent=2)

    def load(self):
        if not os.path.exists(DATA_PATH):
            return
        
        try:
            with open(DATA_PATH, "r") as f:
                data = json.load(f)
                
            self.neurons = {n["id"]: Neuron.from_dict(n) for n in data["neurons"]}
            self.synapses = [Synapse.from_dict(s) for s in data["synapses"]]
        except Exception as e:
            print(f"Error loading data: {e}")
            # Reset if error
            self.neurons = {self.adverse_neuron_id: Neuron(self.adverse_neuron_id, "output", "Adverse Event")}
            self.synapses = []

    def reset(self):
        if os.path.exists(DATA_PATH):
            os.remove(DATA_PATH)
        self.neurons = {self.adverse_neuron_id: Neuron(self.adverse_neuron_id, "output", "Adverse Event")}
        self.synapses = []
