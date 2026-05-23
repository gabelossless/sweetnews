import { useId } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = '' }: LogoProps) {
  // useId ensures each Logo instance gets unique SVG gradient IDs —
  // duplicate IDs in one document cause broken renders in Safari.
  const uid = useId().replace(/:/g, '');
  const gradId = `sn-g-${uid}`;
  const glowId = `sn-w-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e60023" />
          <stop offset="100%" stopColor="#ff2060" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff2060" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff2060" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${gradId})`} />
      <circle cx="24" cy="24" r="22" fill={`url(#${glowId})`} />
      {/* Crescent moon */}
      <path d="M30 16a10 10 0 1 0 0 16 8 8 0 1 1 0-16z" fill="#fff" opacity="0.95" />
    </svg>
  );
}

export default Logo;
