import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, RefreshCw, Library, Fish, Landmark, ArrowRight, Calculator, HelpCircle, X } from 'lucide-react';

interface PopulationState {
    x: number;
    y: number;
}

interface Example {
    name: string;
    icon: any;
    description: string;
    problem: string;
    helpText: string;
    matrix: [[number, number], [number, number]];
    initial: PopulationState;
    labels: [string, string];
    unit: string;
}

const EXAMPLES: Example[] = [
    {
        name: 'Biblioteker',
        icon: Library,
        description: 'Fordeling av bøker mellom to biblioteker.',
        problem: '90% av alle som låner fra Bibliotek A leverer tilbake til A, mens 10% leverer til B. 70% av de som låner fra Bibliotek B leverer tilbake til B, mens 30% leveres til A. Vil systemet stabilisere seg?',
        helpText: 'Dette er et klassisk Markov-kjede problem. Siden kolonnene i matrisen summerer seg til 1, vil den største egenverdien (λ) alltid være 1. Dette betyr at systemet vil nå en stabil likevekt over tid, uansett hvor mange bøker man starter med.',
        matrix: [[0.9, 0.3], [0.1, 0.7]],
        initial: { x: 1500, y: 500 },
        labels: ['Bibliotek A', 'Bibliotek B'],
        unit: 'bøker'
    },
    {
        name: 'Fiskearter',
        icon: Fish,
        description: 'Konkurranse mellom to arter i et lukket økosystem.',
        problem: 'To fiskearter lever i samme vann. På grunn av miljøforandringer og konkurranse synker populasjonen til begge hver sesong. Hvordan ser fremtiden ut for laksen og ørreten?',
        helpText: 'Når alle egenverdiene (λ) er mindre enn 1, betyr det at systemet "trekker seg sammen" mot nullpunktet. Her vil begge populasjonene dø ut over tid (λ < 1 betyr negativ vekstrate). Egenvektorene forteller oss hvilken art som dør ut saktest.',
        matrix: [[0.4, 0.1], [0.2, 0.3]],
        initial: { x: 500, y: 500 },
        labels: ['Laks', 'Ørret'],
        unit: 'stk'
    },
    {
        name: 'Banker',
        icon: Landmark,
        description: 'Kapitalvekst og overføringer mellom to finansielle institusjoner.',
        problem: 'To banker Nord og Sør opplever stor vekst. Kapitalen i Nord øker med 10% pluss 20% av Sør sin kapital hvert år. Sør øker med 10% pluss 20% av Nord sin kapital. Hvor mye penger er det her etter 10 år?',
        helpText: 'En egenverdi λ > 1 betyr at systemet har en ustabil vekst (eksplosiv). For hver λ > 1 vil populasjonen/kapitalen vokse geometrisk over tid. Retningen på denne veksten bestemmes av egenvektoren som hører til den dominante egenverdien.',
        matrix: [[1.1, 0.2], [0.2, 1.1]],
        initial: { x: 1000, y: 1000 },
        labels: ['Bank Nord', 'Bank Sør'],
        unit: 'MNOK'
    }
];

