import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <div className={`bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg font-label-bold text-white text-[10px] uppercase tracking-widest border border-white/10 ${className}`}>
      {children}
    </div>
  );
}

export default Badge;
