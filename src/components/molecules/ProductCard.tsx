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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      className={`bg-[#0a0a0a] rounded-[28px] p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/[0.06] flex flex-col hover:bg-[#111] transition-colors ${className}`}
    >
      <div className="aspect-[4/3] rounded-[20px] bg-surface-container overflow-hidden mb-3 relative group flex-shrink-0">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          alt={product.name}
          className="w-full h-full object-cover" 
          src={product.image} 
        />
        {product.tag && (
          <div className="absolute top-2.5 left-2.5">
            <Badge>{product.tag}</Badge>
          </div>
        )}
      </div>
      <div className="px-1.5 flex-1 flex flex-col pb-1">
        <h3 className="font-headline-md text-[15px] font-semibold leading-tight mb-1 text-on-surface line-clamp-1">{product.name}</h3>
        <p className="font-body-md text-[12px] text-on-surface-variant truncate mb-3">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="font-label-bold text-[14px] text-on-surface tracking-tight font-medium">
            ${product.price.toFixed(2)}
          </div>
          <Button 
            whileTapScale={0.92}
            onClick={onAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`h-8 px-3.5 rounded-full font-label-bold text-[13px] transition-all flex justify-center items-center gap-1 ${
              isFeatured 
                ? 'bg-primary text-on-primary shadow-[0_2px_10px_rgba(230,0,35,0.3)] hover:shadow-[0_4px_15px_rgba(230,0,35,0.4)]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
