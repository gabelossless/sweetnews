import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Compass } from 'lucide-react';
import { Product } from '../types';
import { products } from '../data/products';
import { ProductCard } from '../components/molecules/ProductCard';
import { Input } from '../components/atoms/Input';

interface SearchViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddToCart: (product: Product) => void;
}

export function SearchView({
  searchQuery,
  setSearchQuery,
  onAddToCart
}: SearchViewProps) {
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      key="search-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="mt-4 min-h-[70vh] px-2"
    >
      <section className="mb-10">
        <h1 className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          GLOBAL<br/>
          <span className="text-white/30">SEARCH.</span>
        </h1>
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5 transition-colors group-focus-within:text-white" />
          <Input 
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-16 pr-12 h-16 text-[15px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-full placeholder:text-white/30 focus:border-white/30 transition-all font-bold tracking-wide" 
            placeholder="Search Drops..." 
            type="text" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search tags */}
        <div className="flex flex-wrap gap-2 mt-6 px-1">
          <span className="text-[10px] text-white/40 self-center mr-2 uppercase tracking-[0.2em] font-black">Trending:</span>
          {['Wagyu', 'Truffle', 'Macarons', 'Acai', 'Detox'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-4 py-2 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition-colors border border-white/[0.06]"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Grid with Results */}
      <section className="mb-6 px-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-[12px] tracking-[0.2em] uppercase font-black text-white/50">
            {searchQuery ? `Results for "${searchQuery}"` : 'Vault Collection'}
          </h2>
        </div>

        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
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
        ) : (
          <div className="text-center py-20 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-[32px] p-8">
            <Compass className="w-12 h-12 text-white/20 mx-auto mb-4 opacity-40 animate-pulse" />
            <h3 className="font-headline-md text-[14px] uppercase tracking-widest font-black mb-2 text-white">Delicacy Not Found</h3>
            <p className="text-white/40 text-[12px] max-w-xs mx-auto leading-relaxed font-medium">Try checking your spelling or search for another item in our vault.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}

export default SearchView;
