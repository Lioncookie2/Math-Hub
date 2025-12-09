import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { Trash2, MousePointerClick, TrendingUp } from 'lucide-react';
import Latex from 'react-latex-next';

interface Point {
  x: number;
  y: number;
}

export const LinearRegressionLab: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 6 },
  ]);
  
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(0);
  const [mse, setMse] = useState(0);

  // Least Squares Calculation
  useEffect(() => {
    if (points.length < 2) {
      setSlope(0);
      setIntercept(0);
      setMse(0);
      return;
    }

    const n = points.length;
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    setSlope(m);
    setIntercept(c);

    // Calculate MSE
    const error = points.reduce((acc, p) => {
      const pred = m * p.x + c;
      return acc + Math.pow(p.y - pred, 2);
    }, 0);
    setMse(error / n);

  }, [points]);

  const addRandomPoint = () => {
    setPoints(prev => [...prev, { 
        x: Math.round(Math.random() * 10 * 10) / 10, 
        y: Math.round(Math.random() * 10 * 10) / 10 
    }]);
  };

  const reset = () => setPoints([]);

  // Generate Line Data
  const lineX = [0, 10];
  const lineY = [intercept, slope * 10 + intercept];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-[500px] relative">
        <Plot
          data={[
            {
              x: points.map(p => p.x),
              y: points.map(p => p.y),
              mode: 'markers',
              type: 'scatter',
              marker: { color: '#38bdf8', size: 12, line: { color: '#fff', width: 2 } },
              name: 'Datapunkter'
            },
            {
              x: lineX,
              y: lineY,
              mode: 'lines',
              type: 'scatter',
              line: { color: '#ec4899', width: 4 },
              name: 'Regresjonslinje'
            } as Partial<Data>
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 40, r: 20, b: 40, t: 20 },
            xaxis: { 
                range: [0, 10], 
                title: 'X (Input)', 
                color: '#94a3b8', 
                gridcolor: 'rgba(255,255,255,0.1)',
                zerolinecolor: 'rgba(255,255,255,0.2)'
            },
            yaxis: { 
                range: [0, 10], 
                title: 'Y (Target)', 
                color: '#94a3b8', 
                gridcolor: 'rgba(255,255,255,0.1)',
                zerolinecolor: 'rgba(255,255,255,0.2)'
            },
            showlegend: false,
            hovermode: 'closest'
          } as Partial<Layout>}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
          config={{ displayModeBar: false }}
        />
        
        <div className="absolute top-4 right-4 flex gap-2">
            <button 
                onClick={addRandomPoint}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-sm transition"
                title="Legg til tilfeldig punkt"
            >
                <MousePointerClick className="w-5 h-5" />
            </button>
            <button 
                onClick={reset}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg backdrop-blur-sm transition"
                title="Fjern alle punkter"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" /> Resultater
            </h3>
            
            <div className="space-y-4">
                <div>
                    <div className="text-sm text-gray-400 mb-1">Likning (Model)</div>
                    <div className="text-2xl font-mono text-white bg-black/20 p-3 rounded-xl border border-white/5">
                        <Latex>{`$y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}$`}</Latex>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 uppercase">Stigningstall (m)</div>
                        <div className="text-xl font-bold text-secondary">{slope.toFixed(3)}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 uppercase">Skjæringspunkt (c)</div>
                        <div className="text-xl font-bold text-primary">{intercept.toFixed(3)}</div>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-400 mb-1">Feil (MSE - Mean Squared Error)</div>
                    <div className="text-lg font-mono text-red-300 bg-red-900/10 p-3 rounded-xl border border-red-500/20">
                        {mse.toFixed(4)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Dette tallet forteller hvor godt linjen passer til punktene. Lavere er bedre.
                    </p>
                </div>
            </div>
        </div>

        <div className="bg-surface/40 border border-white/5 rounded-3xl p-6">
            <h4 className="font-semibold text-white mb-2">Hvordan virker det?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
                Vi bruker <strong>Minste Kvadraters Metode</strong>. Matematikken prøver å finne den linjen som minimerer summen av kvadratene av avstandene (feilen) fra hvert punkt ned til linjen.
            </p>
            <div className="mt-4 p-2 bg-white/5 rounded text-xs font-mono text-gray-300">
                <Latex>{`$J(m, c) = \\frac{1}{n} \\sum (y_i - (mx_i + c))^2$`}</Latex>
            </div>
        </div>
      </div>
    </div>
  );
};
