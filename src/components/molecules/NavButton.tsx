import React from 'react';
import { motion } from 'motion/react';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <motion.button 
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
        isActive 
          ? 'text-primary scale-110' 
          : 'text-on-surface-variant hover:text-primary'
      }`}
    >
      <div className={`mb-1 relative ${isActive ? 'fill-current' : ''}`}>
        {isActive && (
          <motion.div 
            layoutId="nav-indicator"
            className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-sm"
          />
        )}
        {icon}
      </div>
      <span className={`font-headline-md text-[11px] font-extrabold tracking-wide uppercase ${isActive ? '' : 'opacity-80'}`}>
        {label}
      </span>
    </motion.button>
  );
}

export default NavButton;
