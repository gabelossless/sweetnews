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
      className={`flex flex-col items-center justify-center w-16 h-16 rounded-[20px] transition-all duration-300 relative ${
        isActive
          ? 'scale-105'
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <div className={`mb-1 relative z-10 ${isActive ? 'text-[#ff2060] drop-shadow-[0_0_10px_rgba(255,32,96,0.8)]' : ''}`}>
        {icon}
      </div>
      <span className={`font-headline-md text-[9px] font-black tracking-widest uppercase mt-0.5 z-10 ${isActive ? 'opacity-100 text-[#ff2060]' : 'opacity-0 scale-75 hidden'}`}>
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-[20px] border border-[#e60023]/20 bg-gradient-to-b from-[#e60023]/10 to-[#ff2060]/5 shadow-[inset_0_0_20px_rgba(230,0,35,0.08)]"
        />
      )}
    </motion.button>
  );
}

export default NavButton;
