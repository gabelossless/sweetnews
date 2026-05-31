import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Compass, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { products } from '../data/products';
import { ProductCard } from '../components/molecules/ProductCard';
import { Input } from '../components/atoms/Input';

interface SearchViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

const TRENDING_TAGS = ['Wagyu', 'Truffle', 'Macarons', 'Acai', 'Detox'];

export function SearchView({
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onViewProduct,
}: SearchViewProps) {
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      key="search-tab"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-4 min-h-[70vh] px-2"
    >
      {/* Hero */}
      <section className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
        >
          <span
            style={{
              background: 'linear-gradient(135deg,#e60023,#ff2060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GLOBAL
          </span>
          <br />
          <span className="text-white/30">SEARCH.</span>
        </motion.h1>

        {/* Search input */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 text-white/35 group-focus-within:text-[#ff2060] z-10" />
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-12 h-16 text-[15px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-full placeholder:text-white/25 focus:border-[#e60023]/50 focus:shadow-[0_0_0_1px_rgba(230,0,35,0.25),0_8px_32px_rgba(230,0,35,0.12)] transition-all duration-300 font-bold tracking-wide"
            placeholder="Search drops, tags, flavors..."
            type="text"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Trending tags */}
        <div className="flex flex-wrap gap-2 mt-5 px-1 items-center">
          <div className="flex items-center gap-1.5 mr-1">
            <TrendingUp className="w-3 h-3 text-[#ff2060]" strokeWidth={2.5} />
            <span className="text-[10px] text-white/35 uppercase tracking-[0.2em] font-black">Trending</span>
          </div>
          {TRENDING_TAGS.map((tag, i) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.2 }}
              onClick={() => setSearchQuery(tag)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 border ${
                searchQuery === tag
                  ? 'btn-brand border-transparent text-white shadow-[0_4px_16px_rgba(230,0,35,0.4)]'
                  : 'bg-white/[0.04] text-white/70 border-white/[0.07] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15]'
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="mb-8 px-1">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-headline-md text-[12px] tracking-[0.2em] uppercase font-black text-white/45">
            {searchQuery ? `Results for "${searchQuery}"` : 'Vault Collection'}
          </h2>
          <AnimatePresence mode="wait">
            <motion.span
              key={filteredProducts.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="text-[10px] font-black text-white/25 uppercase tracking-widest"
            >
              {filteredProducts.length} drops
            </motion.span>
          </AnimatePresence>
        </div>

        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-[32px] p-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Compass className="w-12 h-12 text-white/20 mx-auto mb-5" strokeWidth={1.5} />
            </motion.div>
            <h3 className="font-headline-md text-[14px] uppercase tracking-widest font-black mb-2 text-white">
              Delicacy Not Found
            </h3>
            <p className="text-white/35 text-[12px] leading-relaxed font-medium">
              Try checking your spelling or explore another item in the vault.
            </p>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

export default SearchView;
