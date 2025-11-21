import React, { useState, useEffect } from 'react';
import { all, create } from 'mathjs';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { motion } from 'framer-motion';
import { Calculator, AlertCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const math = create(all);

interface HessianResult {
  fx: string;
  fy: string;
  fxx: string;
  fyy: string;
  fxy: string;
  fyx: string;
  det: string; // Determinant expression
  isConstant: boolean;
  detValue?: number; // If evaluated or constant
  fxxValue?: number; // If evaluated or constant
  classification?: string;
}

interface SurfaceGrid {
  x: number[];
  y: number[];
  z: number[][];
}

export const HessianCalculator: React.FC = () => {
  const [mode, setMode] = useState<'expression' | 'manual'>('expression');
  const [expression, setExpression] = useState('x^2 + y^2');
  const [evalPoint, setEvalPoint] = useState({ x: 0, y: 0 });
  const [result, setResult] = useState<HessianResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate Hessian based on expression
  const calculateExpression = () => {
    try {
      setError(null);
      const node = math.parse(expression);
      
      // First order partials
      const fxNode = math.derivative(node, 'x');
      const fyNode = math.derivative(node, 'y');

      // Second order partials
      const fxxNode = math.derivative(fxNode, 'x');
      const fxyNode = math.derivative(fxNode, 'y');
      const fyxNode = math.derivative(fyNode, 'x'); // Should be same as fxy for smooth functions
      const fyyNode = math.derivative(fyNode, 'y');

      // Determinant: D = fxx * fyy - (fxy)^2
      const detNode = math.parse(`(${fxxNode.toString()}) * (${fyyNode.toString()}) - (${fxyNode.toString()})^2`);
      const simplifiedDet = math.simplify(detNode);

      // Evaluate at point
      const scope = { x: evalPoint.x, y: evalPoint.y };
      const fxxVal = fxxNode.evaluate(scope);
      const detVal = simplifiedDet.evaluate(scope);

      let classification = "Ubestemt";
      if (detVal > 0) {
        if (fxxVal > 0) classification = "Lokalt Minimum (Smil)";
        else if (fxxVal < 0) classification = "Lokalt Maksimum (Sur)";
      } else if (detVal < 0) {
        classification = "Sadelpunkt";
      } else {
        classification = "Ingen konklusjon (D = 0)";
      }

      setResult({
        fx: fxNode.toTex(),
        fy: fyNode.toTex(),
        fxx: fxxNode.toTex(),
        fyy: fyyNode.toTex(),
        fxy: fxyNode.toTex(),
        fyx: fyxNode.toTex(),
        det: simplifiedDet.toTex(),
        isConstant: false, // TODO: check if symbols exist
        detValue: detVal,
        fxxValue: fxxVal,
        classification
      });

    } catch (err) {
      setError("Kunne ikke beregne. Sjekk syntaksen.");
      console.error(err);
    }
  };

  // Effect to auto-calc when inputs change (debounced could be better, but direct is fine for simple expr)
  useEffect(() => {
    if (mode === 'expression' && expression) {
      const timer = setTimeout(calculateExpression, 500);
      return () => clearTimeout(timer);
    }
  }, [expression, evalPoint, mode]);

  // Generate data for 3D plot
  const getPlotData = (): SurfaceGrid | null => {
    if (mode !== 'expression' || !expression) return null;
    
    try {
      const expr = math.compile(expression);
      const range = Array.from({ length: 21 }, (_, idx) => -5 + idx * 0.5);

      const zValues = range.map((x) =>
        range.map((y) => expr.evaluate({ x, y })),
      );

      return { x: range, y: range, z: zValues };
    } catch (e) {
      return null;
    }
  };

  const plotData = getPlotData();

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('expression')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'expression' 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Funksjonsuttrykk
            </button>
            <button
              onClick={() => setMode('manual')} // Not fully implemented yet
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'manual' 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Manuelle Deriverte
            </button>
          </div>

          {mode === 'expression' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Funksjon f(x, y)</label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors font-mono text-lg"
                  placeholder="f.eks. x^2 + y^2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Evaluer X</label>
                  <input
                    type="number"
                    value={evalPoint.x}
                    onChange={(e) => setEvalPoint(p => ({ ...p, x: Number(e.target.value) }))}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Evaluer Y</label>
                  <input
                    type="number"
                    value={evalPoint.y}
                    onChange={(e) => setEvalPoint(p => ({ ...p, y: Number(e.target.value) }))}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-6"
          >
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" /> Resultater
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-background/30 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Partiellderiverte (1. orden)</p>
                <div className="flex flex-wrap gap-4 text-lg">
                  <div><Latex>{`$f_x = ${result.fx}$`}</Latex></div>
                  <div><Latex>{`$f_y = ${result.fy}$`}</Latex></div>
                </div>
              </div>

              <div className="p-4 bg-background/30 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Hessian Matrise komponenter</p>
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <div><Latex>{`$f_{xx} = ${result.fxx}$`}</Latex></div>
                  <div><Latex>{`$f_{xy} = ${result.fxy}$`}</Latex></div>
                  <div><Latex>{`$f_{yx} = ${result.fyx}$`}</Latex></div>
                  <div><Latex>{`$f_{yy} = ${result.fyy}$`}</Latex></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-900/10 rounded-xl border border-primary/20">
                <p className="text-xs text-primary/80 mb-1 uppercase tracking-wider">Determinant & Klassifisering</p>
                <div className="space-y-2">
                  <div className="text-xl font-mono">
                    <Latex>{`$D(x,y) = ${result.det}$`}</Latex>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-400">
                      Evaluert i ({evalPoint.x}, {evalPoint.y}): <br/>
                      D = <span className="text-white font-bold">{result.detValue?.toFixed(4)}</span> <br/>
                      f_xx = <span className="text-white font-bold">{result.fxxValue?.toFixed(4)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white block">{result.classification}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Visuals Section */}
      <div className="h-[500px] lg:h-auto min-h-[500px] bg-surface/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden relative">
         {plotData ? (
           <Plot
             data={[
               {
                 x: plotData.x,
                 y: plotData.y,
                 z: plotData.z,
                 type: 'surface',
                 colorscale: 'Viridis',
                 showscale: false,
                 contours: {
                   z: { show: true, usecolormap: true, highlightcolor: 'limegreen', project: { z: true } },
                 },
               } as Partial<Data>,
             ]}
             layout={
               {
                 autosize: true,
                 paper_bgcolor: 'rgba(0,0,0,0)',
                 plot_bgcolor: 'rgba(0,0,0,0)',
                 margin: { l: 0, r: 0, b: 0, t: 0 },
                 scene: {
                   xaxis: { title: 'X', color: '#fff' },
                   yaxis: { title: 'Y', color: '#fff' },
                   zaxis: { title: 'Z', color: '#fff' },
                   camera: {
                     eye: { x: 1.5, y: 1.5, z: 1.5 },
                   },
                 },
               } as Partial<Layout>
             }
             style={{ width: '100%', height: '100%' }}
             useResizeHandler
             config={{ displayModeBar: false }}
           />
         ) : (
           <div className="absolute inset-0 flex items-center justify-center text-gray-500">
             Skriv inn et gyldig uttrykk for å se graf
           </div>
         )}
         
         <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-gray-300 pointer-events-none">
            Interaktiv 3D-visning
         </div>
      </div>
    </div>
  );
};

