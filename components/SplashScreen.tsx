
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Nodes...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    const statusTimers = [
      setTimeout(() => setStatus("Scanning Urban Grid..."), 600),
      setTimeout(() => setStatus("Connecting to AI Core..."), 1200),
      setTimeout(() => setStatus("Decrypting Civic Data..."), 1800),
      setTimeout(() => setStatus("Matrix Ready."), 2400),
    ];

    return () => {
      clearInterval(timer);
      statusTimers.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10"
        >
          <Logo className="w-32 h-32 text-indigo-500" interactive />
        </motion.div>
        
        {/* Decorative Background Glow */}
        <motion.div 
          className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="mt-12 w-64 space-y-4">
        <div className="flex justify-between items-end">
          <motion.p 
            key={status}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]"
          >
            {status}
          </motion.p>
          <span className="text-[10px] font-black text-slate-500">{progress}%</span>
        </div>
        
        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 flex flex-col items-center"
      >
        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[1em] mb-2">System Authority</span>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div 
              key={i}
              className="w-1 h-1 bg-indigo-500/30 rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
