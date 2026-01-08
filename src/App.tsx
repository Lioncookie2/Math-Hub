import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { ArrowRight, Search, ChevronUp, ChevronDown, BookOpen, User, Mail, Code, Zap, Database, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { HessianCalculator } from './components/HessianCalculator';
import { DerivationCalculator } from './components/DerivationCalculator';
import { NetworkCalculator } from './components/NetworkCalculator';
import { CircuitLab } from './components/CircuitLab';
import { LinearRegressionLab } from './components/LinearRegressionLab';
import { GradientDescentLab } from './components/GradientDescentLab';
import { NeuralNetworkLab } from './components/NeuralNetworkLab';
import { MicroEconomicsLab } from './components/MicroEconomicsLab';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { MatrixPlayground } from './components/MatrixPlayground';
import { LinkedListAnimator } from './components/LinkedListAnimator';
import { RecursionTracer } from './components/RecursionTracer';
import { DistributionSandbox } from './components/DistributionSandbox';
import { PValueVisualizer } from './components/PValueVisualizer';

import { SEMESTERS } from './utils/courses';
import type { View, Semester } from './utils/courses';

function App() {
  const [currentView, setCurrentView] = useState<View | 'home' | 'about'>('home');
  const [showVision, setShowVision] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string; gradient: string }> = {
      'text-primary': {
        bg: 'bg-primary/20',
        text: 'text-primary',
        hover: 'group-hover:bg-primary group-hover:text-white',
        gradient: 'from-primary/10'
      },
      'text-secondary': {
        bg: 'bg-secondary/20',
        text: 'text-secondary',
        hover: 'group-hover:bg-secondary group-hover:text-white',
        gradient: 'from-secondary/10'
      },
      'text-accent': {
        bg: 'bg-accent/20',
        text: 'text-accent',
        hover: 'group-hover:bg-accent group-hover:text-white',
        gradient: 'from-accent/10'
      },
      'text-blue-500': {
        bg: 'bg-blue-500/20',
        text: 'text-blue-500',
        hover: 'group-hover:bg-blue-500 group-hover:text-white',
        gradient: 'from-blue-500/10'
      },
      'text-purple-500': {
        bg: 'bg-purple-500/20',
        text: 'text-purple-500',
        hover: 'group-hover:bg-purple-500 group-hover:text-white',
        gradient: 'from-purple-500/10'
      },
      'text-green-500': {
        bg: 'bg-green-500/20',
        text: 'text-green-500',
        hover: 'group-hover:bg-green-500 group-hover:text-white',
        gradient: 'from-green-500/10'
      },
      'text-yellow-500': {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-500',
        hover: 'group-hover:bg-yellow-500 group-hover:text-white',
        gradient: 'from-yellow-500/10'
      },
      'text-orange-500': {
        bg: 'bg-orange-500/20',
        text: 'text-orange-500',
        hover: 'group-hover:bg-orange-500 group-hover:text-white',
        gradient: 'from-orange-500/10'
      },
      'text-cyan-500': {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-500',
        hover: 'group-hover:bg-cyan-500 group-hover:text-white',
        gradient: 'from-cyan-500/10'
      },
      'text-gray-500': {
        bg: 'bg-gray-500/20',
        text: 'text-gray-500',
        hover: 'group-hover:bg-gray-500 group-hover:text-white',
        gradient: 'from-gray-500/10'
      }
    };
    return colorMap[colorName] || colorMap['text-primary'];
  };

  const ToolCard = ({
    title,
    description,
    icon: Icon,
    color,
    onClick,
    disabled = false
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => {
    const colors = getColorClasses(color);

    return (
      <motion.button
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`group relative p-6 rounded-2xl border text-left transition-all overflow-hidden h-full ${disabled
          ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
          : 'border-white/10 bg-surface/30 backdrop-blur-md hover:border-white/20'
          }`}
      >
        {!disabled && (
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
        )}
        <div className="relative z-10 space-y-3 flex flex-col h-full">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} ${!disabled ? colors.hover : ''} transition-colors`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {description}
            </p>
          </div>
          {!disabled && (
            <div className={`flex items-center gap-2 ${colors.text} text-sm font-medium group-hover:translate-x-1 transition-transform`}>
              Start <ArrowRight className="w-4 h-4" />
            </div>
          )}
          {disabled && (
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              Kommer snart
            </div>
          )}
        </div>
      </motion.button>
    );
  };

  const filteredSemesters = useMemo(() => {
    if (!searchQuery) return SEMESTERS;
    const query = searchQuery.toLowerCase();

    return SEMESTERS.filter(semester =>
      semester.courses.some(course =>
        course.code.toLowerCase().includes(query) ||
        course.name.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const handleBack = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
    } else if (selectedSemester) {
      setSelectedSemester(null);
    }
  };

  return (
    <Layout onNavClick={(view) => {
      setCurrentView(view);
      setSelectedSemester(null);
    }}>
      <div className="space-y-16">
        {/* Header med MA:KI og Visjon */}
        {currentView === 'home' && !selectedSemester && (
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-7xl md:text-9xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">MA:KI</span>
            </h1>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-2xl font-semibold text-white">Vår Visjon</h2>
                <button
                  onClick={() => setShowVision(!showVision)}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-surface/30 hover:bg-surface/50 transition-colors text-sm text-gray-300 hover:text-white flex items-center gap-2"
                >
                  {showVision ? 'Lukk' : 'Les mer'}
                  {showVision ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {showVision && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-left bg-surface/30 border border-white/10 rounded-2xl p-8 space-y-8 overflow-hidden"
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Hva er MA:KI?
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        MA:KI er en omfattende læringsplattform designet spesielt for studieløpet i Maskinlæring og Kunstig Intelligens.
                        Målet er å gjøre læring mer engasjerende og forståelig gjennom interaktive visualiseringer og sanntidsberegninger.
                        Ved å manipulere verdier direkte, bygges en dypere intuitiv forståelse.
                      </p>
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-6">
                      <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Om utvikleren
                      </h3>
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                          <User className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-2xl font-bold text-white">Sebastian Miles Holme</h4>
                            <p className="text-primary font-medium">Daglig leder, MilesTech AS • Student, MA:KI</p>
                          </div>

                          <p className="text-gray-300 leading-relaxed italic">
                            "Jeg er født i 2004 og studerer for tiden Maskinlæring og Kunstig Intelligens ved UiO, hvor jeg nå er på mitt andre semester.
                            Ved siden av studiene leder jeg <span className="text-secondary font-bold">MilesTech AS</span>, hvor vi leverer skreddersydde dataprogrammeringstjenester."
                          </p>

                          <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-400 pt-2">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-primary" />
                              <span>Tilbakemeldinger: <span className="text-white">post@milestech.no</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Om Prosjektet View */}
        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold text-white">Om <span className="text-primary">MA:KI</span>-prosjektet</h2>
              <p className="text-xl text-gray-400">En state-of-the-art læringsplattform for fremtidens ingeniører.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-2">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Filosofi</h3>
                <p className="text-gray-400 leading-relaxed">
                  Vi tror på at den beste måten å lære matematikk og algoritmer på er å "røre" ved verdiene.
                  Ved å manipulere parametere og se resultatene umiddelbart, bygges en dypere intuitiv forståelse
                  som tørre tekstbøker alene ikke kan gi.
                </p>
              </div>

              <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-2">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Teknologi</h3>
                <p className="text-gray-400 leading-relaxed">
                  MA:KI er bygget for hastighet og personvern. Vi bruker <span className="text-white font-bold">Vite & React</span> for et lynraskt grensesnitt, <span className="text-white font-bold">Framer Motion</span> for silkemyke animasjoner og <span className="text-white font-bold">Tailwind CSS</span> for design.
                  Viktigst av alt: Vi bruker <span className="text-primary font-bold">ingen eksterne API-kall</span> eller overvåking; alt kjører lokalt i din nettleser.
                </p>
              </div>
            </div>

            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-8">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Fullstack Uavhengighet</h3>
                  <p className="text-sm text-gray-500 font-mono">Zero external API dependencies</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Vite', desc: 'Build tool' },
                  { name: 'React', desc: 'UI Framework' },
                  { name: 'Lucide', desc: 'Iconography' },
                  { name: 'Framer', desc: 'Motion' }
                ].map(tech => (
                  <div key={tech.name} className="p-4 bg-black/20 rounded-2xl border border-white/5 text-center">
                    <div className="text-white font-bold mb-1">{tech.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 text-center space-y-6">
              <h3 className="text-2xl font-bold text-white">Vil du bidra eller har du funnet en feil?</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Vi bygger dette for studenter, av studenter. Hvis du har forslag til nye verktøy, eller oppdager småfeil i beregningene,
                vil vi gjerne høre fra deg. Din innsikt gjør MA:KI bedre for alle.
              </p>
              <div className="flex justify-center gap-4">
                <a href="mailto:post@milestech.no" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Kontakt oss
                </a>
                <a href="https://milestech.no" className="px-8 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/10">
                  <ExternalLink className="w-5 h-5" /> MilesTech.no
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Home View / Semester Grid */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {!selectedSemester ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Search bar */}
                  <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Søk på emnekode eller emnenavn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface/30 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-white"
                    />
                  </div>

                  {/* Grid layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSemesters.map((semester) => (
                      <motion.button
                        key={semester.number}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSemester(semester)}
                        className="p-8 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-md hover:border-primary/30 transition-all text-left flex flex-col justify-between group"
                      >
                        <div className="space-y-4">
                          <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors">
                            Semester {semester.number}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {semester.courses.map(course => (
                              <span key={course.code} className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 border border-white/5">
                                {course.code}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-primary font-medium">
                          Utforsk <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {filteredSemesters.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                      Ingen resultater for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="semester-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button
                    onClick={handleBack}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til semestersider
                  </button>

                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-bold text-white">
                      Semester {selectedSemester.number}
                    </h2>
                  </div>

                  <div className="space-y-12">
                    {selectedSemester.courses.map((course) => (
                      <div key={course.code} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="text-2xl font-semibold text-white">
                            {course.code} - {course.name}
                          </h3>
                        </div>

                        {course.categories ? (
                          <div className="grid grid-cols-1 gap-8">
                            {course.categories.map((category) => (
                              <div key={category.name} className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                  <category.icon className="w-4 h-4" />
                                  <h4 className="text-sm font-medium uppercase tracking-wider">{category.name}</h4>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {category.tools.map((tool, idx) => (
                                    <ToolCard
                                      key={idx}
                                      title={tool.title}
                                      description={tool.description}
                                      icon={tool.icon}
                                      color={tool.color}
                                      onClick={tool.view ? () => setCurrentView(tool.view!) : undefined}
                                      disabled={tool.disabled}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {course.tools?.map((tool, idx) => (
                              <ToolCard
                                key={idx}
                                title={tool.title}
                                description={tool.description}
                                icon={tool.icon}
                                color={tool.color}
                                onClick={tool.view ? () => setCurrentView(tool.view!) : undefined}
                                disabled={tool.disabled}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Detailed Tool Views */}
        <AnimatePresence mode="wait">
          {currentView !== 'home' && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button
                onClick={handleBack}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" /> Tilbake til oversikt
              </button>

              {currentView === 'hessian' && <HessianCalculator />}
              {currentView === 'derivation' && <DerivationCalculator />}
              {currentView === 'network' && <NetworkCalculator />}
              {currentView === 'circuit' && <CircuitLab />}
              {currentView === 'linear' && <LinearRegressionLab />}
              {currentView === 'gradient' && <GradientDescentLab />}
              {currentView === 'neural' && <NeuralNetworkLab />}
              {currentView === 'economics' && <MicroEconomicsLab />}
              {currentView === 'algorithm' && <AlgorithmVisualizer />}
              {currentView === 'matrix' && <MatrixPlayground />}
              {currentView === 'linked-list' && <LinkedListAnimator />}
              {currentView === 'recursion' && <RecursionTracer />}
              {currentView === 'distribution' && <DistributionSandbox />}
              {currentView === 'p-value' && <PValueVisualizer />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default App;
