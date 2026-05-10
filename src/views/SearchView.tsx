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
      className="mt-2 min-h-[70vh]"
    >
      <section className="mb-8">
        <h1 className="font-headline-lg text-[32px] leading-tight font-extrabold mb-4">
          Global Search
        </h1>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 transition-colors group-focus-within:text-primary" />
          <Input 
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-10 h-14 text-[17px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] placeholder:text-on-surface-variant" 
            placeholder="Type to find snacks, drinks, sweets..." 
            type="text" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-on-surface-variant self-center mr-2 uppercase tracking-wider font-bold">Trending:</span>
          {['Wagyu', 'Truffle', 'Macarons', 'Acai', 'Detox'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.04] text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.08] transition-colors border border-white/[0.04]"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Grid with Results */}
      <section className="mb-6 px-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-md text-[18px] font-bold uppercase tracking-wider text-on-surface-variant">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover All Curated Items'}
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
          <div className="text-center py-16 bg-[#050505] border border-white/[0.04] rounded-3xl p-8">
            <Compass className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-40 animate-pulse" />
            <h3 className="font-headline-md text-[18px] font-bold mb-1">No delicacies found</h3>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto leading-relaxed">We couldn't find any results matching your search. Try checking your spelling or search for another item.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}

export default SearchView;
