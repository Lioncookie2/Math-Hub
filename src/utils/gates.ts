export type GateType = 'NOT' | 'AND' | 'OR' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export interface GateDefinition {
  label: string;
  description: string;
  minInputs: number;
  maxInputs: number;
  expression: string;
  truthTable: Array<{ inputs: number[]; output: number }>;
  evaluate: (inputs: number[]) => 0 | 1;
}

const binaryCombos: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

const unaryCombos: Array<[number]> = [[0], [1]];

export const gateDefinitions: Record<GateType, GateDefinition> = {
  NOT: {
    label: 'NOT',
    description: 'Inverterer signalet (¬A)',
    minInputs: 1,
    maxInputs: 1,
    expression: 'F = A̅',
    truthTable: unaryCombos.map(([a]) => ({ inputs: [a], output: a ? 0 : 1 })),
    evaluate: ([a]) => (a ? 0 : 1),
  },
  AND: {
    label: 'AND',
    description: 'Alle innganger må være 1',
    minInputs: 2,
    maxInputs: 3,
    expression: 'F = A · B (· C)',
    truthTable: binaryCombos.map(([a, b]) => ({ inputs: [a, b], output: a && b ? 1 : 0 })),
    evaluate: (inputs) => (inputs.every((v) => v === 1) ? 1 : 0),
  },
  OR: {
    label: 'OR',
    description: 'Minst én inngang er 1',
    minInputs: 2,
    maxInputs: 3,
    expression: 'F = A + B (+ C)',
    truthTable: binaryCombos.map(([a, b]) => ({ inputs: [a, b], output: a || b ? 1 : 0 })),
    evaluate: (inputs) => (inputs.some((v) => v === 1) ? 1 : 0),
  },
  NAND: {
    label: 'NAND',
    description: 'Invertert AND',
    minInputs: 2,
    maxInputs: 3,
    expression: 'F = (AB)̅',
    truthTable: binaryCombos.map(([a, b]) => ({ inputs: [a, b], output: a && b ? 0 : 1 })),
    evaluate: (inputs) => (inputs.every((v) => v === 1) ? 0 : 1),
  },
  NOR: {
    label: 'NOR',
    description: 'Invertert OR',
    minInputs: 2,
    maxInputs: 3,
    expression: 'F = (A + B)̅',
    truthTable: binaryCombos.map(([a, b]) => ({ inputs: [a, b], output: a || b ? 0 : 1 })),
    evaluate: (inputs) => (inputs.some((v) => v === 1) ? 0 : 1),
  },
  XOR: {
    label: 'XOR',
    description: 'Likeverdighet (oddetall av 1-ere)',
    minInputs: 2,
    maxInputs: 2,
    expression: 'F = A ⊕ B',
    truthTable: binaryCombos.map(([a, b]) => ({ inputs: [a, b], output: a ^ b ? 1 : 0 })),
    evaluate: (inputs) => (inputs.reduce((acc, v) => acc ^ v, 0) ? 1 : 0),
  },
  XNOR: {
    label: 'XNOR',
    description: 'Invertert XOR',
    minInputs: 2,
    maxInputs: 2,
    expression: 'F = (A ⊕ B)̅',
    truthTable: binaryCombos.map(([a, b]) => ({ inputs: [a, b], output: a ^ b ? 0 : 1 })),
    evaluate: (inputs) => (inputs.reduce((acc, v) => acc ^ v, 0) ? 0 : 1),
  },
};

export const inputLetters = ['A', 'B', 'C'] as const;

export type InputLetter = typeof inputLetters[number];


