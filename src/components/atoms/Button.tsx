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
    brand: 'btn-brand font-medium tracking-wide',
    primary: 'bg-surface border border-white/5 text-on-background hover:bg-surface-bright font-medium tracking-wide',
    secondary: 'bg-white/[0.03] border border-white/[0.06] text-on-background hover:bg-white/[0.06] font-medium tracking-wide',
    outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5 font-medium tracking-wide',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-background hover:bg-white/[0.03] font-medium tracking-wide',
  };

  const baseStyles =
    'relative flex items-center justify-center gap-2 rounded-full px-6 py-3.5 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

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
