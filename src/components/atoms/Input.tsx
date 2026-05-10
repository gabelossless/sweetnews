import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Input({ label, icon, className = '', id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#141414] border border-white/[0.08] focus:border-primary/50 text-white rounded-2xl px-5 py-3.5 outline-none transition-all focus:ring-2 focus:ring-primary/20 ${icon ? 'pl-12' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export default Input;
