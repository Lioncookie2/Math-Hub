import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Info, RotateCcw, Box, Play } from 'lucide-react';

interface Node {
    id: string;
    value: number;
}

export function LinkedListAnimator() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: '1', value: 10 },
        { id: '2', value: 20 },
        { id: '3', value: 30 }
    ]);
    const [inputValue, setInputValue] = useState<string>('');
    const [message, setMessage] = useState<string>('Velkommen! Prøv å legge til eller fjerne noder.');

    const addNode = useCallback(() => {
        const val = parseInt(inputValue);
        if (isNaN(val)) return;

        const newNode = { id: Math.random().toString(36).substr(2, 9), value: val };
        setNodes(prev => [...prev, newNode]);
        setInputValue('');
        setMessage(`La til node med verdi ${val} på slutten av listen.`);
    }, [inputValue]);

    const removeNode = useCallback((index: number) => {
        setNodes(prev => prev.filter((_, i) => i !== index));
        setMessage(`Fjernet node på indeks ${index}.`);
    }, []);

    const clearList = () => {
        setNodes([]);
        setMessage('Listen er tømt.');
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Box className="text-primary w-8 h-8" />
                            Lenket Liste Visualisering
                        </h2>
                        <p className="text-gray-400">Utforsk hvordan noder kobles sammen i minnet (Java-stil).</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Verdi"
                            className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary w-24"
                        />
                        <button
                            onClick={addNode}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" /> Legg til
                        </button>
                        <button
                            onClick={clearList}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Meldingsfelt */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-primary font-medium flex items-center gap-3">
                    <Info className="w-5 h-5" />
                    {message}
                </div>

                {/* Listen */}
                <div className="relative py-20 min-h-[300px] flex items-center justify-center overflow-x-auto overflow-y-hidden scrollbar-hide">
                    <div className="flex items-center gap-12 px-12">
                        <AnimatePresence mode="popLayout">
                            {nodes.map((node, index) => (
                                <div key={node.id} className="flex items-center gap-12">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: -50 }}
                                        whileHover={{ y: -5 }}
                                        className="relative group"
                                    >
                                        {/* Node Container */}
                                        <div className="w-24 h-24 bg-surface-light border-2 border-primary/40 rounded-2xl flex flex-col items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                                            <div className="text-3xl font-mono font-bold text-white mb-1">{node.value}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Node {index}</div>

                                            {/* Delete overlay */}
                                            <button
                                                onClick={() => removeNode(index)}
                                                className="absolute inset-0 bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <Trash2 className="w-8 h-8" />
                                            </button>
                                        </div>

                                        {/* Memory Address Helper */}
                                        <div className="absolute -bottom-8 left-0 right-0 text-center text-[10px] text-gray-600 font-mono">
                                            0x{node.id.substr(0, 4).toUpperCase()}
                                        </div>
                                    </motion.div>

                                    {/* Pointer Arrow */}
                                    {index < nodes.length - 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, scaleX: 0 }}
                                            animate={{ opacity: 1, scaleX: 1 }}
                                            exit={{ opacity: 0, scaleX: 0 }}
                                            className="relative origin-left"
                                        >
                                            <div className="h-[2px] w-12 bg-primary/40 relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-primary/40" />
                                            </div>
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary/60 font-mono uppercase font-bold">.next</div>
                                        </motion.div>
                                    )}

                                    {/* Null pointer (End of list) */}
                                    {index === nodes.length - 1 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="h-[2px] w-8 bg-gray-700" />
                                            <div className="px-2 py-1 bg-gray-800 rounded text-[10px] text-gray-500 font-bold border border-white/5 uppercase">Null</div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}

                            {nodes.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-gray-600 italic flex flex-col items-center gap-4"
                                >
                                    <p>Listen er tom. Prøv å legge til en verdi ovenfor!</p>
                                    <div className="w-16 h-1 bg-white/5 rounded-full" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Teori-seksjon */}
            <div className="grid md:grid-cols-2 gap-6 pb-20">
                <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        Hva er en Lenket Liste?
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                        I motsetning til en Array, lagres ikke nodene i en lenket liste rett etter hverandre i minnet.
                        Hver node består av en **verdi** og en **referanse** (pointer) til den neste noden.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Dynamisk størrelse: Kan vokse og krympe fritt.
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Rask innsetting: Trenger ikke å flytte alle elementer.
                        </li>
                    </ul>
                </div>

                <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-secondary" />
                        Java-kode (Eksempel)
                    </h3>
                    <div className="bg-black/30 rounded-xl p-4 font-mono text-sm overflow-x-auto text-blue-400">
                        <pre>
                            {`class Node {
  int verdi;
  Node neste;
  
  Node(int v) {
    this.verdi = v;
    this.neste = null;
  }
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
