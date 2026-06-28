import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Moon, PackageOpen } from 'lucide-react';
import { Product } from '../types';
import { categories, products } from '../data/products';
import { CategoryChip } from '../components/molecules/CategoryChip';
import { ProductCard } from '../components/molecules/ProductCard';
import { MerchSection } from '../components/organisms/MerchSection';
import { Button } from '../components/atoms/Button';
import { Logo } from '../components/atoms/Logo';
import { getMerchSections, sortProductsForDisplay } from '../utils/merchandising';

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
  const merchSections = getMerchSections(products);
  const filteredProducts = sortProductsForDisplay(
    products.filter((product) => selectedCategory === 'all' || product.categoryId === selectedCategory)
  );
  const selectedCategoryLabel =
    categories.find((category) => category.id === selectedCategory)?.name ?? 'All';
  const isAllCategories = selectedCategory === 'all';

  return (
    <motion.div
      key="shop-tab"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <section className="mb-8 px-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[24px] border border-white/[0.05] bg-surface p-6 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
            {/* Left side content */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 font-serif text-[11px] italic tracking-wide text-primary uppercase">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-live-pulse" />
                The Late-Night Selection
              </div>
              <h1 className="mt-3 text-[36px] md:text-[48px] font-serif font-light leading-none text-white tracking-tight">
                Sweet <span className="font-semibold italic text-primary">News</span>
              </h1>
              <p className="mt-3 text-[12px] md:text-[14px] leading-relaxed text-on-surface-variant font-light max-w-[28rem]">
                Curated confectioneries, artisanal snacks, and fresh newspapers delivered directly to your door by private courier.
              </p>
              
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                {[
                  { title: '70+ Selections', subtitle: 'HANDPICKED DROPS' },
                  { title: '10.0 MI Radius', subtitle: 'PRIVATE COURIER' },
                  { title: 'Bespoke Duty', subtitle: 'OWNER DISPATCH' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[14px] border border-white/[0.04] bg-[#0c0c0e] p-3.5"
                  >
                    <p className="text-[13px] md:text-[15px] font-serif font-medium tracking-tight text-primary">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[8.5px] font-medium text-on-surface-variant tracking-wider uppercase">
                      {item.subtitle}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button
                  type="button"
                  variant="brand"
                  whileTapScale={0.98}
                  onClick={() => setSelectedCategory('snacks')}
                  className="h-10 px-5 text-[11px] font-medium tracking-wide"
                >
                  Browse Collections
                </Button>
                <button
                  type="button"
                  onClick={onNavigateToNews}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-[11px] font-medium tracking-wide text-white/80 hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  The Chronicle
                  <ArrowRight size={11} className="text-primary" />
                </button>
              </div>
            </div>

            {/* Right side visual asset */}
            <div className="hidden lg:block lg:col-span-5 relative min-h-[320px] rounded-[18px] overflow-hidden border border-white/5 bg-on-background/[0.02]">
              <img
                src="/images/sweet_news_hero.png"
                alt="Sweet News Luxury Atelier selection"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </section>

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
          <div className="w-8 flex-shrink-0" aria-hidden />
        </div>
      </section>

      {isAllCategories && (
        <div className="space-y-8">
          {merchSections.slice(0, 4).map((section) => (
            <MerchSection
              key={section.title}
              title={section.title}
              eyebrow={section.eyebrow}
              description={section.description}
              products={section.products}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      )}

      <section className={`mb-8 ${isAllCategories ? 'mt-10' : 'mt-6'}`}>
        <div className="flex items-end justify-between gap-4 mb-4 px-1">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-primary mb-1">
              {isAllCategories ? 'The Collection' : 'Curated Selection'}
            </p>
            <h2 className="text-[24px] font-serif font-medium tracking-tight text-white leading-tight">
              {isAllCategories ? 'The Midnight Collection' : selectedCategoryLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.04]">
              {filteredProducts.length} Selections
            </span>
            {!isAllCategories && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary hover:text-primary/70 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p className="text-[12.5px] font-light text-on-surface-variant leading-relaxed px-1 mb-5 max-w-[36ch]">
          {isAllCategories
            ? 'Explore our curated late-night collection, selected for the discerning night owl. Delivered fresh, with speed and absolute discretion.'
            : 'Focused selections curated to bring you the best culinary accompaniments for your late hours.'}
        </p>

        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.18), duration: 0.22 }}
                >
                  <ProductCard
                    product={product}
                    isFeatured={idx === 0 && isAllCategories}
                    onAdd={() => onAddToCart(product)}
                    onView={() => onViewProduct(product)}
                    className="w-full"
                  />
                </motion.div>
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
              No drops here
            </h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Try another aisle or clear the filter to see the full catalog.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="mt-5 px-5 py-2 rounded-full btn-brand text-[10px] uppercase tracking-[0.2em] font-black"
            >
              Show all drops
            </button>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

export default ShopView;
