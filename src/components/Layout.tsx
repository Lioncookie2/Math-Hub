import React from 'react';
import { motion } from 'framer-motion';
import { Github, Calculator, Cpu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100 overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Math<span className="text-primary">Hub</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Hjem</a>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-xs uppercase tracking-wider opacity-50">Verktøy</span>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Github className="w-5 h-5 text-gray-400 hover:text-white" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 relative">
        {/* Dekorativ bakgrunnseffekt */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
           <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
           <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4" />
            Powered by React & Math.js
          </p>
        </div>
      </footer>
    </div>
  );
};

