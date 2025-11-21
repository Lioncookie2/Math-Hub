import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  addEdge,
  Handle,
  Position,
  getBezierPath,
} from 'reactflow';
import type { Connection, Edge, Node, NodeProps, EdgeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Pause, Play, RefreshCw, Rewind, SkipForward, Zap, Plus, Minus } from 'lucide-react';
import { gateDefinitions, inputLetters } from '../utils/gates';
import type { GateType, InputLetter } from '../utils/gates';
import { cn } from '../utils/cn';

type CircuitNodeData = {
  label: string;
  value: number | null;
  gateType?: GateType;
};

interface PaletteItem {
  type: GateType;
  label: string;
  description: string;
}

interface SignalData {
  value: 0 | 1 | null;
  speed: number;
}

const OUTPUT_NODE_ID = 'output-F';

const palette: PaletteItem[] = Object.entries(gateDefinitions).map(([type, def]) => ({
  type: type as GateType,
  label: def.label,
  description: def.expression,
}));

const handleColors: Record<'input' | 'output', string> = {
  input: '#38bdf8',
  output: '#f472b6',
};

const InputNode: React.FC<NodeProps<{ label: string; value: number | null }>> = ({ data }) => (
  <div className="bg-background/80 border border-white/10 rounded-xl px-4 py-3 shadow-lg text-center min-w-[90px]">
    <div className="text-xs text-gray-500">Input</div>
    <div className="text-2xl font-bold text-white">{data.label}</div>
    <div className="text-sm text-gray-400">Verdi: <span className="text-primary font-mono">{data.value ?? '–'}</span></div>
    <Handle type="source" position={Position.Right} className="!bg-primary" />
  </div>
);

const GateNode: React.FC<NodeProps<{ gateType: GateType; label: string; value: number | null }>> = ({ data }) => {
  const def = gateDefinitions[data.gateType];
  const inputCount = Math.min(def.maxInputs, 3);

  return (
    <div className="bg-surface/70 border border-white/10 rounded-2xl px-4 py-3 min-w-[140px] text-center backdrop-blur">
      <div className="text-xs uppercase text-gray-500 tracking-wide">{data.gateType}</div>
      <div className="text-lg font-semibold text-white">{data.label}</div>
      <div className="text-sm text-gray-400 font-mono">{def.expression}</div>
      <div className="mt-2 text-sm text-gray-300">
        Utgang: <span className="font-mono text-secondary">{data.value ?? '–'}</span>
      </div>
      {Array.from({ length: inputCount }).map((_, idx) => (
        <Handle
          key={`in-${idx}`}
          type="target"
          position={Position.Left}
          id={`in-${idx}`}
          style={{ top: `${(idx + 1) * (100 / (inputCount + 1))}%`, background: handleColors.input }}
        />
      ))}
      <Handle type="source" position={Position.Right} className="!bg-secondary" />
    </div>
  );
};

const OutputNode: React.FC<NodeProps<{ label: string; value: number | null }>> = ({ data }) => (
  <div className="bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/40 rounded-2xl px-6 py-4 text-center shadow-xl">
    <div className="text-xs tracking-wide text-gray-400 uppercase">Output</div>
    <div className="text-3xl font-extrabold text-white">{data.label}</div>
    <div className="text-xl font-mono text-secondary mt-2">{data.value ?? '–'}</div>
    <Handle type="target" position={Position.Left} className="!bg-secondary" />
  </div>
);

