import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush 
} from 'recharts';

const Dashboard = () => {
  const [networkData, setNetworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/network`);
      setNetworkData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2s for "Live" feel
    return () => clearInterval(interval);
  }, []);

  const [synapseZoom, setSynapseZoom] = useState(1);
  const [structureZoom, setStructureZoom] = useState(1);

  if (loading) return <div className="text-white">Loading BDH State...</div>;
  if (!networkData) return <div className="text-white">No data available</div>;

  // Prepare data for charts
  const synapses = networkData.synapses
    .sort((a: any, b: any) => b.weight - a.weight)
    .map((s: any) => ({
      name: `${s.source_id.split(':')[1]} -> ${s.target_id.split(':')[0] === 'pattern' ? 'Pattern' : 'Adverse'}`,
      weight: s.weight
    }));

  const neurons = networkData.neurons;
  const neuronCounts = [
    { name: 'Input', count: neurons.filter((n: any) => n.layer === 'input').length },
    { name: 'Hidden (Patterns)', count: neurons.filter((n: any) => n.layer === 'hidden').length },
    { name: 'Output', count: neurons.filter((n: any) => n.layer === 'output').length },
  ];

  const ZoomControls = ({ zoom, setZoom }: { zoom: number, setZoom: (z: number) => void }) => (
    <div className="flex gap-2">
        <button className="px-3 py-1 bg-gray-800 rounded text-white text-xs hover:bg-gray-700 font-bold" onClick={() => setZoom(Math.min(zoom + 0.2, 3))}>+</button>
        <button className="px-3 py-1 bg-gray-800 rounded text-white text-xs hover:bg-gray-700 font-bold" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>-</button>
        <button className="px-3 py-1 bg-gray-800 rounded text-white text-xs hover:bg-gray-700" onClick={() => setZoom(1)}>Reset</button>
    </div>
  );

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold mb-6">Live BDH Monitor</h2>

      {/* Synaptic Weights */}
      <div className="bg-netflix-dark p-8 rounded-lg border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Learned Associations (Synaptic Weights)</h3>
            <ZoomControls zoom={synapseZoom} setZoom={setSynapseZoom} />
        </div>
        
        <div className="h-[500px] w-full overflow-hidden border border-gray-900 bg-black rounded p-4 relative">
            <div style={{ width: '100%', height: '100%', transform: `scale(${synapseZoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease-out' }}
                 className={synapseZoom > 1 ? "cursor-move" : ""}
            >
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={synapses} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" width={180} stroke="#888" style={{fontSize: '12px', fontWeight: 'bold'}} interval={0} />
                    <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', color: '#fff' }}
                    itemStyle={{ color: '#E50914' }}
                    />
                    <Legend />
                    <Bar dataKey="weight" fill="#E50914" radius={[0, 4, 4, 0]} animationDuration={1000} name="Connection Strength" />
                    <Brush dataKey="name" height={30} stroke="#E50914" fill="#1f1f1f" />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded border-l-4 border-netflix-red">
            <h4 className="text-white font-bold mb-2">Understanding this Graph:</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
            This chart visualizes the <strong>Hebbian Learning</strong> process. Each bar represents a synaptic connection between a neuron (Input or Hidden Pattern) and the Adverse Event output. 
            <br/><br/>
            The <strong>length of the bar</strong> corresponds to the <strong>Synaptic Weight</strong>. A longer bar means the system has learned a strong correlation: <em>"When this input fires, an adverse event is highly likely."</em>
            <br/><br/>
            Use the <strong>Zoom buttons</strong> above to enlarge the view, or the <strong>slider at the bottom</strong> to scroll through all learned connections.
            </p>
        </div>
      </div>

      {/* Network Structure */}
      <div className="bg-netflix-dark p-8 rounded-lg border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Network Architecture Growth</h3>
            <ZoomControls zoom={structureZoom} setZoom={setStructureZoom} />
        </div>

        <div className="h-[500px] w-full overflow-hidden border border-gray-900 bg-black rounded p-4 relative">
             <div style={{ width: '100%', height: '100%', transform: `scale(${structureZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={neuronCounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" tick={{fill: '#fff', fontSize: 14}} />
                    <YAxis stroke="#888" />
                    <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#E50914" radius={[8, 8, 0, 0]} animationDuration={1000} name="Neuron Count" barSize={80} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded border-l-4 border-blue-500">
            <h4 className="text-white font-bold mb-2">Understanding this Graph:</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
            This chart tracks the <strong>structural plasticity</strong> of the BDH network. Unlike fixed-size neural networks, BDH <strong>grows</strong> over time.
            <br/><br/>
            - <strong>Input Neurons</strong>: Fixed sensors for drugs/conditions.
            <br/>
            - <strong>Hidden (Patterns)</strong>: Dynamically created neurons that represent unique combinations of inputs (e.g., "Drug A + Drug B").
            <br/>
            - <strong>Output</strong>: The decision node (Adverse Event).
            <br/><br/>
            As the system encounters new, complex scenarios, you will see the "Hidden" bar grow, indicating the formation of new memories.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
