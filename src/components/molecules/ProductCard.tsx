import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from '../atoms/Badge';
import { useCartStore } from '../../store/cart';

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
  className = '',
}: ProductCardProps) {
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const quantity = cartItems.find((i) => i.id === product.id)?.quantity ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      className={`relative rounded-[32px] p-4 flex flex-col group ${className}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent border ${
          isFeatured
            ? 'border-[#e60023]/30 shadow-[0_0_24px_rgba(230,0,35,0.08)]'
            : 'border-white/[0.05]'
        } rounded-[32px] z-0 pointer-events-none`}
      />

      {/* Glow orb */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] ${
          isFeatured ? 'bg-[#e60023]/8 blur-[50px]' : 'bg-white/5 blur-[40px]'
        } rounded-full z-0 group-hover:bg-[#e60023]/10 transition-colors duration-500`}
      />

      {/* Image */}
      <div className="aspect-square relative z-10 flex items-center justify-center mb-4">
        <motion.img
          whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          alt={product.name}
          className="w-[85%] h-[85%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
          src={product.image}
        />
        {product.tag && (
          <div className="absolute top-0 left-0">
            <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] uppercase tracking-[0.2em] font-black">
              {product.tag}
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="z-10 flex flex-col items-center text-center pb-2 px-1">
        <h3 className="font-headline-md text-[14px] leading-tight font-black uppercase tracking-[0.15em] mb-1 text-white/90 line-clamp-2 min-h-[34px] flex items-center">
          {product.name}
        </h3>
        <p className="font-body-md text-[11px] text-white/40 mb-4 line-clamp-1 tracking-wide">
          {product.description}
        </p>

        {/* Price + Quantity control */}
        <div className="w-full flex items-center justify-between px-1 mt-auto">
          <span className="font-headline-md text-[16px] text-white tracking-[0.1em] font-black">
            ${product.price.toFixed(2)}
          </span>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              /* DoorDash-style "+" pill */
              <motion.button
                key="add"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                whileTap={{ scale: 0.85 }}
                onClick={onAdd}
                aria-label={`Add ${product.name}`}
                className="w-9 h-9 rounded-full btn-brand flex items-center justify-center flex-shrink-0"
              >
                <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </motion.button>
            ) : (
              /* UberEats-style stepper */
              <motion.div
                key="stepper"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center gap-0.5 rounded-full btn-brand px-1.5 py-1 flex-shrink-0"
              >
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label="Decrease quantity"
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <span className="text-[13px] font-black min-w-[16px] text-center leading-none">
                  {quantity}
                </span>
                <button
                  onClick={onAdd}
                  aria-label="Increase quantity"
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
