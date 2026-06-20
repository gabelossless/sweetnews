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
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden rounded-[36px] border border-on-background/[0.08] bg-gradient-to-br from-[#111612] via-[#070707] to-[#000000] p-5 md:p-6 shadow-[0_24px_90px_rgba(0,0,0,0.48)]"
        >
          <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary/25 blur-[110px]" />
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-secondary/20 blur-[90px]" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="max-w-[18rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
                Denver + Atlanta launch
              </div>
              <h1 className="mt-4 text-[34px] md:text-[38px] font-black uppercase tracking-tighter leading-[0.88] text-white">
                Sweet News
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-white/72 max-w-[24ch]">
                Late-night snacks, drinks, and essentials delivered fast.
              </p>
            </div>

            <Logo size={64} className="shrink-0 drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]" />
          </div>

          <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
            {[
              { title: '70+ products', subtitle: 'Broad launch catalog' },
              { title: '10 mi', subtitle: 'Default downtown cap' },
              { title: 'Founder dispatch', subtitle: 'Manual first, scale later' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3 backdrop-blur-sm"
              >
                <p className="text-[12px] font-black uppercase tracking-[0.12em] text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/50">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="brand"
              whileTapScale={0.96}
              onClick={() => setSelectedCategory('snacks')}
              className="h-12 rounded-full px-5 text-[10px] uppercase tracking-[0.22em]"
            >
              Browse snacks
            </Button>
            <button
              type="button"
              onClick={onNavigateToNews}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-[10px] font-black uppercase tracking-[0.22em] text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              Read the story
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-[100px]" />
          <Moon className="absolute right-4 bottom-4 h-24 w-24 rotate-[-20deg] text-white/5 fill-current" />
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
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-on-surface-variant mb-1">
              {isAllCategories ? 'Full catalog' : 'Filtered view'}
            </p>
            <h2 className="text-[20px] font-black tracking-tight text-on-background leading-tight">
              {isAllCategories ? 'The Vault' : selectedCategoryLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest bg-on-background/[0.05] px-2.5 py-1.5 rounded-full border border-on-background/[0.05]">
              {filteredProducts.length} drops
            </span>
            {!isAllCategories && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/70 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p className="text-[12px] text-on-surface-variant leading-relaxed px-1 mb-4 max-w-[32ch]">
          {isAllCategories
            ? 'The curated sections above lead the story. The full catalog stays available below for search-driven browsing.'
            : 'This filter stays focused so the home screen feels calm while the full catalog remains one tap away.'}
        </p>

        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 gap-4 md:gap-5">
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
