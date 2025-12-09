import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { create, all } from 'mathjs';
import { Calculator, TrendingUp, DollarSign, BookOpen, AlertCircle, Lightbulb } from 'lucide-react';
import Latex from 'react-latex-next';
import type { Data, Layout, Shape } from 'plotly.js';

const math = create(all);

type MarketType = 'competition' | 'monopoly';

interface Example {
    name: string;
    tc: string;
    price: string;
    type: MarketType;
    desc: string;
}

const EXAMPLES: Example[] = [
    {
        name: "Standard Frikonkurranse",
        tc: "0.5 * y^2 + 10 * y + 200",
        price: "60",
        type: "competition",
        desc: "En bedrift med økende grensekostnader i et marked med fast pris. Viser typisk tilpasning P = MC."
    },
    {
        name: "Monopol (Lineær Etterspørsel)",
        tc: "2 * y^2 + 5 * y + 100",
        price: "200 - 3 * y", // P(y)
        type: "monopoly",
        desc: "Monopolist som møter en fallende etterspørselskurve. Tilpasning der MR = MC."
    },
    {
        name: "S-formet Kostnad (Klassisk)",
        tc: "0.04 * y^3 - 2 * y^2 + 40 * y + 100",
        price: "50",
        type: "competition",
        desc: "Tredjegradsfunksjon som gir klassiske U-formede AC og MC kurver. MC krysser AC i bunnpunktet."
    }
];

