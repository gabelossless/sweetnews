import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.82 }}
      onClick={onClick}
      aria-label={label}
      className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-[18px] transition-all duration-300 ${
        isActive
          ? ''
          : 'text-on-surface-variant hover:text-on-background/75 hover:bg-on-background/[0.05]'
      }`}
    >
      {/* Active background pill */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="nav-active-bg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute inset-0 rounded-[18px] bg-gradient-to-b from-pink/20 to-pink/5 border border-pink/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div
        animate={isActive ? { y: -1, scale: 1.08 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative z-10 transition-all duration-200 ${
          isActive
            ? 'text-pink drop-shadow-[0_0_12px_rgba(255,77,141,0.8)]'
            : ''
        }`}
      >
        {icon}
      </motion.div>

      {/* Label — slides up into view when active */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 font-headline-md text-[8px] font-black tracking-[0.18em] uppercase mt-0.5 text-pink leading-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Live dot indicator at bottom */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink animate-live-pulse shadow-[0_0_6px_rgba(255,77,141,0.8)]"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default NavButton;
