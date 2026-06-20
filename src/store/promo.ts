import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PromoCode, AppliedPromo } from '../types';

interface PromoState {
  availablePromos: PromoCode[];
  appliedPromo: AppliedPromo | null;
  promoInput: string;
  setPromoInput: (code: string) => void;
  applyPromo: (cartSubtotal: number, cartCategories: string[]) => Promise<boolean>;
  removePromo: () => void;
  fetchPromos: () => Promise<void>;
}

const SAMPLE_PROMOS: PromoCode[] = [
  {
    id: 'welcome10',
    code: 'WELCOME10',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1500, // $15
    maxDiscount: 500, // $5 max
    usageLimit: 1,
    usageCount: 0,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2030-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'sweet20',
    code: 'SWEET20',
    description: '$2 off orders over $20',
    discountType: 'fixed',
    discountValue: 200, // $2 in cents
    minOrderAmount: 2000,
    usageLimit: 999,
    usageCount: 0,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2030-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'nightowl',
    code: 'NIGHTOWL',
    description: '15% off late night orders (snacks category)',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1000,
    maxDiscount: 800,
    usageLimit: 3,
    usageCount: 0,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2030-12-31T23:59:59Z',
    isActive: true,
    applicableCategories: ['snacks', 'latenightfix'],
  },
  {
    id: 'freeship',
    code: 'FREESHIP',
    description: 'Free delivery on orders $30+',
    discountType: 'fixed',
    discountValue: 399, // $3.99 delivery fee
    minOrderAmount: 3000,
    usageLimit: 1,
    usageCount: 0,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2030-12-31T23:59:59Z',
    isActive: true,
  },
];

export const usePromoStore = create<PromoState>()(
  persist(
    (set, get) => ({
      availablePromos: SAMPLE_PROMOS,
      appliedPromo: null,
      promoInput: '',

      setPromoInput: (code) => set({ promoInput: code.toUpperCase() }),

      applyPromo: async (cartSubtotal, cartCategories) => {
        const { availablePromos, promoInput } = get();
        const code = promoInput.trim().toUpperCase();
        
        const promo = availablePromos.find(p => 
          p.code === code && 
          p.isActive && 
          new Date(p.validFrom) <= new Date() && 
          new Date(p.validUntil) >= new Date() &&
          (p.usageLimit === undefined || p.usageCount < p.usageLimit)
        );

        if (!promo) return false;

        // Check minimum order amount
        if (promo.minOrderAmount && cartSubtotal < promo.minOrderAmount) return false;

        // Check category applicability
        if (promo.applicableCategories && promo.applicableCategories.length > 0) {
          const hasApplicableCategory = cartCategories.some(cat => 
            promo.applicableCategories!.includes(cat)
          );
          if (!hasApplicableCategory) return false;
        }

        // Calculate discount
        let discountAmount = 0;
        if (promo.discountType === 'percentage') {
          discountAmount = Math.round(cartSubtotal * (promo.discountValue / 100));
          if (promo.maxDiscount) {
            discountAmount = Math.min(discountAmount, promo.maxDiscount);
          }
        } else {
          discountAmount = promo.discountValue;
        }

        // Don't discount more than subtotal
        discountAmount = Math.min(discountAmount, cartSubtotal);

        const appliedPromo: AppliedPromo = {
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount,
        };

        set({ appliedPromo });
        return true;
      },

      removePromo: () => set({ appliedPromo: null, promoInput: '' }),

      fetchPromos: async () => {
        // In production, fetch from Firestore
        // For now, sample promos are already loaded
      },
    }),
    {
      name: 'sweetnews-promo-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);