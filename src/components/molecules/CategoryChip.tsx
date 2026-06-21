import { motion } from 'motion/react';

interface CategoryChipProps {
  name: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryChip({ name, icon, isActive, onClick }: CategoryChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        h-9 px-4 rounded-full flex items-center gap-2 whitespace-nowrap select-none
        text-[11px] font-medium tracking-wide transition-all duration-200
        ${isActive
          ? 'bg-primary text-black border border-primary font-semibold shadow-[0_2px_12px_rgba(212,175,55,0.25)]'
          : 'bg-white/[0.03] text-on-surface-variant border border-white/[0.04] hover:bg-white/[0.06] hover:text-white'
        }
      `}
    >
      <span className="text-[13px] leading-none">{icon}</span>
      <span>{name}</span>
    </motion.button>
  );
}

export default CategoryChip;
