const Comparison = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Transformer vs BDH: Architectural Differences</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-netflix-dark p-8 rounded-lg border border-gray-800">
          <h3 className="text-2xl font-bold mb-4 text-gray-400">Traditional Transformers</h3>
          <ul className="space-y-4 text-gray-400">
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">✖</span>
              <span>Requires massive offline retraining to learn new patterns.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">✖</span>
              <span>Static weights during inference (frozen model).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">✖</span>
              <span>Black-box attention mechanism (hard to trace causality).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">✖</span>
              <span>High computational cost (O(N²) attention).</span>
            </li>
          </ul>
        </div>

        <div className="bg-netflix-dark p-8 rounded-lg border border-netflix-red relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-netflix-red text-white text-xs px-2 py-1 font-bold rounded-bl">
            OUR ARCHITECTURE
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">Brain-Derived Hierarchical (BDH)</h3>
          <ul className="space-y-4 text-gray-300">
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✔</span>
              <span>Learns <strong>instantly</strong> during inference (Hebbian updates).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✔</span>
              <span>Dynamic weights that adapt to every single event.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✔</span>
              <span>Fully explainable paths (trace specific neuron firings).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✔</span>
              <span>Lightweight, runs on edge devices (sparse activation).</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Scenario: "Patient takes Drug A + Drug B -&gt; Adverse Event"</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-4 font-bold text-gray-400">Feature</th>
              <th className="py-4 font-bold text-gray-400">Transformer (LLM)</th>
              <th className="py-4 font-bold text-white">BDH System</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <tr>
              <td className="py-4 text-gray-400">Immediate Response</td>
              <td className="py-4 text-gray-500">None. Requires model update cycle (days/weeks).</td>
              <td className="py-4 text-green-400 font-bold">Instant. Weights update immediately.</td>
            </tr>
            <tr>
              <td className="py-4 text-gray-400">Next Patient Risk</td>
              <td className="py-4 text-gray-500">Unchanged until retraining.</td>
              <td className="py-4 text-green-400 font-bold">Immediately flagged as High Risk.</td>
            </tr>
            <tr>
              <td className="py-4 text-gray-400">Memory Mechanism</td>
              <td className="py-4 text-gray-500">Fixed Context Window / Embeddings.</td>
              <td className="py-4 text-green-400 font-bold">Structural Synaptic Plasticity.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Comparison;