function HelpModal({ isOpen, onClose, title, content }: { isOpen: boolean, onClose: () => void, title: string, content: string }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{title}</h3>
                            </div>
                            <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                                {content.split('. ').map((p, i) => (
                                    <p key={i}>{p}{i < content.split('. ').length - 1 ? '.' : ''}</p>
                                ))}
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-8 w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
                            >
                                Skjønner!
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export function MatrixPlayground() {
    const [matrix, setMatrix] = useState<[[number, number], [number, number]]>(EXAMPLES[0].matrix);
    const [initialPop, setInitialPop] = useState<PopulationState>(EXAMPLES[0].initial);
    const [years, setYears] = useState(5);
    const [labels, setLabels] = useState<[string, string]>(EXAMPLES[0].labels);
    const [unit, setUnit] = useState(EXAMPLES[0].unit);
    const [activeExample, setActiveExample] = useState(EXAMPLES[0]);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const loadExample = (ex: Example) => {
        setMatrix(ex.matrix);
        setInitialPop(ex.initial);
        setLabels(ex.labels);
        setUnit(ex.unit);
        setActiveExample(ex);
    };

    const results = useMemo(() => {
        let current = { ...initialPop };
        const history = [current];

        for (let i = 0; i < years; i++) {
            const nextX = matrix[0][0] * current.x + matrix[0][1] * current.y;
            const nextY = matrix[1][0] * current.x + matrix[1][1] * current.y;
            current = { x: nextX, y: nextY };
            history.push(current);
        }
        return { current, history };
    }, [matrix, initialPop, years]);

    const eigenvalues = useMemo(() => {
        const a = matrix[0][0];
        const b = matrix[0][1];
        const c = matrix[1][0];
        const d = matrix[1][1];

        const trace = a + d;
        const determinant = a * d - b * c;

        const discriminant = trace * trace - 4 * determinant;
        if (discriminant < 0) return null;

        const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
        const lambda2 = (trace - Math.sqrt(discriminant)) / 2;

        return [lambda1, lambda2].sort((x, y) => Math.abs(y) - Math.abs(x));
    }, [matrix]);

    // Finn maks verdi i historikken for korrekt graf-skalering
    const maxVal = useMemo(() => {
        return Math.max(...results.history.map(h => h.x + h.y), 1);
    }, [results.history]);

    return (
        <div className="space-y-6">
            {/* Problembeskrivelse */}
            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <activeExample.icon className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">Oppgave</span>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{activeExample.name}</h2>
                    </div>
                    <p className="text-xl text-gray-200 leading-relaxed font-medium italic">
                        "{activeExample.problem}"
                    </p>
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors group"
                    >
                        <HelpCircle className="w-5 h-5" />
                        Hvorfor skjer dette? Lær mer om egenverdier
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Kontroller */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-2 text-primary">
                            <Calculator className="w-5 h-5" />
                            <h2 className="text-xl font-bold text-white">Konfigurasjon</h2>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-400">Velg eksempel</label>
                            <div className="grid grid-cols-1 gap-2">
                                {EXAMPLES.map((ex) => (
                                    <button
                                        key={ex.name}
                                        onClick={() => loadExample(ex)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${activeExample.name === ex.name
                                                ? 'bg-primary/20 border-primary/50'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${activeExample.name === ex.name ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
                                            }`}>
                                            <ex.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{ex.name}</div>
                                            <div className="text-xs text-gray-500">{ex.unit}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-400">Overgangsmatrise (A)</label>
                                <button onClick={() => setIsHelpOpen(true)}><HelpCircle className="w-4 h-4 text-gray-500 hover:text-primary transition-colors" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-4 bg-black/20 rounded-xl border border-white/5">
                                {matrix.map((row, i) =>
                                    row.map((val, j) => (
                                        <input
                                            key={`${i}-${j}`}
                                            type="number"
                                            step="0.05"
                                            value={val}
                                            onChange={(e) => {
                                                const newMatrix = [...matrix] as any;
                                                newMatrix[i][j] = parseFloat(e.target.value) || 0;
                                                setMatrix(newMatrix);
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:border-primary outline-none transition-colors font-mono"
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-400">Startpopulasjon</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase text-gray-500">{labels[0]}</span>
                                    <input
                                        type="number"
                                        value={initialPop.x}
                                        onChange={(e) => setInitialPop({ ...initialPop, x: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase text-gray-500">{labels[1]}</span>
                                    <input
                                        type="number"
                                        value={initialPop.y}
                                        onChange={(e) => setInitialPop({ ...initialPop, y: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-400">Antall år: {years}</label>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={years}
                                onChange={(e) => setYears(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Resultater og Visualisering */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-secondary" />
                                    Egenverdier (λ)
                                </h3>
                                <button onClick={() => setIsHelpOpen(true)}><HelpCircle className="w-4 h-4 text-gray-500 hover:text-primary transition-colors" /></button>
                            </div>
                            <div className="space-y-3">
                                {eigenvalues ? (
                                    eigenvalues.map((λ, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                            <span className="text-gray-400 italic font-mono">λ<sub>{i + 1}</sub></span>
                                            <span className={`font-mono text-lg font-bold ${Math.abs(λ) > 1.001 ? 'text-green-400' : Math.abs(λ) < 0.999 ? 'text-red-400' : 'text-blue-400'}`}>
                                                {λ.toFixed(4)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm italic">
                                        Komplekse egenverdier - systemet roterer/oscillerer.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white uppercase tracking-wider text-xs text-gray-500">Resultat etter {years} år</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-bold">{labels[0]}</span>
                                        <span className="text-primary font-mono font-bold">{Math.round(results.current.x).toLocaleString()} {unit}</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (results.current.x / (results.current.x + results.current.y)) * 100)}%` }}
                                            className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-bold">{labels[1]}</span>
                                        <span className="text-secondary font-mono font-bold">{Math.round(results.current.y).toLocaleString()} {unit}</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (results.current.y / (results.current.x + results.current.y)) * 100)}%` }}
                                            className="bg-secondary h-full rounded-full shadow-[0_0_15px_rgba(var(--secondary-rgb),0.3)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historikk-visualisering */}
                    <div className="bg-surface/30 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-8 flex justify-between items-center">
                            Utvikling over tid
                            <span className="text-xs text-gray-500 font-normal">Totalt {unit}</span>
                        </h3>
                        <div className="h-64 flex items-end gap-1 px-2 border-b border-white/5">
                            {results.history.map((h, i) => {
                                const total = h.x + h.y;
                                const heightX = (h.x / maxVal) * 100;
                                const heightY = (h.y / maxVal) * 100;

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                                        {/* Tooltip */}
                                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all bg-surface border border-white/20 p-2 rounded-lg text-[10px] whitespace-nowrap z-50 pointer-events-none shadow-xl -translate-y-2 group-hover:translate-y-0">
                                            <div className="font-bold border-b border-white/10 pb-1 mb-1 text-primary">År {i}</div>
                                            <div className="flex justify-between gap-4 text-gray-300">
                                                <span>{labels[0]}:</span>
                                                <span className="text-white">{Math.round(h.x)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 text-gray-300">
                                                <span>{labels[1]}:</span>
                                                <span className="text-white">{Math.round(h.y)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-white/10 font-bold">
                                                <span>Sum:</span>
                                                <span className="text-secondary">{Math.round(total)}</span>
                                            </div>
                                        </div>

                                        {/* Den faktiske grafen */}
                                        <div className="w-full flex flex-col justify-end h-full">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightX}%` }}
                                                className="w-full bg-primary/60 rounded-t-sm hover:bg-primary transition-colors cursor-help"
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightY}%` }}
                                                className="w-full bg-secondary/60 rounded-t-sm hover:bg-secondary transition-colors cursor-help"
                                            />
                                        </div>

                                        {/* X-akse labels */}
                                        <span className="text-[9px] text-gray-500 mt-2 absolute -bottom-6">
                                            {years <= 15 ? i : i % 5 === 0 ? i : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                        <Info className="w-6 h-6 text-blue-400 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-400">Teoretisk innsikt</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Når vi multipliserer en vektor med en matrise gjentatte ganger, vil vektoren etter hvert peke i samme retning som **egenvektoren** til den største egenverdien.
                                Dette er grunnen til at forholdet mellom populasjonene ofte stabiliserer seg, selv om totalen vokser eller synker.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                title={`Matematikken bak: ${activeExample.name}`}
                content={activeExample.helpText}
            />
        </div>
    );
}
