import { useState, useMemo } from 'react';
import { Shield, Target, Calculator } from 'lucide-react';

export function PValueVisualizer() {
    const [zScore, setZScore] = useState(1.96);
    const [alpha, setAlpha] = useState(0.05);

    const pValue = useMemo(() => {
        // Enkel approksimering av p-verdi for normalfordeling (two-tailed)
        const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
        const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
        const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return 2 * prob;
    }, [zScore]);

    const isSignificant = pValue < alpha;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Target className="text-orange-500 w-8 h-8" />
                            P-Value Visualizer
                        </h2>
                        <p className="text-gray-400">Forstå signifikansnivå og hypotesetesting.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Controls */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-bold text-gray-400">Test-observator (Z): {zScore.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="0" max="4" step="0.01" value={zScore}
                                    onChange={(e) => setZScore(parseFloat(e.target.value))}
                                    className="w-full accent-orange-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-bold text-gray-400">Signifikansnivå (α): {alpha}</span>
                                </div>
                                <div className="flex gap-2">
                                    {[0.1, 0.05, 0.01].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setAlpha(v)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${alpha === v ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
                                        >
                                            {v * 100}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border-2 transition-all ${isSignificant ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSignificant ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {isSignificant ? <Shield className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isSignificant ? 'text-green-400' : 'text-red-400'}`}>
                                        {isSignificant ? 'Forkast H₀' : 'Behold H₀'}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {isSignificant
                                            ? `P-verdi (${pValue.toFixed(4)}) < α (${alpha}). Resultatet er signifikant.`
                                            : `P-verdi (${pValue.toFixed(4)}) > α (${alpha}). Ikke nok bevis.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="bg-black/20 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center space-y-8">
                        <div className="relative w-full h-40 flex items-end justify-center gap-[2px]">
                            {/* Enkel normalfordelings-kurve visualisering */}
                            {Array.from({ length: 50 }).map((_, i) => {
                                const x = (i - 25) / 10;
                                const y = Math.exp(-x * x / 2);
                                const isCritical = Math.abs(x) > zScore;
                                return (
                                    <div
                                        key={i}
                                        style={{ height: `${y * 100}%` }}
                                        className={`flex-1 rounded-t-sm transition-colors ${isCritical ? 'bg-orange-500' : 'bg-white/10'}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-4xl font-mono font-bold text-white">p = {pValue.toFixed(4)}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Sannsynlighet for ekstrem verdi</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
