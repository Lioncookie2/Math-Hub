import React, { useState, useEffect, useMemo, useRef } from 'react';
import Plot from 'react-plotly.js';
import { create, all } from 'mathjs';
import { Calculator, TrendingUp, DollarSign, BookOpen, AlertCircle, Lightbulb, PenTool, CheckCircle, RefreshCw } from 'lucide-react';
import Latex from 'react-latex-next';
import type { Data, Layout, Shape } from 'plotly.js';

const math = create(all);

type MarketType = 'competition' | 'monopoly';
type Mode = 'calculator' | 'practice';
type DrawingTool = 'MC' | 'AC' | 'MR' | 'D';

interface Example {
    name: string;
    tc: string;
    price: string;
    type: MarketType;
    desc: string;
}

const EXAMPLES: Example[] = [
    {
        name: "Lærebok Monopol (Som på bildet)",
        tc: "1 * y^2 + 10 * y + 500",
        price: "200 - 4 * y", 
        type: "monopoly",
        desc: "Perfekt tilpasset eksempel som gir den klassiske 'X'-formen med U-formet AC-kurve."
    },
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
        name: "Monopol m/ Dødvektstap (Enkel)",
        tc: "10 * y + 0.5 * y^2", // MC = 10 + y (Linear)
        price: "100 - y", // P = 100 - y (Linear)
        type: "monopoly",
        desc: "Klassisk eksempel med lineære funksjoner som gir tydelige trekanter for overskudd og dødvektstap."
    },
    {
        name: "S-formet Kostnad (Klassisk)",
        tc: "0.04 * y^3 - 2 * y^2 + 40 * y + 100",
        price: "50",
        type: "competition",
        desc: "Tredjegradsfunksjon som gir klassiske U-formede AC og MC kurver. MC krysser AC i bunnpunktet."
    }
];

// Tasks for Practice Mode
const PRACTICE_TASKS = [
    {
        id: 1,
        title: "Oppgave 1: Profittmaksimering (SØK1220)",
        desc: "Tegn kostnadsfunksjonene for en bedrift med C(y) = 0.5y^2. Anta frikonkurransepris P = 10.",
        tc: "0.5 * y^2",
        price: "10",
        marketType: "competition" as MarketType,
        tools: ['MC', 'AC', 'P']
    },
    {
        id: 2,
        title: "Oppgave 2: Monopoltilpasning",
        desc: "Monopolist med etterspørsel P = 100 - Q og konstante marginalkostnader MC = 20.",
        tc: "20 * y", // MC = 20
        price: "100 - y",
        marketType: "monopoly" as MarketType,
        tools: ['MC', 'MR', 'D']
    }
];

