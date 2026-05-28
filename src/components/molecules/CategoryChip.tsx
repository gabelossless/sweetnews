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
          ? 'bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.12)]'
          : 'bg-white/[0.05] text-white/55 border border-white/[0.07] active:bg-white/[0.10]'
        }
      `}
    >
      <span className="text-[15px] leading-none">{icon}</span>
      <span>{name}</span>
    </motion.button>
  );
}

export default CategoryChip;
