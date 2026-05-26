import { motion, AnimatePresence } from 'motion/react';
import { Moon, Zap, PackageOpen } from 'lucide-react';
import { Product } from '../types';
import { categories, products } from '../data/products';
import { CategoryChip } from '../components/molecules/CategoryChip';
import { ProductCard } from '../components/molecules/ProductCard';
import { Button } from '../components/atoms/Button';

interface ShopViewProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onNavigateToSearch: () => void;
  onNavigateToNews: () => void;
}

export function ShopView({
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  onNavigateToSearch,
  onNavigateToNews,
}: ShopViewProps) {
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
      {/* Hero Header */}
      <section className="mt-2 mb-4 px-2">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-display-xl text-[36px] uppercase font-black leading-[0.85] tracking-tighter mb-3 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
        >
          <span
            style={{
              background: 'linear-gradient(135deg,#e60023,#ff2060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CRAVE
          </span>
          <br />
          <span className="text-white/30">THE NIGHT.</span>
        </motion.h1>

        {/* Fake search bar — navigates to search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          onClick={onNavigateToSearch}
          className="relative group cursor-pointer"
        >
          <div role="button" aria-label="Search products" className="w-full h-14 pl-6 pr-4 glass-panel rounded-full flex items-center text-white/35 text-[13px] tracking-widest uppercase font-black shadow-[0_15px_40px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.05]">
            <span>Discover Premium...</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full btn-brand flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_4px_12px_rgba(230,0,35,0.5)]">
            <Zap className="w-4 h-4" fill="white" strokeWidth={0} />
          </div>
        </motion.div>
      </section>

      {/* Category Chips */}
      <section className="mb-6">
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-6 px-6 md:mx-0 md:px-1">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <CategoryChip
                id={category.id}
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
        </div>
      </section>

      {/* Stage Zero — Horizontal Scroll */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-black mb-1">Tonight's</p>
            <h2 className="font-headline-md text-[16px] tracking-[0.2em] uppercase font-black text-white/80">
              Stage Zero
            </h2>
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="font-headline-md text-[11px] tracking-[0.2em] text-white/50 uppercase hover:text-white/90 active:scale-95 transition-all font-black border border-white/[0.08] px-4 py-2 rounded-full hover:border-white/20"
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
                animationDelay={idx * 0.06}
                className="w-[162px] md:w-[182px] flex-shrink-0"
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
          className="cursor-pointer rounded-[40px] p-8 shadow-[0_24px_80px_rgba(230,0,35,0.2)] border border-[#e60023]/20 relative overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #1a0008 0%, #0d0003 60%, #000 100%)' }}
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none rounded-[40px]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}
          />

          <div className="relative z-10 w-3/4">
            <h3 className="font-headline-lg text-[11px] tracking-[0.35em] text-[#ff2060]/60 uppercase font-black mb-3">
              Midnight Series
            </h3>
            <h4 className="font-display-xl text-[38px] uppercase font-black leading-[0.88] tracking-tighter mb-8 text-white drop-shadow-lg">
              DARK<br />MATTER
            </h4>
            <Button
              whileTapScale={0.92}
              className="px-7 py-3.5 btn-brand font-headline-md text-[11px] tracking-[0.2em] uppercase rounded-full font-black shadow-[0_8px_24px_rgba(230,0,35,0.5)]"
            >
              Unlock
            </Button>
          </div>

          {/* Big glow orb */}
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[120px] opacity-15 z-0 group-hover:opacity-25 transition-all duration-700"
            style={{ background: 'radial-gradient(circle, #e60023, #ff2060)' }}
          />
          <Moon className="absolute right-6 bottom-10 w-32 h-32 text-[#ff2060] opacity-[0.05] transform rotate-[-15deg] group-hover:rotate-[0deg] group-hover:scale-110 group-hover:opacity-[0.1] transition-all duration-700 ease-out z-0 fill-current" />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-900 ease-in-out rounded-[40px]" />
        </motion.div>
      </section>

      {/* The Vault — 2-col Grid */}
      <section className="mb-8 px-2">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-black mb-1">Full</p>
            <h2 className="font-headline-md text-[16px] tracking-[0.2em] uppercase font-black text-white/80">
              {selectedCategory === 'all'
                ? 'The Vault'
                : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
          </div>
          <span className="text-[10px] text-white/25 font-black uppercase tracking-widest">
            {filteredGrid.length} drops
          </span>
        </div>

        {filteredGrid.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredGrid.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFeatured={false}
                  onAdd={() => onAddToCart(product)}
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
            className="text-center py-16 px-6 rounded-[32px] border border-dashed border-white/[0.08] bg-white/[0.01]"
          >
            <PackageOpen className="w-10 h-10 text-white/15 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-headline-md text-[13px] uppercase tracking-widest font-black text-white/80 mb-1">
              Vault Empty
            </h3>
            <p className="text-[11px] text-white/35 leading-relaxed">
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
