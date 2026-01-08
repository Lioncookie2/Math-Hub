import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Info, Settings2 } from 'lucide-react';

export function DistributionSandbox() {
    const [type, setType] = useState<'normal' | 'binomial'>('normal');
    const [mean, setMean] = useState(0);
    const [sd, setSd] = useState(1);
    const [n, setN] = useState(20);
    const [p, setP] = useState(0.5);

    const data = useMemo(() => {
        const points = [];
        if (type === 'normal') {
            for (let x = -4; x <= 4; x += 0.1) {
                const val = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
                points.push({ x, y: val });
            }
        } else {
            for (let k = 0; k <= n; k++) {
                // Binomial coefficient
                let coeff = 1;
                for (let i = 0; i < k; i++) coeff = coeff * (n - i) / (i + 1);
                const val = coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
                points.push({ x: k, y: val });
            }
        }
        return points;
    }, [type, mean, sd, n, p]);

    const maxVal = Math.max(...data.map(d => d.y));

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="text-yellow-500 w-8 h-8" />
                            Distribution Sandbox
                        </h2>
                        <p className="text-gray-400">Utforsk sannsynlighetsfordelinger interaktivt.</p>
                    </div>

                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setType('normal')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === 'normal' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Normal
                        </button>
                        <button
                            onClick={() => setType('binomial')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === 'binomial' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Binomial
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Kontroller */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center gap-2 text-primary">
                                <Settings2 className="w-5 h-5" />
                                <h3 className="font-bold text-white">Parametere</h3>
                            </div>

                            {type === 'normal' ? (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Gjennomsnitt (μ): {mean}</span>
                                        </div>
                                        <input
                                            type="range" min="-2" max="2" step="0.1" value={mean}
                                            onChange={(e) => setMean(parseFloat(e.target.value))}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Standardavvik (σ): {sd}</span>
                                        </div>
                                        <input
                                            type="range" min="0.5" max="2" step="0.1" value={sd}
                                            onChange={(e) => setSd(parseFloat(e.target.value))}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Antall forsøk (n): {n}</span>
                                        </div>
                                        <input
                                            type="range" min="5" max="50" step="1" value={n}
                                            onChange={(e) => setN(parseInt(e.target.value))}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Sannsynlighet (p): {p.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range" min="0.1" max="0.9" step="0.05" value={p}
                                            onChange={(e) => setP(parseFloat(e.target.value))}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                            <Info className="w-6 h-6 text-blue-400 shrink-0" />
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {type === 'normal'
                                    ? "Normalfordelingen beskriver mange naturlige fenomener. μ bestemmer sentrum, mens σ bestemmer bredden."
                                    : "Binomialfordelingen beskriver antall suksesser i en serie uavhengige forsøk."}
                            </p>
                        </div>
                    </div>

                    {/* Graf Area */}
                    <div className="lg:col-span-2 bg-black/20 rounded-3xl border border-white/5 p-8 flex items-end justify-between gap-1 h-[400px]">
                        {data.map((d, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.y / maxVal) * 100}%` }}
                                className={`flex-1 rounded-t-sm ${type === 'normal' ? 'bg-primary/40' : 'bg-yellow-500/40'} border-t border-white/10`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
