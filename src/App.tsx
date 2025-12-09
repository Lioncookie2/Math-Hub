import { useState } from 'react';
import { Layout } from './components/Layout';
import { ArrowRight, Box, GitBranch, Wifi, Brain, TrendingUp, Network, CircuitBoard } from 'lucide-react';
import { motion } from 'framer-motion';

import { HessianCalculator } from './components/HessianCalculator';
import { DerivationCalculator } from './components/DerivationCalculator';
import { NetworkCalculator } from './components/NetworkCalculator';
import { CircuitLab } from './components/CircuitLab';
import { LinearRegressionLab } from './components/LinearRegressionLab';
import { GradientDescentLab } from './components/GradientDescentLab';
import { NeuralNetworkLab } from './components/NeuralNetworkLab';
import { MicroEconomicsLab } from './components/MicroEconomicsLab';

type View = 'home' | 'hessian' | 'derivation' | 'network' | 'circuit' | 'linear' | 'gradient' | 'neural' | 'economics';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <Layout>
      {currentView === 'home' && (
        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Utforsk <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Matematikken</span>
            </h1>
            <p className="text-lg text-gray-400">
              Velg verktøyet du trenger for å løse komplekse problemer med stil.
            </p>
          </div>

          {/* Hovedverktøy */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Hessian Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView('hessian')}
              className="group relative p-8 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-md text-left transition-all overflow-hidden h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Box className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Hessian Matrise</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Analyser funksjoner av to variabler. Beregn Hessian, determinant og 3D-graf.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Start Kalkulator <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>

            {/* Derivation Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView('derivation')}
              className="group relative p-8 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-md text-left transition-all overflow-hidden h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <GitBranch className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Derivasjon</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Steg-for-steg løser for derivasjon. Se reglene og utregningen visuelt.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-secondary text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Start Løser <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>

            {/* Network Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView('network')}
              className="group relative p-8 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-md text-left transition-all overflow-hidden h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <Wifi className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">IP & Subnett</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Visualiser nettverksmasker, CIDR og binære operasjoner for subnett.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Start Kalkulator <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>

            {/* Circuit Lab */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView('circuit')}
              className="group relative p-8 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-md text-left transition-all overflow-hidden h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <CircuitBoard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Kretsanalyse</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Bygg logiske kretser med drag-and-drop, animert signalflyt og sanntids verditabeller.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-secondary text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Start Lab <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>

            {/* Microeconomics Lab */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView('economics')}
              className="group relative p-8 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-md text-left transition-all overflow-hidden h-full md:col-span-2 lg:col-span-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <TrendingUp className="w-24 h-24" />
              </div>
              <div className="relative z-10 space-y-4 flex flex-col h-full">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Kostnads- & Profitthub</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex-1">
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Generer komplette mikroøkonomiske grafer fra dine kostnadsfunksjoner. 
                            Vi beregner MC, AC, Profitt og finner optimal tilpasning automatisk.
                        </p>
                        <ul className="text-sm text-gray-500 space-y-1 mb-4">
                            <li>• Støtter Frikonkurranse & Monopol</li>
                            <li>• Automatisk derivasjon (MC = dTC/dy)</li>
                            <li>• Skyggelagt profitt/tap område</li>
                        </ul>
                    </div>
                    <div className="hidden md:flex items-center justify-center bg-black/20 rounded-xl border border-white/5 p-4">
                        <div className="text-xs font-mono text-gray-400">
                            <div>TC(y) = 0.5y^2 + 20y</div>
                            <div className="text-yellow-500">Optimum found: y* = 60</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium group-hover:translate-x-1 transition-transform pt-2">
                  Start Analyse <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          </div>

          {/* Kommer Snart Seksjon */}
          <div className="max-w-6xl mx-auto pt-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-white/10" />
              <h2 className="text-xl font-medium text-gray-400 uppercase tracking-widest">Kommer Snart - AI & ML</h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 opacity-90">
               {/* Gradient Descent */}
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('gradient')}
                  className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden text-left group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <TrendingUp className="w-12 h-12" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-green-400">
                     <Brain className="w-5 h-5" />
                     <span className="font-bold text-sm">Gradient Descent</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                     Interaktiv visualisering av hvordan maskinlæringsmodeller "lærer" ved å minimere feilfunksjonen (Loss Function) i 3D-landskap.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-xs text-green-300 border border-green-500/20">
                     Start Lab <ArrowRight className="w-3 h-3" />
                  </div>
               </motion.button>

               {/* Neural Network Playground */}
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('neural')}
                  className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden text-left group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <Network className="w-12 h-12" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-purple-400">
                     <Network className="w-5 h-5" />
                     <span className="font-bold text-sm">Nevrale Nettverk</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                     Bygg dine egne enkle nevrale nettverk visuelt. Se hvordan vekter justeres og hvordan signalet flyter gjennom lagene (Forward Prop).
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-xs text-purple-300 border border-purple-500/20">
                     Start Lab <ArrowRight className="w-3 h-3" />
                  </div>
               </motion.button>

               {/* Linear Regression */}
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('linear')}
                  className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden text-left group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <TrendingUp className="w-12 h-12" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-blue-400">
                     <TrendingUp className="w-5 h-5" />
                     <span className="font-bold text-sm">Lineær Regresjon</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                     Klikk for å legge til datapunkter og se "best fit line" oppdatere seg live. Lær om minste kvadraters metode visuelt.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-xs text-blue-300 border border-blue-500/20">
                     Start Lab <ArrowRight className="w-3 h-3" />
                  </div>
               </motion.button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'hessian' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <HessianCalculator />
        </div>
      )}

      {currentView === 'derivation' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <DerivationCalculator />
        </div>
      )}

      {currentView === 'network' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <NetworkCalculator />
        </div>
      )}

      {currentView === 'circuit' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <CircuitLab />
        </div>
      )}
      {currentView === 'linear' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <LinearRegressionLab />
        </div>
      )}

      {currentView === 'gradient' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <GradientDescentLab />
        </div>
      )}

      {currentView === 'neural' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <NeuralNetworkLab />
        </div>
      )}
      {currentView === 'economics' && (
        <div className="space-y-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
          </button>
          <MicroEconomicsLab />
        </div>
      )}
    </Layout>
  );
}

export default App;
