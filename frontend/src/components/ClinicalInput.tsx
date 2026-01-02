import React, { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Save } from 'lucide-react';

const ClinicalInput = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    medications: '',
    dosage: '',
    frequency: '',
    conditions: '',
    is_adverse_event: false
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        medications: formData.medications.split(',').map(s => s.trim()).filter(s => s),
        conditions: formData.conditions.split(',').map(s => s.trim()).filter(s => s),
      };
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/submit`, payload);
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Clinical Input</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-netflix-dark p-6 rounded-lg border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Patient ID</label>
              <input 
                type="text" 
                className="w-full bg-netflix-black border border-gray-700 rounded p-2 text-white focus:border-netflix-red focus:outline-none"
                value={formData.patient_id}
                onChange={e => setFormData({...formData, patient_id: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-1">Medications (comma separated)</label>
              <input 
                type="text" 
                className="w-full bg-netflix-black border border-gray-700 rounded p-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="e.g. Aspirin, Warfarin"
                value={formData.medications}
                onChange={e => setFormData({...formData, medications: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Dosage</label>
                <input 
                  type="text" 
                  className="w-full bg-netflix-black border border-gray-700 rounded p-2 text-white focus:border-netflix-red focus:outline-none"
                  value={formData.dosage}
                  onChange={e => setFormData({...formData, dosage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Frequency</label>
                <input 
                  type="text" 
                  className="w-full bg-netflix-black border border-gray-700 rounded p-2 text-white focus:border-netflix-red focus:outline-none"
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Conditions (comma separated)</label>
              <input 
                type="text" 
                className="w-full bg-netflix-black border border-gray-700 rounded p-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="e.g. Hypertension, Diabetes"
                value={formData.conditions}
                onChange={e => setFormData({...formData, conditions: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Observed Outcome</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="outcome"
                    checked={!formData.is_adverse_event}
                    onChange={() => setFormData({...formData, is_adverse_event: false})}
                    className="accent-green-500"
                  />
                  <span className="text-green-400">Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="outcome"
                    checked={formData.is_adverse_event}
                    onChange={() => setFormData({...formData, is_adverse_event: true})}
                    className="accent-netflix-red"
                  />
                  <span className="text-netflix-red font-bold">Adverse Event</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-netflix-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : <><Save size={20} /> Submit Record</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <div className={`p-6 rounded-lg border ${result.risk_score > 0.1 ? 'bg-red-900/20 border-netflix-red' : 'bg-green-900/20 border-green-500'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                {result.risk_score > 0.1 ? <AlertTriangle className="text-netflix-red" /> : <CheckCircle className="text-green-500" />}
                Risk Assessment
              </h3>
              
              <div className="mb-4">
                <div className="text-gray-400 text-sm">Risk Score</div>
                <div className={`text-4xl font-bold ${result.risk_score > 0.1 ? 'text-netflix-red' : 'text-green-500'}`}>
                  {result.risk_score.toFixed(2)}
                </div>
              </div>

              {result.active_neurons.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-300 mb-2">Active Neural Pathways:</h4>
                  <ul className="space-y-1">
                    {result.active_neurons.map((n: any) => (
                      <li key={n.id} className="text-sm text-gray-400">
                        • <span className="text-white">{n.label}</span> ({n.layer})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-netflix-dark p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold mb-2 text-gray-300">System Status</h3>
            <p className="text-gray-400 text-sm">
              BDH Core is active. Learning is enabled during inference.
              Submitting an Adverse Event will immediately update synaptic weights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalInput;
