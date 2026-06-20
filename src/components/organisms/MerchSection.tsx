import { motion } from 'motion/react';
import { Product } from '../../types';
import { ProductCard } from '../molecules/ProductCard';

interface MerchSectionProps {
  title: string;
  eyebrow: string;
  description: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export function MerchSection({
  title,
  eyebrow,
  description,
  products,
  onAddToCart,
  onViewProduct,
}: MerchSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-8"
    >
      <div className="flex items-end justify-between gap-4 mb-4 px-1">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-on-surface-variant mb-1">
            {eyebrow}
          </p>
          <h2 className="text-[18px] md:text-[20px] font-black tracking-tight text-on-background leading-tight">
            {title}
          </h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-on-surface-variant bg-on-background/[0.04] border border-on-background/[0.06] px-2.5 py-1.5 rounded-full">
          {products.length} picks
        </span>
      </div>

      <p className="text-[12px] text-on-surface-variant leading-relaxed px-1 mb-4 max-w-[34ch]">
        {description}
      </p>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            isFeatured={index === 0}
            onAdd={() => onAddToCart(product)}
            onView={() => onViewProduct(product)}
            className="w-full"
          />
        ))}
      </div>
    </motion.section>
  );
}

export default MerchSection;
