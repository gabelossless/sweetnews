import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from '../atoms/Badge';
import { useCartStore } from '../../store/cart';

interface ProductCardProps {
  product: Product;
  isFeatured?: boolean;
  onAdd: () => void;
  className?: string;
  animationDelay?: number;
}

export function ProductCard({
  product,
  isFeatured = false,
  onAdd,
  className = '',
  animationDelay = 0,
}: ProductCardProps) {
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const quantity = cartItems.find((i) => i.id === product.id)?.quantity ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.4, delay: animationDelay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative rounded-[32px] p-4 flex flex-col group card-hover-glow ${className}`}
    >
      {/* Glass backdrop */}
      <div
        className={`absolute inset-0 rounded-[32px] z-0 pointer-events-none transition-all duration-500 ${
          isFeatured
            ? 'bg-gradient-to-b from-[#e60023]/10 to-[#1a0008]/80 border border-[#e60023]/25 shadow-[0_0_40px_rgba(230,0,35,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-gradient-to-b from-white/[0.025] to-transparent border border-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] group-hover:border-white/[0.1]'
        }`}
      />

      {/* Ambient glow orb */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[55%] rounded-full z-0 pointer-events-none transition-all duration-700 blur-[48px] ${
          isFeatured
            ? 'bg-[#e60023]/12 group-hover:bg-[#e60023]/20'
            : 'bg-white/[0.03] group-hover:bg-[#e60023]/8'
        }`}
      />

      {/* Featured shimmer sweep */}
      {isFeatured && (
        <div className="absolute inset-0 rounded-[32px] overflow-hidden z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square relative z-10 flex items-center justify-center mb-4">
        <motion.img
          whileHover={{ scale: 1.12, rotate: 4, y: -6 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          alt={product.name}
          loading={isFeatured ? 'eager' : 'lazy'}
          decoding="async"
          className="w-[85%] h-[85%] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_28px_50px_rgba(230,0,35,0.2)]"
          style={{ transition: 'filter 0.4s ease' }}
          src={product.image}
        />

        {/* Tag Badge */}
        {product.tag && (
          <div className="absolute top-0 left-0">
            <Badge className="bg-black/60 backdrop-blur-md border border-white/15 text-white text-[9px] uppercase tracking-[0.2em] font-black shadow-lg">
              {product.tag}
            </Badge>
          </div>
        )}

        {/* Featured star badge */}
        {isFeatured && (
          <div className="absolute top-0 right-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e60023] to-[#ff2060] flex items-center justify-center shadow-[0_4px_12px_rgba(230,0,35,0.5)]">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      {/* Info block */}
      <div className="z-10 flex flex-col items-center text-center pb-2 px-1">
        <h3 className="font-headline-md text-[13px] leading-tight font-black uppercase tracking-[0.12em] mb-1 text-white/90 line-clamp-2 min-h-[34px] flex items-center">
          {product.name}
        </h3>
        <p className="font-body-md text-[10px] text-white/35 mb-4 line-clamp-1 tracking-wide">
          {product.description}
        </p>

        {/* Price + Quantity control */}
        <div className="w-full flex items-center justify-between px-1 mt-auto">
          <div className="flex flex-col">
            <span className="font-headline-md text-[17px] text-white tracking-[0.08em] font-black leading-none">
              ${product.price.toFixed(2)}
            </span>
            {isFeatured && (
              <span className="text-[9px] text-[#ff2060]/70 font-black uppercase tracking-wider mt-0.5">
                Featured
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.7, opacity: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                whileTap={{ scale: 0.82 }}
                whileHover={{ scale: 1.1 }}
                onClick={onAdd}
                aria-label={`Add ${product.name}`}
                className="w-9 h-9 rounded-full btn-brand flex items-center justify-center flex-shrink-0 shadow-[0_6px_20px_rgba(230,0,35,0.5)] hover:shadow-[0_8px_28px_rgba(230,0,35,0.7)] transition-shadow"
              >
                <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="flex items-center gap-0.5 rounded-full btn-brand px-1.5 py-1 flex-shrink-0 shadow-[0_6px_20px_rgba(230,0,35,0.45)]"
              >
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label="Decrease quantity"
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[13px] font-black min-w-[16px] text-center leading-none"
                >
                  {quantity}
                </motion.span>
                <button
                  onClick={onAdd}
                  aria-label="Increase quantity"
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all"
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
