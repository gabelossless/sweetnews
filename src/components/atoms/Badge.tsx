import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <div className={`bg-surface/80 backdrop-blur-md px-2.5 py-1 rounded-lg font-label-bold text-on-background/70 text-[10px] uppercase tracking-widest border border-on-background/[0.09] ${className}`}>
      {children}
    </div>
  );
}

export default Badge;
