
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  color?: string;
  size?: number;
  interactive?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", color = "currentColor", interactive = false }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        staggerChildren: 0.1
      } 
    }
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  };

  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={interactive ? { scale: 1.1, rotate: 5 } : {}}
    >
      {/* Outer Hexagon Shield */}
      <motion.path
        d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.1"
        variants={pathVariants}
      />
      
      {/* City Skyline Silhouette */}
      <motion.path
        d="M25 75 V55 H35 V45 H50 V35 H65 V55 H75 V75 Z"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={pathVariants}
      />
      
      {/* Dynamic Data Core */}
      <motion.circle
        cx="50"
        cy="55"
        r="8"
        fill={color}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.4, 1, 0.4],
          scale: [0.8, 1.2, 0.8],
          filter: ["blur(0px)", "blur(4px)", "blur(0px)"]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Connectivity Nodes */}
      <motion.circle cx="35" cy="45" r="2" fill={color} variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.6 } }} />
      <motion.circle cx="65" cy="55" r="2" fill={color} variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.6 } }} />
      <motion.circle cx="50" cy="35" r="2" fill={color} variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.6 } }} />

      {/* Scanner Beam Effect */}
      <motion.rect
        x="20"
        y="30"
        width="60"
        height="2"
        fill={color}
        initial={{ opacity: 0, y: 0 }}
        animate={{ 
          opacity: [0, 0.5, 0],
          y: [0, 40, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
};
