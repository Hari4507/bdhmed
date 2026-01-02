import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';

const BDHVisualizer = () => {
  const [network, setNetwork] = useState<any>(null);
  const prevNetworkRef = useRef<any>(null);
  const [changedSynapses, setChangedSynapses] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/network`);
        const newData = res.data;
        
        // Detect Hebbian changes for feedback
        if (prevNetworkRef.current) {
          const changes = new Set<string>();
          newData.synapses.forEach((syn: any) => {
            const oldSyn = prevNetworkRef.current.synapses.find((s: any) => 
              s.source_id === syn.source_id && s.target_id === syn.target_id
            );
            if (!oldSyn || syn.weight > oldSyn.weight) {
              changes.add(`${syn.source_id}-${syn.target_id}`);
            }
          });
          if (changes.size > 0) {
            setChangedSynapses(changes);
            setTimeout(() => setChangedSynapses(new Set()), 2000);
          }
        }
        
        prevNetworkRef.current = newData;
        setNetwork(newData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Structured Layout: Inputs -> Patterns -> Output
  const nodePositions = useMemo(() => {
    if (!network) return {};
    
    const width = 800;
    const height = 500;
    const padding = 60;
    
    const positions: Record<string, {x: number, y: number}> = {};
    
    const inputs = network.neurons.filter((n: any) => n.layer === 'input');
    const hidden = network.neurons.filter((n: any) => n.layer === 'hidden');
    const outputs = network.neurons.filter((n: any) => n.layer === 'output');

    const distributeY = (items: any[], x: number) => {
      const step = (height - 2 * padding) / Math.max(items.length, 1);
      items.forEach((n, i) => {
        positions[n.id] = {
          x: x,
          y: padding + step * i + (items.length > 1 ? 0 : (height - 2 * padding)/2)
        };
      });
    };

    distributeY(inputs, width * 0.15);
    distributeY(hidden, width * 0.5);
    distributeY(outputs, width * 0.85);

    return positions;
  }, [network ? network.neurons.length : 0]);

  // Trace back logic
  const tracedElements = useMemo(() => {
    if (!selectedNodeId || !network) return null;

    const relevantNodes = new Set<string>();
    const relevantSynapses = new Set<string>();
    
    const trace = (targetId: string) => {
      relevantNodes.add(targetId);
      
      // Find incoming synapses
      const incoming = network.synapses.filter((s: any) => s.target_id === targetId);
      incoming.forEach((s: any) => {
        relevantSynapses.add(`${s.source_id}-${s.target_id}`);
        // Recurse up if it's not already visited (prevent cycles though DAG shouldn't have them)
        if (!relevantNodes.has(s.source_id)) {
          trace(s.source_id);
        }
      });
    };

    trace(selectedNodeId);
    return { nodes: relevantNodes, synapses: relevantSynapses };
  }, [selectedNodeId, network]);

  // Trace Details Logic
  const traceDetails = useMemo(() => {
    if (!selectedNodeId || !network) return null;

    const targetNode = network.neurons.find((n: any) => n.id === selectedNodeId);
    const directContributors = network.synapses
        .filter((s: any) => s.target_id === selectedNodeId)
        .map((s: any) => {
            const sourceNode = network.neurons.find((n: any) => n.id === s.source_id);
            return {
                source: sourceNode.label || s.source_id,
                weight: s.weight,
                layer: sourceNode.layer
            };
        })
        .sort((a: any, b: any) => b.weight - a.weight);

    return { target: targetNode, contributors: directContributors };
  }, [selectedNodeId, network]);

  // Zoom/Pan State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, transform.k + scaleAmount), 5);
    setTransform(prev => ({ ...prev, k: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if clicking background (not a node)
    // Nodes have stopPropagation, so this should be fine
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!network) return <div className="text-white p-4">Loading BDH Architecture...</div>;

  return (
    <div className="bg-netflix-dark p-6 rounded-lg border border-gray-800 relative flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4 z-10">
        <h3 className="text-xl font-bold text-white">BDH Network Internals</h3>
        <div className="flex gap-4 text-sm items-center">
            <div className="flex gap-2">
                <button className="px-2 py-1 bg-gray-800 rounded text-white text-xs hover:bg-gray-700" onClick={() => setTransform(prev => ({...prev, k: Math.min(prev.k + 0.2, 5)}))}>+</button>
                <button className="px-2 py-1 bg-gray-800 rounded text-white text-xs hover:bg-gray-700" onClick={() => setTransform(prev => ({...prev, k: Math.max(prev.k - 0.2, 0.1)}))}>-</button>
                <button className="px-2 py-1 bg-gray-800 rounded text-white text-xs hover:bg-gray-700" onClick={() => setTransform({x:0, y:0, k:1})}>Reset</button>
            </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-netflix-red"></span> Active
          </div>
          <div className="text-gray-400 italic text-xs ml-4">
            (Scroll to Zoom, Drag to Pan)
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative overflow-hidden flex-1 bg-black rounded border border-gray-900 cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => {
            if (!isDragging) setSelectedNodeId(null);
        }}
      > 
        {/* Trace Analysis Panel */}
        {selectedNodeId && traceDetails && (
            <div className="absolute top-4 right-4 z-20 w-64 bg-black/90 border border-netflix-red rounded p-4 text-white shadow-lg pointer-events-none backdrop-blur-sm">
                <h4 className="font-bold text-lg mb-2 text-netflix-red border-b border-gray-800 pb-1">Trace Analysis</h4>
                <div className="mb-3">
                    <span className="text-xs text-gray-400 uppercase">Selected Node</span>
                    <div className="font-bold text-sm">{traceDetails.target?.label}</div>
                    <div className="text-xs text-gray-300">Activation: {traceDetails.target?.activation.toFixed(2)}</div>
                </div>
                
                {traceDetails.contributors.length > 0 ? (
                    <div>
                        <span className="text-xs text-gray-400 uppercase mb-1 block">Primary Causes (Inputs)</span>
                        <ul className="space-y-1">
                            {traceDetails.contributors.map((c: any, i: number) => (
                                <li key={i} className="flex justify-between text-xs items-center">
                                    <span className="truncate w-32">{c.source}</span>
                                    <span className="text-netflix-red font-bold">{(c.weight * 100).toFixed(0)}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-xs text-gray-500 italic">No incoming connections (Input Node)</div>
                )}
            </div>
        )}

        {/* Column Headers - Fixed position relative to container, not zoomed */}
        <div className="absolute top-2 w-full flex justify-between px-[10%] text-xs font-bold text-gray-400 uppercase tracking-wider pointer-events-none z-10">
          <span className="text-center w-24">Inputs<br/>(Sensory)</span>
          <span className="text-center w-24">Patterns<br/>(Hidden)</span>
          <span className="text-center w-24">Outcome<br/>(Motor)</span>
        </div>

        <svg width="100%" height="100%" className="w-full h-full">
            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          <defs>
             <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
             </marker>
             <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#E50914" />
             </marker>
             <marker id="arrowhead-traced" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#FFA500" />
             </marker>
          </defs>

          {/* Synapses */}
          {network.synapses.map((s: any, i: number) => {
            const start = nodePositions[s.source_id];
            const end = nodePositions[s.target_id];
            if (!start || !end) return null;
            
            const isChanged = changedSynapses.has(`${s.source_id}-${s.target_id}`);
            const sourceActive = network.neurons.find((n: any) => n.id === s.source_id)?.fired;
            const targetActive = network.neurons.find((n: any) => n.id === s.target_id)?.fired;
            const isActivePath = sourceActive && targetActive;
            
            // Tracing Logic
            const isTraced = tracedElements?.synapses.has(`${s.source_id}-${s.target_id}`);
            const isDimmed = tracedElements && !isTraced;

            let strokeColor = "#888"; // Brighter default
            let opacity = 0.5; // More visible default
            let marker = "url(#arrowhead)";

            if (isTraced) {
              strokeColor = "#FFA500"; // Orange for traced path
              opacity = 1.0;
              marker = "url(#arrowhead-traced)";
            } else if (isChanged) {
              strokeColor = "#22d3ee";
              opacity = 1.0;
              marker = "url(#arrowhead-active)";
            } else if (isActivePath) {
              strokeColor = "#E50914";
              opacity = 1.0;
              marker = "url(#arrowhead-active)";
            }

            if (isDimmed) {
              opacity = 0.05;
              strokeColor = "#444";
            }

            const width = Math.max(1, s.weight * 2);

            return (
              <line 
                key={`syn-${i}`}
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke={strokeColor}
                strokeWidth={width}
                strokeOpacity={opacity}
                markerEnd={marker}
                className="transition-colors duration-500"
              />
            );
          })}

          {/* Neurons */}
          {network.neurons.map((n: any) => {
            const pos = nodePositions[n.id];
            if (!pos) return null;
            
            const isActive = n.fired;
            const isOutput = n.layer === 'output';
            
            // Tracing Logic
            const isTraced = tracedElements?.nodes.has(n.id);
            const isDimmed = tracedElements && !isTraced;
            const isSelected = selectedNodeId === n.id;

            let fillColor = isActive ? '#E50914' : '#ffffff';
            let strokeColor = isActive ? '#fff' : '#ccc';
            let opacity = 1.0;

            if (isTraced) {
              strokeColor = "#FFA500";
              if (isSelected) fillColor = "#FFA500";
            }
            
            if (isDimmed) {
              opacity = 0.1;
              fillColor = "#fff";
              strokeColor = "#444";
            }

            return (
              <g 
                key={n.id} 
                className="transition-all duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  // Prevent selection if dragging (handled in container)
                }}
                onMouseUp={(e) => {
                    e.stopPropagation();
                    if (!isDragging) setSelectedNodeId(isSelected ? null : n.id);
                }}
              >
                {/* Halo for selection */}
                {isSelected && (
                   <circle cx={pos.x} cy={pos.y} r={isOutput ? 28 : 20} fill="#FFA500" opacity="0.2" />
                )}

                {/* Node Circle */}
                <circle 
                  cx={pos.x} cy={pos.y} 
                  r={isOutput ? 20 : 12}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isOutput ? 3 : 2}
                  opacity={opacity}
                />

                {/* Text Label */}
                <text 
                  x={pos.x} 
                  y={pos.y + (isOutput ? 35 : 25)} 
                  fill={isDimmed ? "#444" : (isActive || isTraced ? '#fff' : '#ccc')} 
                  fontSize="11" 
                  fontWeight={isActive || isTraced ? "bold" : "normal"}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {n.label}
                </text>
                
                {/* Activation Value inside node (if large enough) */}
                {isOutput && !isDimmed && (
                  <text 
                    x={pos.x} y={pos.y + 4} 
                    fill={(isActive && !isSelected) ? "white" : "black"} 
                    fontSize="10" 
                    textAnchor="middle" 
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {n.activation.toFixed(1)}
                  </text>
                )}
                
                <title>
                  {`ID: ${n.id}\nActivation: ${n.activation}\nLayer: ${n.layer}\n(Click to trace)`}
                </title>
              </g>
            );
          })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default BDHVisualizer;
