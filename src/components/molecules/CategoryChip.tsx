import { motion } from 'motion/react';

interface CategoryChipProps {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryChip({ 
  name, 
  icon, 
  isActive, 
  onClick 
}: CategoryChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`h-9 px-4 rounded-full flex items-center gap-1.5 transition-all text-[13px] font-medium whitespace-nowrap scrollbar-hide border ${
        isActive
          ? 'btn-brand border-transparent shadow-[0_4px_20px_rgba(230,0,35,0.35)]'
          : 'bg-[#0f0f0f] text-on-surface-variant border-white/[0.06] hover:bg-white/[0.05]'
      }`}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </motion.button>
  );
}

export default CategoryChip;
