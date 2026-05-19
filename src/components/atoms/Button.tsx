import { motion } from 'motion/react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  whileTapScale?: number;
  whileHoverScale?: number;
  className?: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
}

export function Button({
  children,
  whileTapScale = 0.95,
  whileHoverScale = 1.02,
  className = '',
  loading = false,
  fullWidth = false,
  variant = 'primary',
  disabled,
  ...props
}: ButtonProps) {

  const variants = {
    // Red → pink gradient — main CTA
    brand: 'btn-brand font-black',
    // Clean white — secondary CTA
    primary: 'bg-white text-black hover:bg-white/90 shadow-[0_10px_30px_rgba(255,255,255,0.12)] font-black',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black',
    outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5 font-black',
    ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
  };

  const baseStyles =
    'relative flex items-center justify-center gap-2 rounded-2xl px-6 py-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: whileTapScale } : {}}
      whileHover={!disabled && !loading ? { scale: whileHoverScale } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props as any}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="opacity-70">Processing...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}

export default Button;
