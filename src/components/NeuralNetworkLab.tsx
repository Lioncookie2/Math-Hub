import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

// Simple sigmoid activation
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export const NeuralNetworkLab: React.FC = () => {
  const [inputs, setInputs] = useState([0.5, 0.8]); // Input values
  // Weights: Layer 1 (2 inputs -> 3 hidden), Layer 2 (3 hidden -> 1 output)
  const [weights1, setWeights1] = useState<number[][]>([
    [0.5, -0.2, 0.8], // Input 1 connections
    [-0.5, 0.4, 0.1], // Input 2 connections
  ]);
  const [weights2, setWeights2] = useState<number[]>([0.6, -0.3, 0.9]); // Hidden -> Output
  
  // Forward Propagation Calculation
  const hiddenLayer = useMemo(() => {
    const nodes = [0, 0, 0];
    for (let h = 0; h < 3; h++) {
      let sum = 0;
      for (let i = 0; i < 2; i++) {
        sum += inputs[i] * weights1[i][h];
      }
      nodes[h] = sigmoid(sum); // Activation
    }
    return nodes;
  }, [inputs, weights1]);

  const outputLayer = useMemo(() => {
    let sum = 0;
    for (let h = 0; h < 3; h++) {
      sum += hiddenLayer[h] * weights2[h];
    }
    return sigmoid(sum);
  }, [hiddenLayer, weights2]);

  const updateWeight1 = (inputIdx: number, hiddenIdx: number, val: number) => {
    const newW = [...weights1];
    newW[inputIdx][hiddenIdx] = val;
    setWeights1(newW);
  };

  const updateWeight2 = (hiddenIdx: number, val: number) => {
    const newW = [...weights2];
    newW[hiddenIdx] = val;
    setWeights2(newW);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Visualization Canvas */}
      <div className="lg:col-span-2 bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative min-h-[500px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Lines from Input to Hidden */}
          {inputs.map((_, i) => 
            hiddenLayer.map((_, h) => {
              const w = weights1[i][h];
              // const opacity = Math.abs(w); // Not used, but could be for styling
              const color = w > 0 ? '#34d399' : '#f87171'; // Green pos, Red neg
              return (
                <motion.line
                  key={`l1-${i}-${h}`}
                  x1="15%" y1={`${35 + i * 30}%`}
                  x2="50%" y2={`${25 + h * 25}%`}
                  stroke={color}
                  strokeWidth={Math.abs(w) * 8}
                  opacity={0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              );
            })
          )}
          
          {/* Lines from Hidden to Output */}
          {hiddenLayer.map((_, h) => {
            const w = weights2[h];
            const color = w > 0 ? '#34d399' : '#f87171';
            return (
              <motion.line
                key={`l2-${h}`}
                x1="50%" y1={`${25 + h * 25}%`}
                x2="85%" y2="50%"
                stroke={color}
                strokeWidth={Math.abs(w) * 8}
                opacity={0.6}
              />
            );
          })}
        </svg>

        {/* Nodes Overlay (HTML for easy interaction/labels) */}
        <div className="flex justify-between w-full h-full relative z-10">
            {/* Input Layer */}
            <div className="flex flex-col justify-center gap-24 ml-[10%]">
                {inputs.map((val, i) => (
                    <div key={i} className="relative">
                        <div className="w-16 h-16 rounded-full bg-background border-2 border-white/20 flex items-center justify-center shadow-xl">
                            <span className="text-xs text-gray-400">Input {i+1}</span>
                        </div>
                        <div className="absolute -bottom-10 left-0 right-0">
                            <input 
                                type="range" min="0" max="1" step="0.1" 
                                value={val}
                                onChange={(e) => {
                                    const newI = [...inputs];
                                    newI[i] = parseFloat(e.target.value);
                                    setInputs(newI);
                                }}
                                className="w-16 accent-white"
                            />
                            <div className="text-center text-xs text-white">{val.toFixed(1)}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hidden Layer */}
            <div className="flex flex-col justify-center gap-16">
                {hiddenLayer.map((val, i) => (
                    <div key={i} className="relative group">
                        <div 
                            className="w-14 h-14 rounded-full bg-surface border-2 border-primary/50 flex items-center justify-center shadow-lg transition-colors duration-300"
                            style={{ backgroundColor: `rgba(139, 92, 246, ${val})` }}
                        >
                            <span className="text-xs font-mono text-white">{val.toFixed(2)}</span>
                        </div>
                        {/* Tooltip for weights incoming */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition">
                            Activation: Sigmoid
                        </div>
                    </div>
                ))}
            </div>

            {/* Output Layer */}
            <div className="flex flex-col justify-center mr-[10%]">
                <div className="relative">
                    <div 
                        className="w-20 h-20 rounded-full bg-background border-4 border-secondary flex flex-col items-center justify-center shadow-2xl shadow-secondary/20 transition-all duration-300"
                        style={{ borderColor: `rgba(6, 182, 212, ${outputLayer + 0.2})` }}
                    >
                        <span className="text-xs text-gray-500 uppercase">Output</span>
                        <span className="text-xl font-bold text-white">{outputLayer.toFixed(3)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="space-y-6">
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 space-y-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Juster Vekter
            </h3>
            
            <div className="space-y-6">
                <div>
                    <h4 className="text-xs text-gray-500 uppercase mb-3">Layer 1 (Input → Hidden)</h4>
                    {weights1.map((row, i) => (
                        <div key={i} className="mb-4">
                            <div className="text-xs text-primary mb-2">Fra Input {i+1}</div>
                            <div className="grid grid-cols-3 gap-2">
                                {row.map((w, h) => (
                                    <div key={h} className="flex flex-col items-center">
                                        <input 
                                            type="range" min="-1" max="1" step="0.1" 
                                            value={w}
                                            onChange={(e) => updateWeight1(i, h, parseFloat(e.target.value))}
                                            className="w-full accent-primary h-1"
                                        />
                                        <span className="text-[10px] text-gray-400 font-mono">{w.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-white/10" />

                <div>
                    <h4 className="text-xs text-gray-500 uppercase mb-3">Layer 2 (Hidden → Output)</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {weights2.map((w, h) => (
                            <div key={h} className="flex flex-col items-center">
                                <div className="text-[10px] text-secondary mb-1">Node {h+1}</div>
                                <input 
                                    type="range" min="-1" max="1" step="0.1" 
                                    value={w}
                                    onChange={(e) => updateWeight2(h, parseFloat(e.target.value))}
                                    className="w-full accent-secondary h-1"
                                />
                                <span className="text-[10px] text-gray-400 font-mono">{w.toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-surface/40 border border-white/5 rounded-3xl p-6">
            <h4 className="font-semibold text-white mb-2">Hva skjer her?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
                Dette er <strong>Forward Propagation</strong>. Data flyter fra venstre mot høyre. Hver linje er en vekt (betydning). 
                <br/><br/>
                Grønn linje = Positiv vekt (forsterker). <br/>
                Rød linje = Negativ vekt (demper).
            </p>
        </div>
      </div>
    </div>
  );
};