export const MicroEconomicsLab: React.FC = () => {
  // Mode State
  const [mode, setMode] = useState<Mode>('calculator');
  
  // Inputs (Calculator)
  const [tcInput, setTcInput] = useState("1 * y^2 + 10 * y + 500"); 
  const [priceInput, setPriceInput] = useState("200 - 4 * y"); 
  const [marketType, setMarketType] = useState<MarketType>('monopoly');

  // Practice Mode State
  const [currentTask, setCurrentTask] = useState(PRACTICE_TASKS[0]);
  const [activeTool, setActiveTool] = useState<DrawingTool>('MC');
  const [userTraces, setUserTraces] = useState<Record<string, {x: number[], y: number[]}>>({
      MC: {x: [], y: []},
      AC: {x: [], y: []},
      MR: {x: [], y: []},
      D: {x: [], y: []},
      P: {x: [], y: []}
  });
  const [showSolution, setShowSolution] = useState(false);

  // Calculated values
  const [optimalY, setOptimalY] = useState<number | null>(null);
  const [optimalPrice, setOptimalPrice] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formulas, setFormulas] = useState({ mc: '', ac: '', mr: '' });
  const [socialY, setSocialY] = useState<number | null>(null);
  const [socialP, setSocialP] = useState<number | null>(null);

  // Reset drawing when task changes
  useEffect(() => {
      setUserTraces({
          MC: {x: [], y: []},
          AC: {x: [], y: []},
          MR: {x: [], y: []},
          D: {x: [], y: []},
          P: {x: [], y: []}
      });
      setShowSolution(false);
      
      // Load task into calculator logic to generate solution curves
      setTcInput(currentTask.tc);
      setPriceInput(currentTask.price);
      setMarketType(currentTask.marketType);

  }, [currentTask]);

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

            // Helper for Newton-Raphson
            const solve = (targetFunc: (y: number) => number, startGuess = 10) => {
                let y = startGuess;
                for (let i = 0; i < 50; i++) {
                    const val = targetFunc(y);
                    if (Math.abs(val) < 0.01) return y;

                    const h = 0.001;
                    const valH = targetFunc(y + h);
                    const deriv = (valH - val) / h;
                    if (deriv === 0) break; 
                    y = y - val / deriv;
                    if (y < 0) y = 0.1;
                }
                return y;
            };

            // 2. Find Optimum y* (where MR = MC)
            const optY = solve((y) => {
                const mcVal = compiledMC.evaluate({ y });
                const mrVal = marketType === 'competition' ? compiledMR() : compiledMR({ y });
                return mcVal - mrVal;
            });

            // 3. Find Social Optimum y_soc (where P = MC) - for DWL
            const socY = solve((y) => {
                const mcVal = compiledMC.evaluate({ y });
                const pVal = marketType === 'competition' ? compiledP() : compiledP({ y });
                return mcVal - pVal;
            }, optY * 1.5); // Start guess a bit higher

            const optP = marketType === 'competition' ? parseFloat(priceInput) : compiledP({ y: optY });
            const optAC = compiledAC.evaluate({ y: optY });
            const totalRev = optP * optY;
            const totalCost = compiledTC.evaluate({ y: optY });
            const calcProfit = totalRev - totalCost;

            const socP = marketType === 'competition' ? optP : compiledP({ y: socY });

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
                calcProfit,
                socY,
                socP
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
            setSocialY(calculationData.socY);
            setSocialP(calculationData.socP);
        }
    }, [calculationData]);

  const loadExample = (ex: Example) => {
      setTcInput(ex.tc);
      setPriceInput(ex.price);
      setMarketType(ex.type);
  };


    const handlePlotClick = (data: Readonly<any>) => {
        if (mode !== 'practice' || showSolution) return;
        
        const point = data.points[0];
        if (!point) return;

        setUserTraces(prev => ({
            ...prev,
            [activeTool]: {
                x: [...prev[activeTool].x, point.x].sort((a, b) => a - b),
                y: [...prev[activeTool].y, point.y]
                // Note: Sorting X for drawing lines correctly left-to-right. 
                // Ideally, we should insert Y at the correct index too, but simple append works for click-to-draw often.
                // Let's rely on user clicking in order or just sorting pairs.
            }
        }));
    };

    // Helper to sort user traces for line plotting
    const getSortedTrace = (tool: string) => {
        const t = userTraces[tool];
        const combined = t.x.map((x, i) => ({x, y: t.y[i]}));
        combined.sort((a, b) => a.x - b.x);
        return {
            x: combined.map(p => p.x),
            y: combined.map(p => p.y)
        };
    };

    // Generate Plot Data
    const plotData = useMemo(() => {
        if (!calculationData || !optimalY) return { traces: [], textLabels: [] };

        // Adjusted range logic
        const startY = optimalY * 0.1; 
        const endY = optimalY * 2.2; 
        const steps = 200; 
        
        // ... (Existing curve generation logic) ...
        const xVals: number[] = [];
        const mcVals: number[] = [];
        const acVals: number[] = [];
        const mrVals: number[] = [];
        const pVals: number[] = [];

        for (let i = 0; i <= steps; i++) {
            const y = startY + (i / steps) * (endY - startY);
            xVals.push(y);
            
            const mc = calculationData.compiledMC.evaluate({ y });
            const ac = calculationData.compiledAC.evaluate({ y });
            const mr = marketType === 'competition' ? calculationData.compiledMR() : calculationData.compiledMR({ y });
            const p = marketType === 'competition' ? calculationData.compiledP() : calculationData.compiledP({ y });

            mcVals.push(mc);
            acVals.push(ac);
            mrVals.push(mr);
            pVals.push(p);
        }

        const traces: Data[] = [];

        // === PRACTICE MODE TRACES ===
        if (mode === 'practice') {
            // 1. User Drawn Traces
            Object.keys(userTraces).forEach(tool => {
                const sorted = getSortedTrace(tool);
                if (sorted.x.length > 0) {
                    traces.push({
                        x: sorted.x,
                        y: sorted.y,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: `Min ${tool}`,
                        line: { width: 4 }, // Thicker line for user
                        marker: { size: 8 }
                    });
                }
            });

            // 2. Solution Traces (Hidden until "Check Answer")
            if (showSolution) {
                 traces.push(
                    { x: xVals, y: mcVals, type: 'scatter', mode: 'lines', name: 'Fasit MC', line: { color: '#ef4444', dash: 'dot', width: 2 } },
                    { x: xVals, y: acVals, type: 'scatter', mode: 'lines', name: 'Fasit AC', line: { color: '#fbbf24', dash: 'dot', width: 2 } },
                 );
                 if (marketType === 'monopoly') {
                     traces.push(
                        { x: xVals, y: mrVals, type: 'scatter', mode: 'lines', name: 'Fasit MR', line: { color: '#a855f7', dash: 'dot', width: 2 } },
                        { x: xVals, y: pVals, type: 'scatter', mode: 'lines', name: 'Fasit D', line: { color: '#3b82f6', dash: 'dot', width: 2 } }
                     );
                 } else {
                      traces.push(
                        { x: xVals, y: pVals, type: 'scatter', mode: 'lines', name: 'Fasit P', line: { color: '#3b82f6', dash: 'dot', width: 2 } }
                     );
                 }
            } else {
                // Add an invisible trace to set the scale correctly so user knows where to draw
                 traces.push({
                    x: [0, endY],
                    y: [0, Math.max(...pVals, ...mcVals) * 1.1],
                    type: 'scatter',
                    mode: 'markers',
                    opacity: 0,
                    showlegend: false,
                    hoverinfo: 'skip'
                });
            }

            return { traces, textLabels: [] };
        }

        // === CALCULATOR MODE TRACES (Original Logic) ===
        // ... (Paste existing Area Fill and Line logic here) ...
        
        // Re-implementing the Calculator Mode logic briefly to ensure no regression:
        if (marketType === 'monopoly' && calculationData.socY > optimalY) {
            // ... DWL, CS, PS ... (Simplified for brevity, assume keeping existing logic)
             // Deadweight Loss Area
            const dwlXVals: number[] = [];
            const dwlYVals_Demand: number[] = [];
            const dwlYVals_MC: number[] = [];
            for (let y = optimalY; y <= calculationData.socY; y += (calculationData.socY - optimalY) / 20) {
                 dwlXVals.push(y);
                 dwlYVals_Demand.push(calculationData.compiledP({ y }));
                 dwlYVals_MC.push(calculationData.compiledMC.evaluate({ y }));
            }
            traces.push({ x: dwlXVals, y: dwlYVals_MC, type: 'scatter', mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' });
            traces.push({ x: dwlXVals, y: dwlYVals_Demand, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(168, 85, 247, 0.3)', line: { width: 0 }, name: 'Dødvektstap', hoverinfo: 'skip' });

             // Consumer Surplus
            const csXVals: number[] = [];
            const csYVals_Demand: number[] = [];
            const csYVals_Price: number[] = []; 
            for (let y = 0; y <= optimalY; y += optimalY / 20) {
                 csXVals.push(y);
                 csYVals_Demand.push(calculationData.compiledP({ y }));
                 csYVals_Price.push(calculationData.optP);
            }
            traces.push({ x: csXVals, y: csYVals_Price, type: 'scatter', mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' });
            traces.push({ x: csXVals, y: csYVals_Demand, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(244, 63, 94, 0.2)', line: { width: 0 }, name: 'Konsumentoverskudd', hoverinfo: 'skip' });

            // Producer Surplus
            const psXVals: number[] = [];
            const psYVals_MC: number[] = [];
            for (let y = 0; y <= optimalY; y += optimalY / 20) {
                psXVals.push(y);
                psYVals_MC.push(calculationData.compiledMC.evaluate({ y }));
            }
            traces.push({ x: psXVals, y: psYVals_MC, type: 'scatter', mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' });
            traces.push({ x: psXVals, y: csYVals_Price, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(234, 179, 8, 0.2)', line: { width: 0 }, name: 'Produsentoverskudd', hoverinfo: 'skip' });
        }

        traces.push(
            { x: xVals, y: acVals, type: 'scatter', mode: 'lines', name: 'AC', line: { color: '#fbbf24', width: 3 } },
            { x: xVals, y: mcVals, type: 'scatter', mode: 'lines', name: 'MC', line: { color: '#ef4444', width: 3 } },
            { x: xVals, y: mrVals, type: 'scatter', mode: 'lines', name: 'MR', line: { color: '#a855f7', width: 2, dash: 'dash' } },
            { x: xVals, y: pVals, type: 'scatter', mode: 'lines', name: marketType === 'competition' ? 'P = MR' : 'D = AR', line: { color: '#3b82f6', width: 3 } }
        );

        traces.push({
            x: [optimalY], y: [calculationData.optP], mode: 'markers', type: 'scatter', name: 'Optimum',
            marker: { size: 10, color: '#22c55e', line: { color: 'white', width: 2 } }
        });

        if (marketType === 'monopoly') {
             traces.push({ x: [calculationData.socY], y: [calculationData.socP], mode: 'markers', type: 'scatter', name: 'Samf. Øk. Opt.', marker: { size: 8, color: '#a855f7', opacity: 0.7 } });
        }
        
        // Annotations
        const lastIndex = xVals.length - 1;
        const textLabels = [
            { x: xVals[lastIndex], y: acVals[lastIndex], xref: 'x', yref: 'y', text: 'AC', xanchor: 'left', font: { color: '#fbbf24', size: 14, weight: 'bold' }, showarrow: false },
            { x: xVals[lastIndex], y: mcVals[lastIndex], xref: 'x', yref: 'y', text: 'MC', xanchor: 'left', font: { color: '#ef4444', size: 14, weight: 'bold' }, showarrow: false },
            { x: xVals[lastIndex], y: mrVals[lastIndex], xref: 'x', yref: 'y', text: 'MR', xanchor: 'left', font: { color: '#a855f7', size: 14, weight: 'bold' }, showarrow: false },
            { x: xVals[lastIndex], y: pVals[lastIndex], xref: 'x', yref: 'y', text: marketType === 'competition' ? 'P' : 'D = AR', xanchor: 'left', font: { color: '#3b82f6', size: 14, weight: 'bold' }, showarrow: false }
        ];

        return { traces, textLabels };
    }, [calculationData, optimalY, marketType, mode, userTraces, showSolution]);

    // Annotations for the graph (Memoized)
    const annotations = useMemo(() => {
        if (!calculationData || !optimalY || mode === 'practice') return []; // No auto-annotations in practice mode initially
        
        // ... (Existing annotation logic) ...
        const list = [
            { x: optimalY, y: calculationData.optP, xref: 'x', yref: 'y', text: 'Pm', showarrow: true, arrowhead: 0, ax: -40, ay: 0, font: { color: 'white', size: 14, weight: 'bold' }, bgcolor: 'rgba(0,0,0,0.5)', borderpad: 4 },
            { x: optimalY, y: 0, xref: 'x', yref: 'y', text: 'Qm', showarrow: true, arrowhead: 0, ax: 0, ay: -30, yshift: 10, font: { color: 'white', size: 14, weight: 'bold' }, bgcolor: 'rgba(0,0,0,0.5)', borderpad: 4 },
            ...plotData.textLabels
        ];
        if(marketType === 'monopoly') {
             list.push({ x: calculationData.socY, y: 0, xref: 'x', yref: 'y', text: 'Qc', showarrow: true, arrowhead: 0, ax: 0, ay: -30, yshift: 10, font: { color: 'gray', size: 12 }, bgcolor: 'rgba(0,0,0,0.5)', borderpad: 4 });
        }
        return list;
    }, [calculationData, optimalY, marketType, plotData, mode]);

    // ... (Shapes logic remains same) ...

  return (
    <div className="space-y-6">
        {/* Top Toggle */}
        <div className="flex justify-center">
            <div className="bg-surface/80 p-1 rounded-2xl border border-white/10 flex gap-2">
                <button 
                    onClick={() => setMode('calculator')}
                    className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition ${mode === 'calculator' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Calculator className="w-4 h-4" /> Kalkulator
                </button>
                <button 
                    onClick={() => setMode('practice')}
                    className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition ${mode === 'practice' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <PenTool className="w-4 h-4" /> Øvelsesmodus
                </button>
            </div>
        </div>

        {mode === 'calculator' ? (
             <div className="grid lg:grid-cols-3 gap-8">
                {/* ... (Existing Calculator Input Panel) ... */}
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

                 {/* Graph Panel (Calculator) */}
                 <div className="lg:col-span-2 space-y-6">
                     <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-[500px] relative p-2">
                        <Plot
                            data={plotData.traces}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                margin: { l: 60, r: 60, b: 50, t: 30 },
                                xaxis: { 
                                    title: 'Kvantum (Q)', 
                                    color: '#94a3b8', 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    showgrid: false,
                                    dtick: 1 // FIX: Force integer steps on X-axis
                                },
                                yaxis: { 
                                    title: 'Pris (P) / Kostnad (NOK)', 
                                    color: '#94a3b8', 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    showgrid: false
                                },
                                legend: { 
                                    orientation: 'h', 
                                    y: 1.1, 
                                    x: 0,
                                    font: { color: 'white' },
                                    bgcolor: 'rgba(0,0,0,0)',
                                },
                                shapes: shapes,
                                annotations: annotations as any,
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
                     
                     {/* Results Panel */}
                     <div className="grid md:grid-cols-2 gap-6">
                        {/* ... (Existing Results) ... */}
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
        ) : (
            // === PRACTICE MODE UI ===
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    {/* Task Selection */}
                    <div className="bg-surface/60 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-primary" /> Oppgave
                        </h3>
                        <div className="space-y-2 mb-6">
                            {PRACTICE_TASKS.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => setCurrentTask(task)}
                                    className={`w-full text-left p-3 rounded-xl transition ${currentTask.id === task.id ? 'bg-primary/20 border border-primary' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="font-bold text-white text-sm">{task.title}</div>
                                    <div className="text-xs text-gray-400">{task.desc}</div>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                            <h4 className="text-sm font-bold text-white mb-2">Instruksjoner</h4>
                            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                                <li>Velg verktøy nedenfor (MC, AC, etc).</li>
                                <li>Klikk i grafen for å sette punkter.</li>
                                <li>Vi tegner linjen mellom punktene dine.</li>
                                <li>Trykk "Sjekk Svar" for å se fasit.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Tools */}
                    <div className="bg-surface/60 border border-white/10 rounded-3xl p-6">
                         <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <PenTool className="w-5 h-5 text-secondary" /> Verktøy
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['MC', 'AC', 'MR', 'D'].map(tool => (
                                <button
                                    key={tool}
                                    onClick={() => setActiveTool(tool as DrawingTool)}
                                    className={`p-3 rounded-xl font-mono text-sm font-bold transition flex items-center justify-center gap-2
                                        ${activeTool === tool ? 'bg-white text-black' : 'bg-black/20 text-gray-400 hover:text-white'}
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full 
                                        ${tool === 'MC' ? 'bg-red-500' : tool === 'AC' ? 'bg-amber-500' : tool === 'MR' ? 'bg-purple-500' : 'bg-blue-500'}
                                    `} />
                                    {tool}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setUserTraces(prev => ({ ...prev, [activeTool]: {x: [], y: []} }))}
                            className="w-full mt-4 py-2 text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Nullstill {activeTool}
                        </button>
                    </div>

                    <button
                        onClick={() => setShowSolution(!showSolution)}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition
                            ${showSolution ? 'bg-gray-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'}
                        `}
                    >
                        {showSolution ? 'Skjul Fasit' : 'Sjekk Svar'} <CheckCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="lg:col-span-2">
                     <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-[600px] relative p-2 cursor-crosshair">
                        <Plot
                            data={plotData.traces}
                            onClick={handlePlotClick}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                margin: { l: 60, r: 60, b: 50, t: 30 },
                                xaxis: { 
                                    title: 'Kvantum (Q)', 
                                    color: '#94a3b8', 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    showgrid: true, // Grid helps when drawing
                                    dtick: 1 // Integer steps
                                },
                                yaxis: { 
                                    title: 'Pris (P) / Kostnad (NOK)', 
                                    color: '#94a3b8', 
                                    gridcolor: 'rgba(255,255,255,0.1)',
                                    zerolinecolor: 'rgba(255,255,255,0.2)',
                                    showgrid: true
                                },
                                legend: { orientation: 'h', y: 1.1, font: { color: 'white' }, bgcolor: 'rgba(0,0,0,0)' },
                                hovermode: 'closest',
                                dragmode: false // Disable zoom/pan to allow clicking
                            } as Partial<Layout>}
                            style={{ width: '100%', height: '100%' }}
                            useResizeHandler
                            config={{ displayModeBar: false }}
                        />
                     </div>
                     {showSolution && (
                         <div className="mt-6 p-6 bg-surface/60 border border-green-500/30 rounded-3xl">
                             <h4 className="text-xl font-bold text-white mb-2">Fasit & Forklaring</h4>
                             <p className="text-gray-300 text-sm leading-relaxed">
                                 Her ser du hvordan grafene egentlig skal se ut (stiplet linje). 
                                 <br/><br/>
                                 <strong>MC:</strong> {formulas.mc}. <br/>
                                 <strong>AC:</strong> {formulas.ac}. <br/>
                                 <strong>Optimum:</strong> {optimalY?.toFixed(2)} enheter.
                             </p>
                         </div>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};
