import { Box, GitBranch, Wifi, CircuitBoard, Code2, BookOpen, TrendingUp, Brain, Network, Layers, BarChart3, Database, Shield, Cpu, Activity, RefreshCw, Calculator } from 'lucide-react';

const Grid3X3 = Box;

export type View = 'home' | 'hessian' | 'derivation' | 'network' | 'circuit' | 'linear' | 'gradient' | 'neural' | 'economics' | 'algorithm' | 'matrix' | 'linked-list' | 'recursion' | 'distribution' | 'p-value';

export interface Tool {
  title: string;
  description: string;
  icon: any;
  color: string;
  view?: View;
  disabled?: boolean;
}

export interface Category {
  name: string;
  icon: any;
  tools: Tool[];
}

export interface Course {
  code: string;
  name: string;
  tools?: Tool[];
  categories?: Category[];
}

export interface Semester {
  number: number;
  courses: Course[];
}

export const SEMESTERS: Semester[] = [
  {
    number: 1,
    courses: [
      {
        code: 'IN1000',
        name: 'Introduksjon til objektorientert programmering',
        categories: [
          {
            name: 'Algoritmer',
            icon: Activity,
            tools: [
              {
                title: 'Algoritme Visualiserer',
                description: 'Visualiser sorterings- og søkealgoritmer med interaktive animasjoner og Python-kodeeksempler.',
                icon: Code2,
                color: 'text-blue-500',
                view: 'algorithm'
              }
            ]
          },
          {
            name: 'Konsepter',
            icon: Layers,
            tools: [
              {
                title: 'Variabel-tracker',
                description: 'Se hvordan variabler endrer seg gjennom en løkke eller if-setning.',
                icon: Database,
                color: 'text-green-500',
                disabled: true
              }
            ]
          }
        ]
      },
      {
        code: 'IN1020',
        name: 'Introduksjon til datateknologi',
        categories: [
          {
            name: 'Sikkerhet',
            icon: Shield,
            tools: [
              {
                title: 'Sikkerhet (Kommer)',
                description: 'Verktøy for sikkerhet kommer snart.',
                icon: Shield,
                color: 'text-red-500',
                disabled: true
              }
            ]
          },
          {
            name: 'Maskinvare',
            icon: Cpu,
            tools: [
              {
                title: 'Kretsanalyse',
                description: 'Bygg logiske kretser med drag-and-drop, animert signalflyt og sanntids verditabeller.',
                icon: CircuitBoard,
                color: 'text-secondary',
                view: 'circuit'
              }
            ]
          },
          {
            name: 'Nettverk',
            icon: Activity,
            tools: [
              {
                title: 'IP & Subnett',
                description: 'Visualiser nettverksmasker, CIDR og binære operasjoner for subnett.',
                icon: Wifi,
                color: 'text-accent',
                view: 'network'
              }
            ]
          },
          {
            name: 'Programmering',
            icon: Code2,
            tools: [
              {
                title: 'Stack-visualisering (Kommer)',
                description: 'Se hvordan stacken endrer seg under kjøring.',
                icon: Layers,
                color: 'text-blue-500',
                disabled: true
              }
            ]
          }
        ]
      },
      {
        code: 'MAT1080',
        name: 'Matematikk for maskinlæring',
        tools: [
          {
            title: 'Matrix Playground',
            description: 'Utforsk populasjonsdynamikk, egenverdier og egenvektorer med interaktive eksempler.',
            icon: Grid3X3,
            color: 'text-cyan-500',
            view: 'matrix'
          },
          {
            title: 'Hessian Matrise',
            description: 'Analyser funksjoner av to variabler. Beregn Hessian, determinant og 3D-graf.',
            icon: Box,
            color: 'text-primary',
            view: 'hessian'
          },
          {
            title: 'Derivasjon',
            description: 'Steg-for-steg løser for derivasjon. Se reglene og utregningen visuelt.',
            icon: GitBranch,
            color: 'text-secondary',
            view: 'derivation'
          }
        ]
      }
    ]
  },
  {
    number: 2,
    courses: [
      {
        code: 'IN1010',
        name: 'Objektorientert programmering',
        categories: [
          {
            name: 'Fundamentet',
            icon: Shield,
            tools: [
              {
                title: 'Java Class Diagrammer',
                description: 'Dra-og-slipp for å visualisere arv og interfaces (grensesnitt) i Java.',
                icon: Layers,
                color: 'text-blue-500',
                disabled: true
              }
            ]
          },
          {
            name: 'Datastrukturer',
            icon: GitBranch,
            tools: [
              {
                title: 'Linked List Animator',
                description: 'Visualiser noder som peker på hverandre, innsetting og fjerning live.',
                icon: Activity,
                color: 'text-green-500',
                view: 'linked-list'
              },
              {
                title: 'Recursion Tracer',
                description: 'Se hvordan stack-frames bygges opp og ned i rekursive kall.',
                icon: RefreshCw,
                color: 'text-purple-500',
                view: 'recursion'
              }
            ]
          },
          {
            name: 'Parallelitet & GUI',
            icon: Cpu,
            tools: [
              {
                title: 'Thread Visualizer',
                description: 'Se hvordan flere tråder kjører samtidig og forstå synkronisering.',
                icon: Activity,
                color: 'text-red-500',
                disabled: true
              }
            ]
          }
        ]
      },
      {
        code: 'IN1160',
        name: 'Introduksjon til maskinlæring',
        categories: [
          {
            name: 'Regresjon',
            icon: TrendingUp,
            tools: [
              {
                title: 'Lineær Regresjon',
                description: 'Klikk for å legge til datapunkter og se "best fit line" oppdatere seg live.',
                icon: TrendingUp,
                color: 'text-blue-500',
                view: 'linear'
              }
            ]
          },
          {
            name: 'Optimering',
            icon: Activity,
            tools: [
              {
                title: 'Gradient Descent',
                description: 'Interaktiv visualisering av hvordan maskinlæringsmodeller "lærer".',
                icon: Brain,
                color: 'text-green-500',
                view: 'gradient'
              }
            ]
          },
          {
            name: 'Nevrale Nettverk',
            icon: Network,
            tools: [
              {
                title: 'Nevrale Nettverk',
                description: 'Bygg dine egne enkle nevrale nettverk visuelt.',
                icon: Network,
                color: 'text-purple-500',
                view: 'neural'
              }
            ]
          }
        ]
      },
      {
        code: 'STK-IN1050',
        name: 'Statistikk for informatikere',
        categories: [
          {
            name: 'Sannsynlighet',
            icon: Calculator,
            tools: [
              {
                title: 'Distribution Sandbox',
                description: 'Juster parametere for Normal- og Binomialfordeling og se kurven live.',
                icon: BarChart3,
                color: 'text-yellow-500',
                view: 'distribution'
              }
            ]
          },
          {
            name: 'Hypotesetesting',
            icon: Shield,
            tools: [
              {
                title: 'P-Value Visualizer',
                description: 'Se det kritiske området og p-verdien i en hypotesetest.',
                icon: RefreshCw,
                color: 'text-orange-500',
                view: 'p-value'
              }
            ]
          },
          {
            name: 'Regresjon & Prediksjon',
            icon: TrendingUp,
            tools: [
              {
                title: 'Sampling Simulator',
                description: 'Se Sentrale Grenseverdisetningen i aksjon gjennom simulering.',
                icon: Database,
                color: 'text-blue-500',
                disabled: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    number: 3,
    courses: [
      {
        code: 'IN2010',
        name: 'Algoritmer og datastrukturer',
        tools: [
          {
            title: 'Graf-visualiserer',
            description: 'Utforsk Dijkstra, BFS og DFS på interaktive grafer.',
            icon: Network,
            color: 'text-blue-500',
            disabled: true
          },
          {
            title: 'Tre-laboratorium',
            description: 'Visualiser binære søketrær, AVL-trær og balansering.',
            icon: GitBranch,
            color: 'text-green-500',
            disabled: true
          }
        ]
      },
      {
        code: 'IN2160',
        name: 'Systemprogrammering',
        tools: [
          {
            title: 'Minnebehandling Lab',
            description: 'Se hvordan malloc og free fungerer i praksis.',
            icon: Database,
            color: 'text-purple-500',
            disabled: true
          },
          {
            title: 'Tråd-visualiserer',
            description: 'Utforsk rasebetingelser og synkronisering.',
            icon: Activity,
            color: 'text-red-500',
            disabled: true
          }
        ]
      },
      {
        code: 'FRITT EMNE',
        name: 'Velg et emne som interesserer deg',
        tools: []
      }
    ]
  },
  {
    number: 4,
    courses: [
      {
        code: 'EXPHIL03',
        name: 'Examen philosophicum',
        tools: [
          {
            title: 'Etikk-lab',
            description: 'Utforsk store filosofer og deres perspektiver på moderne dilemmaer.',
            icon: BookOpen,
            color: 'text-yellow-500',
            disabled: true
          }
        ]
      },
      {
        code: 'IN1030',
        name: 'Systemer, krav og konsekvenser',
        tools: [
          {
            title: 'Rich Picture Builder',
            description: 'Visualiser interessenter, verdier og konflikter i et system med kule tegneverktøy.',
            icon: Layers,
            color: 'text-cyan-500',
            disabled: true
          },
          {
            title: 'Etikk-analysator',
            description: 'Drøft GDPR, personvern og samfunnsmessige konsekvenser av ny teknologi.',
            icon: Shield,
            color: 'text-red-500',
            disabled: true
          },
          {
            title: 'Krav-prioritering',
            description: 'Bruk MoSCoW og andre teknikker for å finne ut hva som er viktigst i et prosjekt.',
            icon: TrendingUp,
            color: 'text-green-500',
            disabled: true
          }
        ]
      },
      {
        code: 'OBLIG FAG',
        name: 'Obligatorisk fordypningsemne',
        tools: []
      }
    ]
  },
  {
    number: 5,
    courses: [
      {
        code: 'UTVIKLING/FRIE',
        name: 'Utviklingssemester / Frie emner',
        tools: [
          {
            title: 'Oversikt',
            description: 'Dette semesteret er ofte satt av til utveksling eller valgfrie emner.',
            icon: BookOpen,
            color: 'text-gray-500',
            disabled: true
          }
        ]
      }
    ]
  },
  {
    number: 6,
    courses: [
      {
        code: 'IN3410',
        name: 'Anvendelser av dyp læring',
        tools: [
          {
            title: 'Deep Learning Sandbox',
            description: 'Bygg avanserte nevrale nettverk og se de trene på bildegjenkjenning.',
            icon: Brain,
            color: 'text-purple-600',
            disabled: true
          }
        ]
      },
      {
        code: 'FRITT EMNE',
        name: 'Valgfritt emne',
        tools: []
      },
      {
        code: 'OBLIG FAG',
        name: 'Obligatorisk fordypningsemne',
        tools: []
      }
    ]
  }
];
