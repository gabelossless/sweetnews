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
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={label}
      className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-full transition-all duration-150 ${
        isActive
          ? ''
          : 'text-on-surface-variant hover:text-on-background/75'
      }`}
    >
      {/* Active background outline */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="nav-active-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20"
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <div
        className={`relative z-10 transition-all duration-150 ${
          isActive
            ? 'text-primary'
            : ''
        }`}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
      </div>

      {/* Label */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.12 }}
            className="relative z-10 font-medium text-[8px] tracking-wider uppercase mt-1 text-primary leading-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default NavButton;
