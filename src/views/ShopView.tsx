import { motion, AnimatePresence } from 'motion/react';
import { Moon } from 'lucide-react';
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
}

export function ShopView({
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  onNavigateToSearch
}: ShopViewProps) {
  return (
    <motion.div
      key="shop-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
    >
      {/* Brutalist Header */}
      <section className="mt-8 mb-10 px-2">
        <h1 className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <span style={{ background: 'linear-gradient(135deg,#e60023,#ff2060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRAVE</span><br/>
          <span className="text-white/30">THE NIGHT.</span>
        </h1>
        <div 
          onClick={onNavigateToSearch}
          className="relative group cursor-pointer"
        >
          <div className="w-full h-16 pl-6 pr-4 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-full flex items-center text-white/40 text-[14px] tracking-widest uppercase font-black shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all group-hover:bg-white/[0.06] group-hover:border-white/[0.15]">
            <span className="opacity-70">Discover Premium...</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-6 px-6 md:mx-0 md:px-1">
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              id={category.id}
              name={category.name}
              icon={category.icon}
              isActive={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </div>
      </section>

      {/* Trending Stage */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="font-headline-md text-[16px] tracking-[0.2em] uppercase font-black text-white/70">Stage Zero</h2>
          <button 
            onClick={() => { setSelectedCategory('all'); }}
            className="font-headline-md text-[12px] tracking-[0.2em] text-white uppercase hover:text-white/70 active:scale-95 transition-all font-black"
          >
            All Drops
          </button>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-1 pt-1">
          {products.filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory).map((product, idx) => (
            <ProductCard 
              key={product.id}
              product={product}
              isFeatured={idx === 0}
              onAdd={() => onAddToCart(product)}
              className="w-[160px] md:w-[180px] flex-shrink-0"
            />
          ))}
        </div>
      </section>

      {/* After-Hours Reserve Banner */}
      <section className="mb-12 px-2">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setSelectedCategory('exotic'); }}
          className="cursor-pointer rounded-[40px] p-8 text-on-surface shadow-[0_20px_60px_rgba(230,0,35,0.25)] border border-[#e60023]/20 relative overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #1a0008 0%, #0d0003 60%, #000 100%)' }}
        >
          <div className="relative z-10 w-3/4">
            <h3 className="font-headline-lg text-[13px] tracking-[0.3em] text-[#ff2060]/70 uppercase font-black mb-3">Midnight Series</h3>
            <h4 className="font-display-xl text-[36px] uppercase font-black leading-[0.9] tracking-tighter mb-8 drop-shadow-lg text-white">
              DARK<br/>MATTER
            </h4>
            <Button
              whileTapScale={0.92}
              className="px-6 py-3.5 btn-brand font-headline-md text-[12px] tracking-[0.2em] uppercase rounded-full font-black"
            >
              Unlock
            </Button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-20 z-0 group-hover:opacity-30 transition-all duration-700" style={{ background: 'radial-gradient(circle, #e60023, #ff2060)' }} />
          <Moon className="absolute right-6 bottom-10 w-32 h-32 text-[#ff2060] opacity-[0.06] transform rotate-[-15deg] group-hover:rotate-[0deg] group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-700 ease-out z-0 fill-current" />
        </motion.div>
      </section>

      {/* More Snacks (Grid Layout) */}
      <section className="mb-8 px-2">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-headline-md text-[16px] tracking-[0.2em] uppercase font-black text-white/70">
            {selectedCategory === 'all' ? 'The Vault' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
        </div>
        <motion.div layout className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {[...products].reverse()
              .filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory)
              .map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                isFeatured={false}
                onAdd={() => onAddToCart(product)}
                className="w-full"
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </motion.div>
  );
}

export default ShopView;
