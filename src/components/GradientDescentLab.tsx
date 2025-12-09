import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Play, Pause, RefreshCw, TrendingDown } from 'lucide-react';
import type { Data, Layout } from 'plotly.js';
import Latex from 'react-latex-next';

export const GradientDescentLab: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);
  const [position, setPosition] = useState({ x: 4, y: 4 });
  const [history, setHistory] = useState<{x: number, y: number, z: number}[]>([]);
  const [iteration, setIteration] = useState(0);

  // Cost function: f(x,y) = x^2 + y^2 (A simple bowl)
  // Gradient: dx = 2x, dy = 2y
  const costFunction = (x: number, y: number) => x * x + y * y;
  const gradient = (x: number, y: number) => ({ dx: 2 * x, dy: 2 * y });

  const reset = () => {
    setIsPlaying(false);
    const startX = (Math.random() - 0.5) * 8; // -4 to 4
    const startY = (Math.random() - 0.5) * 8;
    setPosition({ x: startX, y: startY });
    setHistory([{ x: startX, y: startY, z: costFunction(startX, startY) }]);
    setIteration(0);
  };

  // Init
  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPosition(prev => {
        const grad = gradient(prev.x, prev.y);
        const newX = prev.x - learningRate * grad.dx;
        const newY = prev.y - learningRate * grad.dy;
        
        // Convergence check
        if (Math.abs(newX - prev.x) < 0.001 && Math.abs(newY - prev.y) < 0.001) {
            setIsPlaying(false);
            return prev;
        }

        const newPos = { x: newX, y: newY };
        const newZ = costFunction(newX, newY);
        
        setHistory(h => [...h, { ...newPos, z: newZ }]);
        setIteration(i => i + 1);
        
        return newPos;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, learningRate]);

  // Generate Surface Data
  const range = Array.from({ length: 21 }, (_, i) => -5 + i * 0.5);
  const zData = range.map(y => range.map(x => costFunction(x, y)));

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-[600px] relative">
        <Plot
          data={[
            {
              z: zData,
              x: range,
              y: range,
              type: 'surface',
              colorscale: 'Viridis',
              opacity: 0.8,
              showscale: false,
              contours: {
                z: { show: true, usecolormap: true, highlightcolor: "white", project: { z: true } }
              }
            } as Partial<Data>,
            {
              x: history.map(p => p.x),
              y: history.map(p => p.y),
              z: history.map(p => p.z),
              type: 'scatter3d',
              mode: 'lines+markers',
              marker: { size: 4, color: 'white' },
              line: { color: 'white', width: 2 },
              name: 'Sti'
            } as Partial<Data>,
            {
              x: [position.x],
              y: [position.y],
              z: [costFunction(position.x, position.y)],
              type: 'scatter3d',
              mode: 'markers',
              marker: { size: 10, color: '#ec4899' }, // Pink ball
              name: 'Nåværende'
            } as Partial<Data>
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
                xaxis: { title: 'Parameter W1', color: '#94a3b8' },
                yaxis: { title: 'Parameter W2', color: '#94a3b8' },
                zaxis: { title: 'Cost (Feil)', color: '#94a3b8' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
            },
            showlegend: false,
          } as Partial<Layout>}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
          config={{ displayModeBar: false }}
        />
        
        <div className="absolute bottom-6 left-6 right-6 flex gap-4 items-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-3 rounded-xl flex items-center gap-2 font-medium transition ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
            >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Pause' : 'Start Læring'}
            </button>
            
            <button
                onClick={reset}
                className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
            >
                <RefreshCw className="w-5 h-5" />
            </button>

            <div className="flex-1 px-4">
                <label className="text-xs text-gray-400 mb-1 block">Learning Rate (α): {learningRate}</label>
                <input 
                    type="range" 
                    min="0.01" 
                    max="0.5" 
                    step="0.01" 
                    value={learningRate} 
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" /> Trening Status
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 uppercase mb-1">Iterasjon</div>
                    <div className="text-2xl font-mono text-white">{iteration}</div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 uppercase mb-1">Cost (Loss)</div>
                    <div className="text-2xl font-mono text-white">{costFunction(position.x, position.y).toFixed(4)}</div>
                </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                <div className="text-xs text-primary mb-1 uppercase">Nåværende posisjon</div>
                <div className="font-mono text-white">
                    W1: {position.x.toFixed(3)}, W2: {position.y.toFixed(3)}
                </div>
            </div>
        </div>

        <div className="bg-surface/40 border border-white/5 rounded-3xl p-6">
            <h4 className="font-semibold text-white mb-2">Teorien bak</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Vi ser etter det dypeste punktet i landskapet (lavest feil). Vi finner veien ved å ta steg i motsatt retning av gradienten (bratteste bakke).
            </p>
            <div className="bg-white/5 p-3 rounded-lg text-sm font-mono text-gray-300">
                <Latex>{`$\\theta_{ny} = \\theta_{gammel} - \\alpha \\cdot \\nabla J(\\theta)$`}</Latex>
            </div>
            <ul className="mt-4 text-sm text-gray-400 space-y-2 list-disc list-inside">
                <li><span className="text-white">θ</span>: Parametere (posisjon)</li>
                <li><span className="text-white">α</span>: Learning Rate (steglengde)</li>
                <li><span className="text-white">∇J</span>: Gradienten (retning)</li>
            </ul>
        </div>
      </div>
    </div>
  );
};
