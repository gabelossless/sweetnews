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
      {/* Greeting */}
      <section className="mt-2 mb-8">
        <div className="flex justify-between items-center mb-1">
          <h1 className="font-headline-lg text-[32px] leading-tight font-extrabold">
            Hey, Night Owl <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform cursor-default">🌙</span>
          </h1>
        </div>
        <p className="font-body-md text-[17px] text-on-surface-variant mb-6 font-medium">What are we craving tonight?</p>
        <div 
          onClick={onNavigateToSearch}
          className="relative group cursor-pointer"
        >
          <div className="w-full h-14 pl-12 pr-4 bg-[#0a0a0a] border border-white/[0.06] rounded-[20px] flex items-center text-on-surface-variant text-[17px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <span className="opacity-60">Search snacks, drinks, exotic finds...</span>
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

      {/* Trending Snacks */}
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="font-headline-md text-[24px] font-bold">Trending Snacks</h2>
          <button 
            onClick={() => { setSelectedCategory('all'); }}
            className="font-label-bold text-[15px] text-primary hover:text-primary-container active:scale-95 transition-all font-bold"
          >
            See all
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
      <section className="mb-10 px-1">
        <h2 className="font-headline-md text-[24px] font-bold mb-4">Midnight Indulgence</h2>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => { setSelectedCategory('exotic'); }}
          className="cursor-pointer bg-surface-container-high rounded-[32px] p-8 text-on-surface shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-white/[0.06] relative overflow-hidden group"
        >
          <div className="relative z-10 w-2/3">
            <h3 className="font-display-xl text-[44px] mb-2 leading-tight tracking-tight drop-shadow-sm font-bold">After Hours<br/>Reserve</h3>
            <p className="font-body-md text-[15px] mb-8 opacity-70 leading-relaxed font-medium">Exclusive late-night delicacies curated for twilight cravings.</p>
            <Button 
              whileTapScale={0.95}
              className="px-7 py-4 bg-primary text-on-primary font-label-bold text-[16px] rounded-full shadow-[0_4px_15px_rgba(230,0,35,0.4)] transition-transform hover:shadow-[0_6px_20px_rgba(230,0,35,0.5)] hover:-translate-y-0.5 font-bold"
            >
              Unlock Menu
            </Button>
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary rounded-full blur-[90px] opacity-20 z-0 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"></div>
          <Moon className="absolute right-8 bottom-12 w-28 h-28 text-white opacity-[0.03] transform rotate-[-15deg] group-hover:rotate-[-5deg] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500 ease-out z-0 fill-current" />
        </motion.div>
      </section>

      {/* More Snacks (Grid Layout) */}
      <section className="mb-6 px-1">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-headline-md text-[24px] font-bold">
            {selectedCategory === 'all' ? 'Fresh & Curated Finds' : categories.find(c => c.id === selectedCategory)?.name}
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
