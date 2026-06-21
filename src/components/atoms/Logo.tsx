import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <div
      className={`flex items-center font-serif select-none tracking-wide ${className}`}
      style={{ fontSize: `${size * 0.42}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <span className="text-[#fcfcfd] font-light">Sweet</span>
      <span className="text-primary font-medium italic ml-1.5">News</span>
    </div>
  );
}

export default Logo;
