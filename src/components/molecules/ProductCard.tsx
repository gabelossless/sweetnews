import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface ProductCardProps {
  product: Product;
  isFeatured?: boolean;
  onAdd: () => void;
  className?: string;
}

export function ProductCard({ 
  product, 
  isFeatured = false, 
  onAdd, 
  className = '' 
}: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      className={`relative rounded-[32px] p-4 flex flex-col group ${className}`}
    >
      {/* Deep Shadow Backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent border ${isFeatured ? 'border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/[0.05]'} rounded-[32px] z-0 pointer-events-none`} />
      
      {/* Stage platform glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] ${isFeatured ? 'bg-white/10 blur-[50px]' : 'bg-white/5 blur-[40px]'} rounded-full z-0 group-hover:bg-white/10 transition-colors duration-500`} />
      
      <div className="aspect-square relative z-10 flex items-center justify-center mb-6">
        <motion.img 
          whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          alt={product.name}
          className="w-[85%] h-[85%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" 
          src={product.image} 
        />
        {product.tag && (
          <div className="absolute top-0 left-0">
            <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] uppercase tracking-[0.2em] font-black">{product.tag}</Badge>
          </div>
        )}
      </div>

      <div className="z-10 flex flex-col items-center text-center pb-2 px-1">
        <h3 className="font-headline-md text-[14px] leading-tight font-black uppercase tracking-[0.15em] mb-1.5 text-white/90 line-clamp-2 min-h-[34px] flex items-center">{product.name}</h3>
        <p className="font-body-md text-[11px] text-white/40 mb-5 line-clamp-1 tracking-wide">{product.description}</p>
        
        <div className="w-full flex items-center justify-between px-1 mt-auto">
          <span className="font-headline-md text-[16px] text-white tracking-[0.1em] font-black">
            ${product.price.toFixed(2)}
          </span>
          <Button
            whileTapScale={0.85}
            onClick={onAdd}
            aria-label={`Add ${product.name}`}
            className="w-10 h-10 rounded-full btn-brand flex items-center justify-center transition-all"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