const AnimatedSignalEdge: React.FC<EdgeProps<SignalData>> = (props) => {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const color =
    data?.value === 1 ? '#34d399' : data?.value === 0 ? '#f87171' : 'rgba(255,255,255,0.2)';

  const dashSpeed = `${Math.max(0.3, (11 - (data?.speed ?? 5)) * 0.2)}s`;

  return (
    <g>
      <path
        id={id}
        style={{
          stroke: color,
          strokeWidth: 3,
          fill: 'none',
          strokeDasharray: data?.value == null ? '4 8' : '14 6',
          strokeDashoffset: 0,
          animation: data?.value != null ? `dash ${dashSpeed} linear infinite` : undefined,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      {data?.value != null && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <circle cx={labelX} cy={labelY} r={12} fill="#0f172a" stroke={color} strokeWidth={2} />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            fill="#f8fafc"
            fontFamily="Fira Code"
            fontSize={12}
          >
            {data.value}
          </text>
        </motion.g>
      )}
    </g>
  );
};

const nodeTypes = {
  inputNode: InputNode,
  gateNode: GateNode,
  outputNode: OutputNode,
};

const edgeTypes = {
  signal: AnimatedSignalEdge,
};

const getNodeData = (node: Node): CircuitNodeData => node.data as CircuitNodeData;

const initialNodes: Node[] = [
  {
    id: OUTPUT_NODE_ID,
    type: 'outputNode',
    position: { x: 820, y: 220 },
    data: { label: 'F', value: null },
  },
];

const generateCombos = (letters: string[]) => {
  const combos: Array<{ bits: number[]; key: string }> = [];
  const count = letters.length;
  const max = Math.pow(2, count);
  for (let i = 0; i < max; i++) {
    const bits = letters.map((_, idx) => (i >> (count - idx - 1)) & 1);
    combos.push({ bits, key: bits.join('') });
  }
  return combos;
};

interface EvaluationResult {
  nodeValues: Record<string, 0 | 1 | null>;
  edgeValues: Record<string, 0 | 1 | null>;
  explanation: string[];
  output: 0 | 1 | null;
}

const evaluateCircuit = (
  nodes: Node[],
  edges: Edge<SignalData>[],
  assignments: Record<string, 0 | 1>,
): EvaluationResult => {
  const nodeValues: Record<string, 0 | 1 | null> = {};
  const explanation: string[] = [];

  nodes.forEach((node) => {
    const nodeData = getNodeData(node);
    if (node.type === 'inputNode') {
      nodeValues[node.id] = assignments[nodeData.label] ?? 0;
    } else {
      nodeValues[node.id] = null;
    }
  });

  const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);

  let progress = true;
  let guard = 0;
  while (progress && guard < 50) {
    progress = false;
    guard++;
    sortedNodes.forEach((node) => {
      if (nodeValues[node.id] != null || node.type === 'inputNode') return;
      const incoming = edges.filter((e) => e.target === node.id);
      if (!incoming.length) return;
      const inputs = incoming
        .map((edge) => nodeValues[edge.source as string])
        .filter((v) => v !== null && v !== undefined) as Array<0 | 1>;
      if (inputs.length !== incoming.length) return;

      const nodeData = getNodeData(node);
      if (node.type === 'gateNode') {
        const def = gateDefinitions[nodeData.gateType as GateType];
        const trimmed = inputs.slice(0, def.maxInputs);
        const output = def.evaluate(trimmed);
        nodeValues[node.id] = output;
        explanation.push(
          `${nodeData.label} (${def.label}): ${def.expression.replace('F =', '')} → ${output}`,
        );
      } else if (node.type === 'outputNode') {
        nodeValues[node.id] = inputs[0] ?? 0;
        explanation.push(`Output ${nodeData.label}: mottar ${inputs[0] ?? 0}`);
      }
      progress = true;
    });
  }

  const edgeValues: Record<string, 0 | 1 | null> = {};
  edges.forEach((edge) => {
    edgeValues[edge.id] = nodeValues[edge.source as string] ?? null;
  });

  return {
    nodeValues,
    edgeValues,
    explanation,
    output: nodeValues[OUTPUT_NODE_ID] ?? null,
  };
};

