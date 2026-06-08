import { motion, AnimatePresence } from 'motion/react';
import { Moon, PackageOpen, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { categories, products } from '../data/products';
import { CategoryChip } from '../components/molecules/CategoryChip';
import { ProductCard } from '../components/molecules/ProductCard';
import { Button } from '../components/atoms/Button';
import { useCartStore } from '../store/cart';
import { getCartRecommendations } from '../utils/recommendations';

interface ShopViewProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onNavigateToNews: () => void;
}

export function ShopView({
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  onViewProduct,
  onNavigateToNews,
}: ShopViewProps) {
  const cartItems = useCartStore((state) => state.items);
  const recommendations = getCartRecommendations(cartItems, products);

  const filteredHorizontal = products.filter(
    (p) => selectedCategory === 'all' || p.categoryId === selectedCategory
  );
  const filteredGrid = [...products]
    .reverse()
    .filter((p) => selectedCategory === 'all' || p.categoryId === selectedCategory);

  return (
    <motion.div
      key="shop-tab"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Category Chips */}
      <section className="mb-6">
        <div
          className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-1 -mx-6 px-6 md:mx-0 md:px-1"
          style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
        >
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.22 }}
              className="flex-shrink-0"
            >
              <CategoryChip
                name={category.name}
                icon={category.icon}
                isActive={selectedCategory === category.id}
                onClick={() =>
                  category.id === 'news'
                    ? onNavigateToNews()
                    : setSelectedCategory(category.id)
                }
              />
            </motion.div>
          ))}
          {/* Spacer so last chip isn't hidden by the fade */}
          <div className="w-8 flex-shrink-0" aria-hidden />
        </div>
      </section>

      {/* Stage Zero — Horizontal Scroll */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase mb-1 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary animate-live-pulse" />
              Tonight's Featured Drops
            </p>
            <h2 className="font-headline-md text-[18px] tracking-tight text-on-background leading-tight">
              Midnight Selection
            </h2>
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="font-headline-md text-[10px] tracking-[0.15em] text-on-surface-variant uppercase hover:text-on-background active:scale-95 transition-all font-black border border-on-background/[0.1] px-4 py-2 rounded-full hover:bg-on-background/[0.05]"
          >
            All Drops
          </button>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-1 pt-1">
          <AnimatePresence mode="popLayout">
            {filteredHorizontal.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                isFeatured={idx === 0}
                onAdd={() => onAddToCart(product)}
                onView={() => onViewProduct(product)}
                animationDelay={idx * 0.06}
                className="w-[162px] md:w-[200px] flex-shrink-0"
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Midnight Reserve Banner */}
      <section className="mb-8 px-2">
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setSelectedCategory('exotic')}
            className="cursor-pointer rounded-[40px] p-8 shadow-[0_24px_80px_rgba(217,119,6,0.2)] border border-primary/20 relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #1a1a0a 0%, #0d0d03 60%, #000 100%)' }}
          >
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none rounded-[40px]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}
          />

          <div className="relative z-10 w-3/4">
            <h3 className="font-headline-lg text-[11px] tracking-[0.35em] text-primary/60 uppercase font-black mb-3">
              Golden Reserve
            </h3>
            <h4 className="font-display-xl text-[38px] uppercase font-black leading-[0.88] tracking-tighter mb-8 text-white drop-shadow-lg">
              GOLDEN<br />SANDS
            </h4>
            <Button
              whileTapScale={0.92}
              className="px-7 py-3.5 btn-brand font-headline-md text-[11px] tracking-[0.2em] uppercase rounded-full font-black shadow-[0_8px_24px_rgba(217,119,6,0.5)]"
            >
              Unlock
            </Button>
          </div>
          
          {/* Big glow orb */}
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[120px] opacity-15 z-0 group-hover:opacity-25 transition-all duration-700"
            style={{ background: 'radial-gradient(circle, #d97706, #b45309)' }}
          />
          <Moon className="absolute right-6 bottom-10 w-32 h-32 text-primary opacity-[0.05] transform rotate-[-15deg] group-hover:rotate-[0deg] group-hover:scale-110 group-hover:opacity-[0.1] transition-all duration-700 ease-out z-0 fill-current" />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-900 ease-in-out rounded-[40px]" />
        </motion.div>
      </section>

      {/* Cart-Based Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.section
            key="recommendations"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mb-8 px-2"
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-on-surface-variant uppercase font-black mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Based on your cart
                </p>
                <h2 className="font-headline-md text-[16px] tracking-[0.2em] uppercase font-black text-on-background">
                  You Might Like
                </h2>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-1 pt-1">
              {recommendations.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFeatured={false}
                  onAdd={() => onAddToCart(product)}
                  onView={() => onViewProduct(product)}
                  animationDelay={idx * 0.06}
                  className="w-[162px] md:w-[200px] flex-shrink-0"
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* The Vault — 2-col Grid */}
      <section className="mb-8 px-2">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[9px] tracking-[0.3em] text-on-surface-variant uppercase font-black mb-1">Full</p>
            <h2 className="font-headline-md text-[16px] tracking-[0.2em] uppercase font-black text-on-background">
              {selectedCategory === 'all'
                ? 'The Vault'
                : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
          </div>
          <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
            {filteredGrid.length} drops
          </span>
        </div>

        {filteredGrid.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredGrid.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFeatured={false}
                  onAdd={() => onAddToCart(product)}
                  onView={() => onViewProduct(product)}
                  animationDelay={idx * 0.05}
                  className="w-full"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6 rounded-[32px] border border-dashed border-on-background/[0.09] bg-on-background/[0.03]"
          >
            <PackageOpen className="w-10 h-10 text-on-background/30 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-headline-md text-[13px] uppercase tracking-widest font-black text-on-background mb-1">
              Vault Empty
            </h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              No drops in this category tonight. Try another.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-5 px-5 py-2 rounded-full btn-brand text-[10px] uppercase tracking-[0.2em] font-black"
            >
              Show All Drops
            </button>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

export default ShopView;
