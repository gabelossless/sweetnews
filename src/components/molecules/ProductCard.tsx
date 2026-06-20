import { useState } from 'react';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cart';

interface ProductCardProps {
  product: Product;
  isFeatured?: boolean;
  onAdd: () => void;
  onView?: () => void;
  className?: string;
}

export function ProductCard({
  product,
  isFeatured = false,
  onAdd,
  onView,
  className = '',
}: ProductCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const quantity = cartItems.find((i) => i.id === product.id)?.quantity ?? 0;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Image container */}
      <div
        className={`relative w-full aspect-square rounded-[16px] overflow-hidden mb-2.5 bg-surface-dim card-hover-lift ${onView ? 'cursor-pointer' : ''} ${isFeatured ? 'ring-1 ring-primary/20 shadow-[0_20px_50px_rgba(230,0,35,0.10)]' : ''}`}
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
            <img
              src={product.image}
              alt={product.name}
              loading={isFeatured ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-full object-contain p-3 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-background/30 text-center leading-snug">
              {product.name.split(' ').slice(0, 2).join('\\n')}
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
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_4px_10px_rgba(217,119,6,0.5)]">
            <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
        )}

        {/* Add / quantity overlay */}
        <div className="absolute bottom-2.5 right-2.5">
          {quantity === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              aria-label={`Add ${product.name}`}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(217,119,6,0.45)] active:scale-90 transition-transform duration-150 hover:brightness-110"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
          ) : (
            <div
              className="flex items-center gap-1 bg-primary rounded-full px-1.5 py-1 shadow-[0_4px_12px_rgba(217,119,6,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                aria-label="Decrease quantity"
                className="w-5 h-5 rounded-full flex items-center justify-center active:bg-white/25 active:scale-90 transition-all duration-150"
              >
                <Minus className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
              <span className="text-[12px] font-black text-white min-w-[14px] text-center leading-none">
                {quantity}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                aria-label="Increase quantity"
                className="w-5 h-5 rounded-full flex items-center justify-center active:bg-white/25 active:scale-90 transition-all duration-150"
              >
                <Plus className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
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
    </div>
  );
}

export default ProductCard;
