import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cart';

interface ProductCardProps {
  product: Product;
  isFeatured?: boolean;
  onAdd: () => void;
  onView?: () => void;
  className?: string;
  animationDelay?: number;
}

export function ProductCard({
  product,
  isFeatured = false,
  onAdd,
  onView,
  className = '',
  animationDelay = 0,
}: ProductCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const quantity = cartItems.find((i) => i.id === product.id)?.quantity ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -32px 0px' }}
      transition={{ duration: 0.32, delay: animationDelay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex flex-col ${className}`}
    >
      {/* Image container */}
      <div
        className={`relative w-full aspect-square rounded-[16px] overflow-hidden mb-2.5 bg-surface-dim ${onView ? 'cursor-pointer' : ''}`}
        onClick={onView}
        role={onView ? 'button' : undefined}
        aria-label={onView ? `View ${product.name} details` : undefined}
        tabIndex={onView ? 0 : undefined}
        onKeyDown={onView ? (e) => e.key === 'Enter' && onView() : undefined}
      >

        {/* Image or placeholder */}
        {product.image ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-surface-container animate-shimmer-sweep overflow-hidden" />
            )}
            <motion.img
              src={product.image}
              alt={product.name}
              loading={isFeatured ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              whileHover={{ scale: 1.06 }}
              transition={{
                opacity: { duration: 0.24 },
                scale: { type: 'spring', stiffness: 260, damping: 20 }
              }}
              className="w-full h-full object-contain p-3"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-background/30 text-center leading-snug">
              {product.name.split(' ').slice(0, 2).join('\n')}
            </span>
          </div>
        )}

        {/* Tag badge */}
        {product.tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/80 backdrop-blur-sm text-on-background/70 px-2 py-1 rounded-full border border-on-background/[0.08]">
              {product.tag}
            </span>
          </div>
        )}

        {/* Featured sparkle badge */}
        {isFeatured && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-[#e60023] to-[#ff2060] flex items-center justify-center shadow-[0_4px_10px_rgba(230,0,35,0.5)]">
            <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
        )}

        {/* Add / quantity overlay — bottom-right of image */}
        <AnimatePresence mode="wait">
          {quantity === 0 ? (
            <motion.button
              key="add"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              whileTap={{ scale: 0.86 }}
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              aria-label={`Add ${product.name}`}
              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#ff2d55] flex items-center justify-center shadow-[0_4px_12px_rgba(255,45,85,0.45)] hover:bg-[#e60023] transition-colors"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </motion.button>
          ) : (
            <motion.div
              key="stepper"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-[#ff2d55] rounded-full px-1.5 py-1 shadow-[0_4px_12px_rgba(255,45,85,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                aria-label="Decrease quantity"
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all"
              >
                <Minus className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.35, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[12px] font-black text-white min-w-[14px] text-center leading-none"
              >
                {quantity}
              </motion.span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                aria-label="Increase quantity"
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all"
              >
                <Plus className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product info */}
      <div
        className={`px-0.5 ${onView ? 'cursor-pointer' : ''}`}
        onClick={onView}
        role={onView ? 'button' : undefined}
        tabIndex={onView ? 0 : undefined}
        onKeyDown={onView ? (e) => e.key === 'Enter' && onView() : undefined}
        aria-label={onView ? `View ${product.name} details` : undefined}
      >
        <h3 className="text-[13px] font-semibold text-on-background truncate leading-tight mb-0.5">
          {product.name}
        </h3>
        <p className="text-[11px] text-on-surface-variant truncate mb-1.5 leading-tight">
          {product.description}
        </p>
        <p className="text-[14px] font-bold text-on-background leading-none">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}

export default ProductCard;
