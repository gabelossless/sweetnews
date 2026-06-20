interface OwlMascotProps {
  size?: number;
  className?: string;
}

export function OwlMascot({ size = 160, className = '' }: OwlMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 180"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sweet News Owl Mascot"
      role="img"
    >
      {/* Shadow */}
      <ellipse cx="80" cy="174" rx="36" ry="6" fill="#d97706" opacity="0.15" />

      {/* Wings */}
      <ellipse cx="24" cy="110" rx="22" ry="38" fill="#0f1210" transform="rotate(-12 24 110)" />
      <ellipse cx="136" cy="110" rx="22" ry="38" fill="#0f1210" transform="rotate(12 136 110)" />

      {/* Body */}
      <ellipse cx="80" cy="112" rx="46" ry="58" fill="#141815" />

      {/* Chest / belly */}
      <ellipse cx="80" cy="120" rx="28" ry="40" fill="#1b221d" />

      {/* Chest feather scallops */}
      {[0, 1, 2, 3].map((row) =>
        [-1, 0, 1].map((col) => (
          <ellipse
            key={`${row}-${col}`}
            cx={80 + col * 16}
            cy={96 + row * 18}
            rx="10"
            ry="7"
            fill="#222c26"
            opacity="0.7"
          />
        ))
      )}

      {/* Facial disc */}
      <ellipse cx="80" cy="88" rx="42" ry="44" fill="#1b221d" />

      {/* Left ear tuft */}
      <polygon points="52,52 44,28 64,46" fill="#141815" />
      <polygon points="52,52 46,30 60,48" fill="#1b221d" />

      {/* Right ear tuft */}
      <polygon points="108,52 96,46 116,28" fill="#141815" />
      <polygon points="108,52 100,48 114,30" fill="#1b221d" />

      {/* Left eye ring (outer) */}
      <circle cx="62" cy="88" r="20" fill="white" opacity="0.92" />
      {/* Left eye iris */}
      <circle cx="62" cy="88" r="14" fill="#d97706" />
      {/* Left pupil */}
      <circle cx="62" cy="88" r="8" fill="#050000" />
      {/* Left eye highlight */}
      <circle cx="57" cy="83" r="3" fill="white" opacity="0.9" />
      <circle cx="65" cy="91" r="1.5" fill="white" opacity="0.5" />

      {/* Right eye ring (outer) */}
      <circle cx="98" cy="88" r="20" fill="white" opacity="0.92" />
      {/* Right eye iris */}
      <circle cx="98" cy="88" r="14" fill="#d97706" />
      {/* Right pupil */}
      <circle cx="98" cy="88" r="8" fill="#050000" />
      {/* Right eye highlight */}
      <circle cx="93" cy="83" r="3" fill="white" opacity="0.9" />
      <circle cx="101" cy="91" r="1.5" fill="white" opacity="0.5" />

      {/* Beak */}
      <polygon points="80,100 72,114 88,114" fill="#ff8c42" />
      <line x1="72" y1="107" x2="88" y2="107" stroke="#e67030" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left foot */}
      <line x1="60" y1="162" x2="46" y2="172" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="162" x2="60" y2="174" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="162" x2="72" y2="172" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />

      {/* Right foot */}
      <line x1="100" y1="162" x2="88" y2="172" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="162" x2="100" y2="174" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="162" x2="112" y2="172" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />

      {/* Brand accent — tiny glow around eyes */}
      <circle cx="62" cy="88" r="20" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.4" />
      <circle cx="98" cy="88" r="20" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

export default OwlMascot;
