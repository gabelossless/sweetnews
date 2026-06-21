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
        className={`relative w-full aspect-square rounded-[20px] border border-white/5 overflow-hidden mb-2.5 bg-surface-dim card-hover-lift ${onView ? 'cursor-pointer' : ''} ${isFeatured ? 'ring-1 ring-primary/30' : ''}`}
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
            <span className="text-[11px] font-serif italic text-on-background/30 text-center leading-snug">
              {product.name.split(' ').slice(0, 2).join('\n')}
            </span>
          </div>
        )}
        
        {/* Tag badge */}
        {product.tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[8px] font-medium uppercase tracking-wider bg-black/90 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              {product.tag}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2.5 right-2.5 border border-primary bg-primary text-black px-2.5 py-0.5 rounded-full font-serif text-[8px] font-semibold italic">
            Featured
          </div>
        )}

        {/* Add / quantity overlay */}
        <div className="absolute bottom-2.5 right-2.5">
          {quantity === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              aria-label={`Add ${product.name}`}
              className="w-7 h-7 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-all duration-100 hover:bg-primary/95 shadow-md shadow-black/40"
            >
              <Plus className="w-3.5 h-3.5 text-black" strokeWidth={3} />
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 bg-primary rounded-full p-1 shadow-md shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                aria-label="Decrease quantity"
                className="w-5 h-5 rounded-full flex items-center justify-center active:bg-black/10 transition-all"
              >
                <Minus className="w-3 h-3 text-black" strokeWidth={3} />
              </button>
              <span className="text-[11px] font-medium text-black min-w-[14px] text-center leading-none">
                {quantity}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                aria-label="Increase quantity"
                className="w-5 h-5 rounded-full flex items-center justify-center active:bg-black/10 transition-all"
              >
                <Plus className="w-3 h-3 text-black" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product info */}
      <div
        className={`px-1 py-1 ${onView ? 'cursor-pointer' : ''}`}
        onClick={onView}
        role={onView ? 'button' : undefined}
        tabIndex={onView ? 0 : undefined}
        onKeyDown={onView ? (e) => e.key === 'Enter' && onView() : undefined}
        aria-label={onView ? `View ${product.name} details` : undefined}
      >
        <h3 className="text-[13px] font-serif font-medium text-white tracking-wide truncate leading-tight mb-0.5">
          {product.name}
        </h3>
        <p className="text-[10px] text-on-surface-variant truncate mb-1 leading-tight">
          {product.description}
        </p>
        <p className="text-[13px] font-medium text-primary leading-none">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default ProductCard;
