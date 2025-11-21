import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import type { MathNode, OperatorNode, FunctionNode } from 'mathjs';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

const math = create(all);

const isOperatorNode = (node: MathNode): node is OperatorNode =>
  (node as OperatorNode).isOperatorNode === true;

const isFunctionNode = (node: MathNode): node is FunctionNode =>
  (node as FunctionNode).isFunctionNode === true;

interface Step {
  title: string;
  latex: string;
  description: string;
}

export const DerivationCalculator: React.FC = () => {
  const [expression, setExpression] = useState('x^2 * sin(x)');
  const [variable, setVariable] = useState('x');
  const [steps, setSteps] = useState<Step[]>([]);
  const [finalResult, setFinalResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const analyzeAndDerive = () => {
    try {
      setError(null);
      const node = math.parse(expression) as MathNode;
      const resultNode = math.derivative(node, variable);
      const simplified = math.simplify(resultNode);
      
      setFinalResult(simplified.toTex());

      // Generate "fake" but intelligent steps based on structure
      const newSteps: Step[] = [];

      // Step 1: Analyze structure
      newSteps.push({
        title: "1. Analyse av uttrykket",
        description: "Først ser vi på strukturen til funksjonen for å bestemme hvilke regler som gjelder.",
        latex: `f(${variable}) = ${node.toTex()}`
      });

      // Heuristics for rules
      if (isOperatorNode(node)) {
        if (node.op === '*') {
          newSteps.push({
            title: "2. Produktregelen",
            description: "Vi ser at uttrykket er et produkt av to ledd. Da bruker vi produktregelen:",
            latex: `(u \\cdot v)' = u' \\cdot v + u \\cdot v'`
          });
          // Try to identify u and v
          if (node.args && node.args.length === 2) {
             newSteps.push({
                title: "3. Identifiser leddene",
                description: "Vi setter:",
                latex: `u = ${node.args[0].toTex()}, \\quad v = ${node.args[1].toTex()}`
             });
          }
        } else if (node.op === '/') {
          newSteps.push({
            title: "2. Kvotientregelen (Brøkregelen)",
            description: "Siden dette er en brøk, må vi bruke kvotientregelen:",
            latex: `\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}`
          });
        } else if (node.op === '+') {
           newSteps.push({
            title: "2. Leddvis derivasjon",
            description: "Siden leddene er lagt sammen, kan vi derivere hvert ledd hver for seg.",
            latex: `(u + v)' = u' + v'`
          });
        } else if (node.op === '^') {
             newSteps.push({
            title: "2. Potensregelen",
            description: "Vi har en potens. Hvis eksponenten er konstant bruker vi:",
            latex: `(x^n)' = n \\cdot x^{n-1}`
          });
        }
      } else if (isFunctionNode(node)) {
         newSteps.push({
            title: "2. Kjerneregelen",
            description: "Dette er en sammensatt funksjon. Vi må huske å gange med den deriverte av kjernen (indre funksjon).",
            latex: `(f(g(x)))' = f'(g(x)) \\cdot g'(x)`
          });
      }

      // Step 3: The Calculation
      newSteps.push({
        title: "Beregning",
        description: "Vi utfører derivasjonen i henhold til reglene.",
        latex: `\\frac{d}{d${variable}} (${node.toTex()})`
      });

      // Final
      newSteps.push({
        title: "Resultat",
        description: "Etter å ha trukket sammen og forenklet får vi:",
        latex: simplified.toTex()
      });

      setSteps(newSteps);

    } catch (err) {
      setError("Ugyldig uttrykk");
    }
  };

  useEffect(() => {
    const timer = setTimeout(analyzeAndDerive, 600);
    return () => clearTimeout(timer);
  }, [expression, variable]);

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Input Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl sticky top-24">
          <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Oppgave
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Funksjonsuttrykk</label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary/50 transition-colors font-mono text-lg"
                placeholder="f.eks. x^2 * sin(x)"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Variabel</label>
              <input
                type="text"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                className="w-20 bg-background/50 border border-white/10 rounded-xl px-4 py-2 font-mono text-center"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
            <h4 className="text-secondary font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Tips
            </h4>
            <p className="text-sm text-gray-400">
              Prøv uttrykk som <code className="text-white bg-white/10 px-1 rounded">sin(x)/x</code> eller <code className="text-white bg-white/10 px-1 rounded">(x^2+1)^3</code> for å se ulike regler i aksjon.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Panel */}
      <div className="lg:col-span-3">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="font-medium text-secondary-100">{step.title}</span>
                <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-full">Steg {index + 1}</span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                <div className="bg-black/20 p-4 rounded-xl text-lg overflow-x-auto">
                  <Latex>{`$${step.latex}$`}</Latex>
                </div>
              </div>
            </motion.div>
          ))}

          {finalResult && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: steps.length * 0.1 }}
              className="bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30 p-8 rounded-3xl text-center"
            >
               <h3 className="text-lg font-medium text-white mb-4 flex items-center justify-center gap-2">
                 <CheckCircle className="w-5 h-5 text-green-400" /> Endelig Svar
               </h3>
               <div className="text-3xl md:text-4xl font-bold text-white overflow-x-auto py-2">
                 <Latex>{`$${finalResult}$`}</Latex>
               </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

