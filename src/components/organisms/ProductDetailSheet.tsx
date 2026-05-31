import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Sparkles, AlertTriangle, Plus } from 'lucide-react';
import { Product } from '../../types';
import { products } from '../../data/products';
import { useCartStore } from '../../store/cart';

const CATEGORY_LABELS: Record<string, string> = {
  snacks: 'Snacks',
  drinks: 'Drinks',
  fanfavorite: 'Fan Favorite',
  latenightfix: 'Late Night Fix',
  organic: 'Organic & Fresh',
  exotic: 'Exotic Finds',
  local: 'Local Deli',
};

interface Props {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
  onCustomize: (product: Product) => void;
}

export function ProductDetailSheet({ product, onClose, onAdd, onCustomize }: Props) {
  const cartItems = useCartStore((state) => state.items);

  const relatedProducts = product
    ? products
        .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4)
    : [];

  const isCustomizable = Boolean(product?.customizationMatrix?.length);
  const inCart = product ? cartItems.some((i) => i.id === product.id) : false;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[58] bg-[#2a1a1f]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet wrapper */}
          <div className="fixed inset-0 z-[59] flex items-end justify-center pointer-events-none">
            <motion.div
              key="detail-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="pointer-events-auto w-full max-w-[430px] max-h-[92vh] flex flex-col
                         bg-surface rounded-t-[36px] border border-on-background/[0.07]
                         shadow-[0_-24px_80px_rgba(42,26,31,0.12)]"
            >
              {/* Handle + close */}
              <div className="flex justify-center pt-3 flex-shrink-0 relative">
                <div className="w-10 h-1 rounded-full bg-on-background/[0.15]" />
                <button
                  onClick={onClose}
                  className="absolute right-5 top-2 w-8 h-8 rounded-full bg-on-background/[0.05] border border-on-background/[0.09] flex items-center justify-center hover:bg-on-background/[0.09] transition-colors"
                  aria-label="Close"
                >
                  <X size={14} className="text-on-surface-variant" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 pb-2">

                {/* Hero image */}
                <div
                  className="relative w-full aspect-square mx-auto overflow-hidden"
                  style={{ maxHeight: '280px' }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 60% 40%, rgba(230,0,35,0.08) 0%, transparent 70%)',
                    }}
                  />
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-contain p-8"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <span className="text-[22px] font-black uppercase tracking-widest text-on-background/30 text-center leading-snug">
                        {product.name.split(' ').slice(0, 3).join('\n')}
                      </span>
                    </div>
                  )}

                  {/* Featured badge */}
                  {product.tag && (
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/80 backdrop-blur-md text-on-background/70 px-3 py-1.5 rounded-full border border-on-background/[0.09]">
                        <Sparkles size={9} strokeWidth={2.5} />
                        {product.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 pt-5">

                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-on-surface-variant px-2.5 py-1 rounded-full border border-on-background/[0.09] bg-on-background/[0.03]">
                      {CATEGORY_LABELS[product.categoryId] ?? product.categoryId}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="text-[26px] font-black uppercase tracking-tight text-on-background leading-[0.9] mb-3">
                    {product.name}
                  </h2>

                  {/* Price */}
                  <p className="text-[28px] font-black text-on-background leading-none mb-5">
                    ${product.price.toFixed(2)}
                    {isCustomizable && (
                      <span className="text-[13px] font-medium text-on-surface-variant ml-2">& up</span>
                    )}
                  </p>

                  {/* Description */}
                  <p className="text-[14px] text-on-surface-variant leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Allergen section */}
                  <div className="mb-6 p-4 rounded-[18px] bg-surface-dim border border-on-background/[0.07]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={13} className="text-amber-600/70 flex-shrink-0" strokeWidth={2} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                        Allergen Info
                      </p>
                    </div>
                    {product.allergens && (
                      <p className="text-[12px] text-on-background/75 font-medium leading-relaxed mb-2">
                        {product.allergens}
                      </p>
                    )}
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      May contain common allergens. Check product packaging for the full ingredient list.
                    </p>
                  </div>

                  {/* You May Also Like */}
                  {relatedProducts.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant mb-4">
                        You May Also Like
                      </p>
                      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
                        {relatedProducts.map((rel) => (
                          <RelatedCard
                            key={rel.id}
                            product={rel}
                            onAdd={onAdd}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky footer CTA */}
              <div className="px-6 pt-4 pb-[max(env(safe-area-inset-bottom),24px)] flex-shrink-0 border-t border-on-background/[0.07]">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => isCustomizable ? onCustomize(product) : onAdd(product)}
                  className="w-full py-4 rounded-full font-black text-[13px] uppercase tracking-widest btn-brand shadow-[0_8px_32px_rgba(230,0,35,0.4)] flex items-center justify-center gap-2.5 transition-all"
                >
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  {isCustomizable
                    ? 'Customize & Add'
                    : inCart
                    ? 'Add Another'
                    : 'Add to Cart'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Inline related product card ─────────────────────────────────── */
interface RelatedCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function RelatedCard({ product, onAdd }: RelatedCardProps) {
  return (
    <div className="flex-shrink-0 w-[120px] bg-surface-dim rounded-[18px] border border-on-background/[0.07] overflow-hidden">
      <div className="w-full aspect-square bg-surface-dim relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3">
            <span className="text-[8px] font-black uppercase tracking-widest text-on-background/30 text-center leading-snug">
              {product.name.split(' ').slice(0, 2).join('\n')}
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-bold text-on-background truncate leading-tight mb-0.5">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] font-black text-on-background">${product.price.toFixed(2)}</p>
          <button
            onClick={() => onAdd(product)}
            aria-label={`Add ${product.name}`}
            className="w-6 h-6 rounded-full bg-[#ff2d55] flex items-center justify-center shadow-[0_2px_8px_rgba(255,45,85,0.4)] hover:bg-[#e60023] transition-colors active:scale-90"
          >
            <Plus size={11} strokeWidth={3} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
