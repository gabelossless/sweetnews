import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Compass, TrendingUp, Filter } from 'lucide-react';
import { Product } from '../types';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/molecules/ProductCard';

interface SearchViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

const TRENDING_TAGS = ['Wagyu', 'Truffle', 'Macarons', 'Acai', 'Detox'];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function SearchView({
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onViewProduct,
}: SearchViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(50);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query for filtering (150ms after user stops typing)
  const debouncedQuery = useDebounce(searchQuery, 150);

  // Load search history once on mount
  useEffect(() => {
    try {
      const h = localStorage.getItem('searchHistory');
      if (h) setSearchHistory(JSON.parse(h));
    } catch {}
  }, []);

  // Save to localStorage — debounced so rapid typing doesn't block the thread
  const saveHistoryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!searchQuery) return;
    if (saveHistoryRef.current) clearTimeout(saveHistoryRef.current);
    saveHistoryRef.current = setTimeout(() => {
      setSearchHistory(prev => {
        if (prev.includes(searchQuery)) return prev;
        const next = [searchQuery, ...prev].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(next));
        return next;
      });
    }, 800);
    return () => { if (saveHistoryRef.current) clearTimeout(saveHistoryRef.current); };
  }, [searchQuery]);

  const maxProductPrice = useMemo(
    () => Math.max(...products.map(p => p.price), 50),
    []
  );

  // Filter uses debounced query — no lag while typing
  const filteredProducts = useMemo(
    () => products.filter(p => {
      const q = debouncedQuery.toLowerCase();
      const matchesText =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesPrice = p.price <= maxPrice;

      const matchesDietary =
        dietaryFilters.length === 0 ||
        (dietaryFilters.includes('organic') && p.categoryId === 'organic') ||
        (dietaryFilters.includes('vegan') && (p.tag?.toLowerCase().includes('vegan') || p.description.toLowerCase().includes('vegan'))) ||
        (dietaryFilters.includes('gluten-free') && (p.tag?.toLowerCase().includes('gluten') || p.description.toLowerCase().includes('gluten')));

      return matchesText && matchesCategory && matchesPrice && matchesDietary;
    }),
    [debouncedQuery, selectedCategory, maxPrice, dietaryFilters]
  );

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setMaxPrice(maxProductPrice);
    setDietaryFilters([]);
  }, [maxProductPrice]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const activeFilterCount = useMemo(
    () => (selectedCategory !== 'all' ? 1 : 0) + dietaryFilters.length + (maxPrice < maxProductPrice ? 1 : 0),
    [selectedCategory, maxPrice, maxProductPrice, dietaryFilters.length]
  );

  const showHistory = searchHistory.length > 0 && !debouncedQuery;

  return (
    <div className="mt-4 min-h-[70vh] px-2">
      {/* Hero */}
      <section className="mb-6">
        <h1 className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-6 text-on-background">
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
          <span className="text-on-surface-variant">SEARCH.</span>
        </h1>

        {/* Search input */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-[#ff2060] z-10 pointer-events-none" />
          <input
            ref={inputRef}
            autoFocus
            inputMode="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-12 h-14 text-[15px] bg-on-background/[0.03] backdrop-blur-2xl border border-on-background/[0.09] rounded-full placeholder:text-on-surface-variant focus:border-[#e60023]/50 focus:shadow-[0_0_0_1px_rgba(230,0,35,0.25),0_8px_32px_rgba(230,0,35,0.12)] transition-all duration-300 font-bold tracking-wide outline-none"
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
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-on-background/[0.07] hover:bg-on-background/[0.12] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mb-5 mt-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black">
                  Recent Searches
                </p>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-primary hover:text-primary/70 font-medium min-h-[36px] min-w-[44px] flex items-center justify-end"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map(term => (
                  <button
                    key={term}
                    onClick={() => { setSearchQuery(term); inputRef.current?.focus(); }}
                    className="px-3.5 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-on-background/[0.05] text-on-background/75 border border-on-background/[0.07] active:bg-on-background/[0.09] active:scale-95 transition-all duration-200 min-h-[36px]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-4 rounded-[20px] bg-surface-dim border border-on-background/[0.07]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-[9px] text-primary hover:text-primary/70 font-medium min-h-[36px] min-w-[44px] flex items-center justify-end"
                  >
                    Clear All
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border min-h-[36px] transition-all duration-200 active:scale-95 ${
                          selectedCategory === cat.id
                            ? 'btn-brand border-transparent text-white'
                            : 'bg-on-background/[0.05] text-on-background/75 border-on-background/[0.07] active:bg-on-background/[0.09]'
                        }`}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                      Max Price
                    </p>
                    <span className="text-[11px] font-black text-primary">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxProductPrice}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-on-background/[0.05] rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[8px] text-on-surface-variant mt-1">
                    <span>$0</span>
                    <span>${maxProductPrice}</span>
                  </div>
                </div>

                {/* Dietary Filters */}
                <div className="mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Dietary
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'organic', label: 'Organic', icon: '🌱' },
                      { id: 'vegan', label: 'Vegan', icon: '🌿' },
                      { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
                    ].map(diet => (
                      <button
                        key={diet.id}
                        onClick={() =>
                          setDietaryFilters(prev =>
                            prev.includes(diet.id) ? prev.filter(d => d !== diet.id) : [...prev, diet.id]
                          )
                        }
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border min-h-[36px] transition-all duration-200 active:scale-95 ${
                          dietaryFilters.includes(diet.id)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-on-background/[0.05] text-on-background/75 border-on-background/[0.07] active:bg-on-background/[0.09]'
                        }`}
                      >
                        <span>{diet.icon}</span>
                        {diet.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trending tags */}
        <div className="flex flex-wrap gap-2 mt-4 px-1 items-center">
          <div className="flex items-center gap-1.5 mr-1">
            <TrendingUp className="w-3 h-3 text-[#ff2060]" strokeWidth={2.5} />
            <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black">Trending</span>
          </div>
          {TRENDING_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => { setSearchQuery(tag); inputRef.current?.focus(); }}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border min-h-[36px] transition-all duration-200 active:scale-95 ${
                searchQuery === tag
                  ? 'btn-brand border-transparent text-white'
                  : 'bg-on-background/[0.05] text-on-background/75 border-on-background/[0.07] active:bg-on-background/[0.09]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="mb-8 px-1">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-headline-md text-[12px] tracking-[0.2em] uppercase font-black text-on-surface-variant">
            {debouncedQuery ? `Results for "${debouncedQuery}"` : 'Vault Collection'}
          </h2>
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`relative px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 min-h-[36px] active:scale-95 ${
              showFilters
                ? 'btn-brand text-white'
                : 'bg-on-background/[0.05] text-on-background/75 border border-on-background/[0.07] active:bg-on-background/[0.09]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" strokeWidth={2.5} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-primary absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        {/* Result count */}
        <motion.span
          key={filteredProducts.length}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest"
        >
          {filteredProducts.length} drops
        </motion.span>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isFeatured={false}
                onAdd={() => onAddToCart(product)}
                onView={() => onViewProduct(product)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center py-20 bg-gradient-to-b from-on-background/[0.03] to-transparent border border-on-background/[0.07] rounded-[32px] p-8 mt-4"
          >
            <div className="w-12 h-12 text-on-background/30 mx-auto mb-5" style={{ animation: 'none' }}>
              <Compass className="w-full h-full" strokeWidth={1.5} />
            </div>
            <h3 className="font-headline-md text-[14px] uppercase tracking-widest font-black mb-2 text-on-background">
              Delicacy Not Found
            </h3>
            <p className="text-on-surface-variant text-[12px] leading-relaxed font-medium">
              Try checking your spelling or explore another item in the vault.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default SearchView;
