import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Layers, Info } from 'lucide-react';

interface StackFrame {
    id: number;
    n: number;
    result?: number;
    status: 'active' | 'waiting' | 'done';
}

export function RecursionTracer() {
    const [n, setN] = useState(5);
    const [isRunning, setIsRunning] = useState(false);
    const [step, setStep] = useState(0);

    // Generer alle stegene for Fakultet-rekursjon n!
    const trace = useMemo(() => {
        const steps: { stack: StackFrame[], output: number | null }[] = [];

        function fact(currN: number, id: number): number {
            const frameId = id;

            // Push frame
            steps.push({
                stack: [...(steps[steps.length - 1]?.stack || []), { id: frameId, n: currN, status: 'active' }].map(f => ({
                    ...f, status: f.id === frameId ? 'active' : 'waiting'
                })),
                output: null
            });

            if (currN <= 1) {
                // Base case
                const res = 1;
                steps.push({
                    stack: steps[steps.length - 1].stack.map(f => f.id === frameId ? { ...f, result: res, status: 'done' } : f),
                    output: null
                });
                return res;
            }

            const subResult = fact(currN - 1, id + 1);
            const res = currN * subResult;

            // Pop frame (eller oppdater status)
            const prevSteps = steps[steps.length - 1].stack;
            steps.push({
                stack: prevSteps.filter(f => f.id !== id + 1).map(f => f.id === frameId ? { ...f, result: res, status: 'done' } : f),
                output: null
            });

            return res;
        }

        fact(n, 0);
        // Siste steg
        steps.push({ stack: [], output: steps[steps.length - 1].stack[0]?.result || 1 });
        return steps;
    }, [n]);

    useEffect(() => {
        let interval: any;
        if (isRunning && step < trace.length - 1) {
            interval = setInterval(() => {
                setStep(s => s + 1);
            }, 1000);
        } else {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, step, trace.length]);

    const currentStack = trace[step].stack;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <RotateCcw className="text-purple-500 w-8 h-8" />
                            Recursion Tracer
                        </h2>
                        <p className="text-gray-400">Se hvordan stack-frames bygges opp under rekursive funksjonskall.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-black/20 rounded-xl border border-white/10 flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-500">n =</span>
                            <input
                                type="number"
                                value={n}
                                min="1"
                                max="8"
                                onChange={(e) => {
                                    setN(parseInt(e.target.value) || 1);
                                    setStep(0);
                                    setIsRunning(false);
                                }}
                                className="bg-transparent text-white font-mono w-12 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            disabled={step === trace.length - 1}
                            className={`p-3 rounded-xl transition-all ${isRunning ? 'bg-orange-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                        >
                            {isRunning ? <Pause /> : <Play />}
                        </button>
                        <button
                            onClick={() => { setStep(0); setIsRunning(false); }}
                            className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10"
                        >
                            <RotateCcw />
                        </button>
                    </div>
                </div>

                {/* Visualizer Area */}
                <div className="grid md:grid-cols-2 gap-12 min-h-[400px]">
                    {/* Stack Visualization */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
                            <span>Call Stack (Minne)</span>
                            <span>Steg {step} / {trace.length - 1}</span>
                        </div>
                        <div className="flex flex-col-reverse gap-3 p-6 bg-black/20 rounded-3xl border border-white/5 min-h-[350px] relative overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                {currentStack.map((frame) => (
                                    <motion.div
                                        key={frame.id}
                                        layout
                                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                        className={`p-4 rounded-2xl border-2 flex items-center justify-between shadow-xl ${frame.status === 'active'
                                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                            : frame.status === 'done'
                                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${frame.status === 'active' ? 'bg-purple-500' : 'bg-white/10'
                                                }`}>
                                                {frame.id}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">fact({frame.n})</div>
                                                <div className="text-[10px] opacity-60 font-mono">ADR: 0x{((frame.id + 1) * 1234).toString(16).toUpperCase()}</div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {frame.result !== undefined ? (
                                                <div className="font-mono font-bold text-lg animate-pulse">= {frame.result}</div>
                                            ) : (
                                                <div className="text-[10px] italic">Venter...</div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {step === trace.length - 1 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90 z-20"
                                >
                                    <div className="bg-white text-green-600 w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                                        <Layers className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Ferdig!</h3>
                                    <p className="text-white/80 font-mono text-xl">{n}! = {trace[step].output}</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Execution Log & Theory */}
                    <div className="space-y-6">
                        <div className="bg-surface-light border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-400" />
                                Hva skjer i koden?
                            </h3>
                            <div className="bg-black/40 rounded-xl p-4 font-mono text-sm leading-relaxed">
                                <div className={step > 0 && currentStack.length > 0 && currentStack[currentStack.length - 1].status === 'active' ? 'text-purple-400 bg-purple-400/10 rounded px-1' : 'text-gray-500'}>
                                    {`if (n <= 1) return 1;`}
                                </div>
                                <div className={currentStack.length > 0 && currentStack[currentStack.length - 1].status === 'done' ? 'text-green-400 bg-green-400/10 rounded px-1' : 'text-gray-300'}>
                                    {`return n * fact(n - 1);`}
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm italic">
                                {currentStack.length > 0
                                    ? `Nåværende kall: fact(${currentStack[currentStack.length - 1].n}).`
                                    : step === trace.length - 1
                                        ? "Resultatet er returnert til main."
                                        : "Trykk play for å starte."}
                            </p>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Pro-tip
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Hver gang en funksjon kaller seg selv, opprettes en ny **Stack Frame**.
                                Denne inneholder egne lokale variabler og retur-adressen. Hvis du kaller for mange,
                                får du den berømte feilmeldingen `StackOverflowError`.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