export const MicroEconomicsLab: React.FC = () => {
  // Inputs
  const [tcInput, setTcInput] = useState(EXAMPLES[0].tc); 
  const [priceInput, setPriceInput] = useState(EXAMPLES[0].price); 
  const [marketType, setMarketType] = useState<MarketType>(EXAMPLES[0].type);

  // Calculated values
  const [optimalY, setOptimalY] = useState<number | null>(null);
  const [optimalPrice, setOptimalPrice] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formulas, setFormulas] = useState({ mc: '', ac: '', mr: '' });

  // Parsing and Calculation Logic
  const calculationData = useMemo(() => {
    try {
      setError(null);

      // 1. Parse Functions
      const tcNode = math.parse(tcInput);
      const compiledTC = tcNode.compile();

      // MC = d(TC)/dy
      const mcNode = math.derivative(tcNode, 'y');
      const compiledMC = mcNode.compile();

      // AC = TC / y
      // We use a string replacement for display, actual calc handles y
      const acNode = math.parse(`(${tcInput}) / y`);
      const compiledAC = acNode.compile();

      let mrNode;
      let compiledMR;
      let compiledP; // Price function P(y)

      if (marketType === 'competition') {
        // P is constant
        const pVal = parseFloat(priceInput);
        if (isNaN(pVal)) throw new Error("For frikonkurranse må 'Pris' være et tall.");
        
        compiledP = () => pVal;
        
        // MR = P
        mrNode = math.parse(priceInput);
        compiledMR = () => pVal;
      } else {
        // Monopoly: Input is Demand Function P(Q) or P(y)
        let pStr = priceInput.replace(/Q/g, 'y');
        const demandNode = math.parse(pStr);
        compiledP = demandNode.compile().evaluate;

        // TR = P(y) * y
        const trNode = math.parse(`(${pStr}) * y`);
        // MR = d(TR)/dy
        mrNode = math.derivative(trNode, 'y');
        compiledMR = mrNode.compile().evaluate;
      }

      // 2. Find Optimum y* (where MR = MC)
      // Numerical solver (Newton-Raphson simplified)
      let y = 10; // Start guess (higher for typical econ problems)
      for (let i = 0; i < 50; i++) {
        const mcVal = compiledMC.evaluate({ y });
        const mrVal = marketType === 'competition' ? compiledMR() : compiledMR({ y });
        
        // Function to zero: f(y) = MC - MR
        const f = mcVal - mrVal;
        
        if (Math.abs(f) < 0.01) break; // Close enough

        // Numerical derivative of f (simple finite difference)
        const h = 0.001;
        const mcH = compiledMC.evaluate({ y: y + h });
        const mrH = marketType === 'competition' ? compiledMR() : compiledMR({ y: y + h });
        const df = ((mcH - mrH) - f) / h;

        y = y - f / df;
        if (y < 0) y = 0.1; // Clamp positive
      }

      const optY = y;
      const optP = marketType === 'competition' ? parseFloat(priceInput) : compiledP({ y: optY });
      const optAC = compiledAC.evaluate({ y: optY });
      const totalRev = optP * optY;
      const totalCost = compiledTC.evaluate({ y: optY });
      const calcProfit = totalRev - totalCost;

      // Update textual formulas
      setFormulas({
        mc: mcNode.toString(),
        ac: `(${tcInput}) / y`,
        mr: mrNode.toString()
      });

      return {
        compiledMC,
        compiledAC,
        compiledMR,
        compiledP,
        optY,
        optP,
        optAC,
        calcProfit
      };

    } catch (err: any) {
      console.error(err);
      // Only show error if input is somewhat complete
      if (tcInput.length > 3) {
          setError("Kunne ikke beregne. Sjekk at funksjonene er gyldige (bruk 'y' som variabel).");
      }
      return null;
    }
  }, [tcInput, priceInput, marketType]);

  // Update State Effect
  useEffect(() => {
    if (calculationData) {
      setOptimalY(calculationData.optY);
      setOptimalPrice(calculationData.optP);
      setProfit(calculationData.calcProfit);
    }
  }, [calculationData]);

  const loadExample = (ex: Example) => {
      setTcInput(ex.tc);
      setPriceInput(ex.price);
      setMarketType(ex.type);
  };


  // Generate Plot Data
  const plotData = useMemo(() => {
    if (!calculationData || !optimalY) return [];

    // Smart range detection: go a bit past optimum or typical intersection
    const range = optimalY > 0 ? optimalY * 2 : 50; 
    const steps = 100;
    const xVals: number[] = [];
    const mcVals: number[] = [];
    const acVals: number[] = [];
    const mrVals: number[] = [];
    const pVals: number[] = [];

    for (let i = 1; i <= steps; i++) {
        const y = (i / steps) * range;
        if (y <= 0) continue; // avoid div by zero

        xVals.push(y);
        
        // Evaluate
        const mc = calculationData.compiledMC.evaluate({ y });
        const ac = calculationData.compiledAC.evaluate({ y });
        const mr = marketType === 'competition' ? calculationData.compiledMR() : calculationData.compiledMR({ y });
        const p = marketType === 'competition' ? calculationData.compiledP() : calculationData.compiledP({ y });

        mcVals.push(mc);
        acVals.push(ac);
        mrVals.push(mr);
        pVals.push(p);
    }

    const traces: Data[] = [
        {
            x: xVals,
            y: acVals,
            type: 'scatter',
            mode: 'lines',
            name: 'AC (Gj.snitt kostnad)',
            line: { color: '#fbbf24', width: 3 }, // Amber
        },
        {
            x: xVals,
            y: mcVals,
            type: 'scatter',
            mode: 'lines',
            name: 'MC (Grensekostnad)',
            line: { color: '#ef4444', width: 3 }, // Red
        },
        {
            x: xVals,
            y: mrVals,
            type: 'scatter',
            mode: 'lines',
            name: 'MR (Grenseinntekt)',
            line: { color: '#a855f7', width: 2, dash: 'dash' }, // Purple
        },
        {
            x: xVals,
            y: pVals,
            type: 'scatter',
            mode: 'lines',
            name: marketType === 'competition' ? 'Pris (P = MR)' : 'Etterspørsel (D)',
            line: { color: '#3b82f6', width: 3 }, // Blue
        },
    ];

    // Add Optimum Point Marker
    traces.push({
        x: [optimalY],
        y: [calculationData.optP],
        mode: 'markers',
        type: 'scatter',
        name: 'Optimum (Likevekt)',
        marker: { size: 12, color: '#22c55e', line: { color: 'white', width: 2 } }
    });
    
    return traces;
  }, [calculationData, optimalY, marketType]);

  // Shapes for Profit Shading
  const shapes: Partial<Shape>[] = useMemo(() => {
      if (!calculationData || !optimalY) return [];
      
      const { optP, optAC } = calculationData;
      const fillColor = optP > optAC ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'; // Green if profit, Red if loss

      return [
        {
            type: 'rect',
            x0: 0,
            y0: optAC,
            x1: optimalY,
            y1: optP,
            fillcolor: fillColor,
            line: { width: 0 },
            layer: 'below'
        },
        // Dashed lines to axis
        {
            type: 'line',
            x0: optimalY, y0: 0,
            x1: optimalY, y1: optP,
            line: { color: 'gray', width: 1, dash: 'dot' }
        },
        {
            type: 'line',
            x0: 0, y0: optP,
            x1: optimalY, y1: optP,
            line: { color: 'gray', width: 1, dash: 'dot' }
        }
      ];
  }, [calculationData, optimalY]);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* 1. Input Panel */}
      <div className="space-y-6">
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" /> Parametere
            </h3>

            {/* Market Type Switch */}
            <div className="flex bg-black/20 p-1 rounded-xl">
                <button
                    onClick={() => setMarketType('competition')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${marketType === 'competition' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Frikonkurranse
                </button>
                <button
                    onClick={() => setMarketType('monopoly')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${marketType === 'monopoly' ? 'bg-secondary text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Monopol
                </button>
            </div>

            {/* Function Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 font-medium ml-1 block mb-2">Total Kostnad TC(y)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={tcInput}
                            onChange={(e) => setTcInput(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder="Eks: 0.5 * y^2 + 20 * y"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-medium ml-1 block mb-2">
                        {marketType === 'competition' ? 'Markedspris (p)' : 'Etterspørsel P(y)'}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-secondary font-mono text-sm"
                            placeholder={marketType === 'competition' ? "Eks: 80" : "Eks: 100 - 0.5 * y"}
                        />
                    </div>
                </div>
            </div>

            {/* Examples Quick Load */}
            <div>
                <label className="text-xs text-gray-500 font-medium ml-1 block mb-2">Last inn eksempel (SØK1220)</label>
                <div className="grid grid-cols-1 gap-2">
                    {EXAMPLES.map((ex) => (
                        <button
                            key={ex.name}
                            onClick={() => loadExample(ex)}
                            className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{ex.name}</span>
                                <Lightbulb className="w-3 h-3 text-yellow-500 opacity-50 group-hover:opacity-100" />
                            </div>
                            <div className="text-[10px] text-gray-500 line-clamp-1">{ex.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}
        </div>

        {/* Calculated Formulas */}
        <div className="bg-surface/40 border border-white/5 rounded-3xl p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-secondary" /> Utledede Funksjoner
            </h4>
            <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-gray-400">MC (Grensekostnad)</span>
                    <span className="text-red-300"><Latex>{`$${formulas.mc}$`}</Latex></span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-gray-400">AC (Enhetskostnad)</span>
                    <span className="text-amber-300 truncate max-w-[150px]"><Latex>{`$${formulas.ac}$`}</Latex></span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-gray-400">MR (Grenseinntekt)</span>
                    <span className="text-purple-300"><Latex>{`$${formulas.mr}$`}</Latex></span>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Graph Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-[500px] relative p-2">
            <Plot
                data={plotData}
                layout={{
                    autosize: true,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    margin: { l: 50, r: 20, b: 40, t: 30 },
                    xaxis: { 
                        title: 'Kvantum (y)', 
                        color: '#94a3b8', 
                        gridcolor: 'rgba(255,255,255,0.1)',
                        zerolinecolor: 'rgba(255,255,255,0.2)'
                    },
                    yaxis: { 
                        title: 'Pris / Kostnad (NOK)', 
                        color: '#94a3b8', 
                        gridcolor: 'rgba(255,255,255,0.1)',
                        zerolinecolor: 'rgba(255,255,255,0.2)'
                    },
                    // FIX: Legend with dark background
                    legend: { 
                        orientation: 'h', 
                        y: -0.15, 
                        font: { color: 'white' },
                        bgcolor: 'rgba(0,0,0,0.5)',
                        bordercolor: 'rgba(255,255,255,0.1)',
                        borderwidth: 1
                    },
                    shapes: shapes,
                    hovermode: 'x unified',
                    hoverlabel: {
                        bgcolor: '#1e293b',
                        bordercolor: '#334155',
                        font: { color: 'white' }
                    }
                } as Partial<Layout>}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler
                config={{ displayModeBar: false }}
            />
        </div>

        {/* 3. AI Explanation & Results */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface/60 border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" /> Optimal Tilpasning
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Optimal Produksjon (y*)</div>
                        <div className="text-3xl font-mono text-white font-bold">
                            {optimalY?.toFixed(2)} <span className="text-sm text-gray-500 font-sans font-normal">enheter</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase">Pris</div>
                            <div className="text-xl text-blue-300 font-mono">{optimalPrice?.toFixed(2)}</div>
                        </div>
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                            {profit && profit > 0 && <div className="absolute inset-0 bg-green-500/10" />}
                            {profit && profit < 0 && <div className="absolute inset-0 bg-red-500/10" />}
                            <div className="relative z-10">
                                <div className="text-xs text-gray-500 uppercase">Profitt</div>
                                <div className={`text-xl font-mono font-bold ${profit && profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {profit?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface/40 border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" /> Analyse
                </h3>
                <div className="text-sm text-gray-300 leading-relaxed space-y-2">
                    <p>
                        For å maksimere profitten, produserer vi der <strong>Grenseinntekt (MR)</strong> er lik <strong>Grensekostnad (MC)</strong>.
                    </p>
                    <div className="bg-white/5 p-2 rounded text-center font-mono text-xs my-2">
                        MC(y) = MR(y) <br/>
                        <Latex>{`$${formulas.mc} = ${marketType === 'competition' ? priceInput : formulas.mr}$`}</Latex>
                    </div>
                    <p>
                        {profit && profit > 0 
                            ? "Siden prisen er høyere enn gjennomsnittskostnaden (AC) ved dette kvantumet, går bedriften med overskudd (det skraverte grønne området)."
                            : "Siden prisen er lavere enn gjennomsnittskostnaden (AC), går bedriften med underskudd (det skraverte røde området)."
                        }
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
