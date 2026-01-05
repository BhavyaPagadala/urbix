
import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { Logo } from './Logo';
import { Language } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, language, setLanguage }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-[100] bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-4 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-500/20">
                <Logo className="w-8 h-8" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black text-white tracking-tighter block leading-none">URBIX</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">AI Gov Core</span>
              </div>
            </motion.div>

            <div className="flex items-center space-x-6">
              {/* Language Switcher */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
                {(['en', 'hi', 'te'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      language === lang ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {user && (
                <div className="flex items-center space-x-6 pl-6 border-l border-white/10">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-white">{user.username}</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{user.role}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="bg-white text-slate-950 px-5 py-2.5 rounded-xl text-sm font-black shadow-lg transition-colors hover:bg-indigo-50"
                  >
                    EXIT
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <motion.main 
        className="flex-grow max-w-[1400px] mx-auto w-full px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {children}
      </motion.main>

      <footer className="bg-slate-900 border-t border-white/5 py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
               <span className="text-xl font-black text-white tracking-tighter">URBIX</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase ml-4 tracking-widest border-l border-white/10 pl-4">v3.1 Stable</span>
            </div>
            <div className="flex space-x-10">
              <a href="#" className="text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors">Privacy</a>
              <a href="#" className="text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors">Nodes</a>
              <a href="#" className="text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors">API</a>
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              &copy; AI-DRIVEN URBAN INTELLIGENCE MATRIX
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
