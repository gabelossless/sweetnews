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
      whileTap={{ scale: 0.91 }}
      onClick={onClick}
      className={`
        h-11 px-5 rounded-full flex items-center gap-2 whitespace-nowrap select-none
        text-[13px] font-bold tracking-wide transition-colors duration-150
        ${isActive
          ? 'bg-secondary text-on-secondary shadow-[0_4px_20px_rgba(42,26,31,0.12)]'
          : 'bg-on-background/[0.05] text-on-surface-variant border border-on-background/[0.07] active:bg-on-background/[0.07]'
        }
      `}
    >
      <span className="text-[15px] leading-none">{icon}</span>
      <span>{name}</span>
    </motion.button>
  );
}

export default CategoryChip;
