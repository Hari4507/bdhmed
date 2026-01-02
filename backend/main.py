from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add parent directory to path to import bdh_core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bdh_core.network import BDHNetwork

app = FastAPI(title="BDH Adverse Event Learning System")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

network = BDHNetwork()

class ClinicalInput(BaseModel):
    patient_id: str
    medications: List[str]
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    conditions: List[str]
    is_adverse_event: bool

@app.get("/")
def read_root():
    return {"status": "BDH System Online"}

@app.post("/submit")
def submit_clinical_data(data: ClinicalInput):
    inputs = {
        "medications": data.medications,
        "conditions": data.conditions,
        "dosage": data.dosage,
        "frequency": data.frequency
    }
    
    # If it's an adverse event, we learn. 
    # If it's NOT, we just run inference (forward pass) to see what the risk WOULD have been.
    # Note: User requirements say "The system must adapt immediately after an adverse event."
    
    if data.is_adverse_event:
        result = network.learn(inputs, is_adverse=True)
    else:
        result = network.forward(inputs)
        
    return result

@app.get("/network")
def get_network_state():
    return {
        "neurons": [n.to_dict() for n in network.neurons.values()],
        "synapses": [s.to_dict() for s in network.synapses]
    }

@app.post("/reset")
def reset_network():
    network.reset()
    return {"status": "Network reset"}