export const CircuitLab: React.FC = () => {
  const [inputCount, setInputCount] = useState(2);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<SignalData>([]);
  const nodesRef = useRef<Node[]>(initialNodes);
  const edgesRef = useRef<Edge<SignalData>[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);


  const activeLetters = useMemo(() => inputLetters.slice(0, inputCount), [inputCount]);
  const combos = useMemo(() => generateCombos(activeLetters), [activeLetters]);

  const [speed, setSpeed] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rowResults, setRowResults] = useState<Record<string, 0 | 1>>({});
  const [explanation, setExplanation] = useState<string[]>([]);

  useEffect(() => {
    // Sync input nodes med valgt antall
    setNodes((nds) => {
      const filtered = nds.filter(
        (node) =>
          node.type !== 'inputNode' ||
          activeLetters.includes(getNodeData(node).label as InputLetter),
      );
      const existingIds = filtered
        .filter((n) => n.type === 'inputNode')
        .map((n) => getNodeData(n).label as InputLetter);

      const additions = activeLetters
        .filter((letter) => !existingIds.includes(letter))
        .map((letter, idx) => ({
          id: `input-${letter}`,
          type: 'inputNode',
          position: { x: 30, y: 120 + idx * 140 },
          data: { label: letter, value: null },
        }));

      const repositioned = filtered.map((node) => {
        if (node.type !== 'inputNode') return node;
        const idx = activeLetters.indexOf(getNodeData(node).label as InputLetter);
        return {
          ...node,
          position: { x: 30, y: 120 + idx * 140 },
        };
      });

      return [...repositioned, ...additions];
    });

    setCurrentIndex(0);
    setRowResults({});
  }, [activeLetters, setNodes]);

  const handleAddGate = (type: GateType) => {
    const id = `${type}-${Date.now()}`;
    const randomY = 100 + Math.random() * 300;
    const randomX = 300 + Math.random() * 250;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'gateNode',
        position: { x: randomX, y: randomY },
        data: { gateType: type, label: `${type}-${nds.length}`, value: null },
      },
    ]);
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `edge-${Date.now()}`,
            type: 'signal',
            animated: true,
            data: { value: null, speed },
          },
          eds,
        ),
      );
    },
    [setEdges, speed],
  );

  const updateSignals = useCallback(
    (comboIndex: number) => {
      const combo = combos[comboIndex];
      if (!combo) return;
      const assignments = Object.fromEntries(
        activeLetters.map((letter, idx) => [letter, combo.bits[idx] as 0 | 1]),
      );

      const evaluation = evaluateCircuit(nodesRef.current, edgesRef.current, assignments);

      setNodes((nds) =>
        nds.map((node) => {
          const nodeData = getNodeData(node);
          return {
            ...node,
            data: { ...nodeData, value: evaluation.nodeValues[node.id] ?? null },
          };
        }),
      );
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          data: { ...(edge.data ?? {}), value: evaluation.edgeValues[edge.id] ?? null, speed },
        })),
      );
      setExplanation(evaluation.explanation);
      const key = combo.key;
      setRowResults((rows) => ({
        ...rows,
        [key]: evaluation.output ?? 0,
      }));
    },
    [activeLetters, combos, edges, nodes, setEdges, setNodes, speed],
  );

  useEffect(() => {
    updateSignals(currentIndex);
  }, [currentIndex, updateSignals]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((idx) => {
        const next = (idx + direction + combos.length) % combos.length;
        return next;
      });
    }, Math.max(250, 1500 - speed * 120));
    return () => clearInterval(interval);
  }, [isPlaying, direction, speed, combos.length]);

  const handleSkip = () => {
    const fullResults: Record<string, 0 | 1> = {};
    combos.forEach((combo) => {
      const assignments = Object.fromEntries(
        activeLetters.map((letter, bIdx) => [letter, combo.bits[bIdx] as 0 | 1]),
      );
      const evaluation = evaluateCircuit(nodesRef.current, edgesRef.current, assignments);
      fullResults[combo.key] = evaluation.output ?? 0;
    });
    setRowResults(fullResults);
  };

  const truthTableRows = combos.map((combo, idx) => ({
    ...combo,
    highlight: idx === currentIndex,
    output: rowResults[combo.key],
  }));

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[320px,1fr] gap-6">
        {/* Control Panel */}
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur">
          <div>
            <h3 className="text-white font-semibold mb-2">Innganger</h3>
            <p className="text-sm text-gray-400 mb-3">
              Legg til opptil tre symboler (A, B, C) og koble dem inn i kretsen.
            </p>
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
                onClick={() => setInputCount((c) => Math.max(1, c - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {activeLetters.map((letter) => (
                  <span
                    key={letter}
                    className="px-3 py-1 rounded-full border border-white/10 text-sm font-mono bg-primary/10 text-white"
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <button
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
                onClick={() => setInputCount((c) => Math.min(3, c + 1))}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Portbibliotek</h3>
            <div className="grid grid-cols-2 gap-3">
              {palette.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleAddGate(item.type)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left hover:border-primary/50 transition group"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-primary">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Simulering</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={cn(
                  'px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10',
                  direction === -1 ? 'bg-white/10' : 'bg-white/5',
                )}
                onClick={() => {
                  setDirection(-1);
                  setIsPlaying(true);
                }}
              >
                <Rewind className="w-4 h-4" />
                Reverse
              </button>
              <button
                className="px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 bg-primary/20 text-white"
                onClick={() => setIsPlaying((p) => !p)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                className={cn(
                  'px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10',
                  direction === 1 ? 'bg-white/10' : 'bg-white/5',
                )}
                onClick={() => {
                  setDirection(1);
                  setIsPlaying(true);
                }}
              >
                <SkipForward className="w-4 h-4" />
                Forward
              </button>
              <button
                className="px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 transition"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex((idx) => (idx - 1 + combos.length) % combos.length);
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Steg
              </button>
              <button
                className="px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 bg-accent/10 text-white"
                onClick={handleSkip}
              >
                <Zap className="w-4 h-4" />
                Skip
              </button>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-400">Hastighet: {speed}</label>
              <input
                type="range"
                min={1}
                max={10}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-surface/50 border border-white/10 rounded-3xl h-[620px] overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background gap={24} color="rgba(255,255,255,0.05)" />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Truth table & Explanation */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 backdrop-blur space-y-4">
          <h3 className="text-white font-semibold">Funksjonstabell</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead className="text-gray-400">
                <tr>
                  {activeLetters.map((letter) => (
                    <th key={letter} className="py-2 px-3 text-left">
                      {letter}
                    </th>
                  ))}
                  <th className="py-2 px-3 text-left text-secondary">F</th>
                </tr>
              </thead>
              <tbody>
                {truthTableRows.map((row) => (
                  <tr
                    key={row.key}
                    className={cn(
                      'border-t border-white/5',
                      row.highlight ? 'bg-white/5 text-white' : 'text-gray-300',
                    )}
                  >
                    {row.bits.map((bit, idx) => (
                      <td key={`${row.key}-${idx}`} className="py-2 px-3">
                        {bit}
                      </td>
                    ))}
                    <td className="py-2 px-3 text-secondary font-bold">{row.output ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 backdrop-blur space-y-4">
          <h3 className="text-white font-semibold">Forklaring</h3>
          {explanation.length === 0 ? (
            <p className="text-gray-400 text-sm">Koble opp en krets og trykk play for å se steg.</p>
          ) : (
            <ol className="space-y-3 text-sm text-gray-300">
              {explanation.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-primary font-semibold">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Gate truth tables */}
      <div className="bg-surface/40 border border-white/5 rounded-3xl p-6">
        <h3 className="text-white font-semibold mb-4">Port-referanser</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {palette.map(({ type }) => {
            const def = gateDefinitions[type];
            return (
              <div key={type} className="bg-black/20 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-semibold">{def.label}</div>
                    <div className="text-xs text-gray-400">{def.expression}</div>
                  </div>
                </div>
                <table className="w-full text-xs font-mono text-gray-300">
                  <thead>
                    <tr>
                      {def.truthTable[0].inputs.map((_, idx) => (
                        <th key={idx} className="text-left">
                          {String.fromCharCode(65 + idx)}
                        </th>
                      ))}
                      <th>F</th>
                    </tr>
                  </thead>
                  <tbody>
                    {def.truthTable.map((row, idx) => (
                      <tr key={idx}>
                        {row.inputs.map((bit, i) => (
                          <td key={i}>{bit}</td>
                        ))}
                        <td className="text-secondary font-bold">{row.output}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CircuitLab;

