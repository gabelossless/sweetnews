import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';

interface Props {
  product: Product | null;
  onClose: () => void;
  onConfirm: (result: { label: string; upcharge: number }) => void;
}

export function CustomizationSheet({ product, onClose, onConfirm }: Props) {
  const step = product?.customizationMatrix?.[0];
  const [selections, setSelections] = useState<Record<string, number>>({});

  // Reset selections whenever a new product is opened
  useEffect(() => {
    if (product) setSelections({});
  }, [product?.id]);

  if (!product || !step) return null;

  const totalSelected = Object.values(selections).reduce((s, n) => s + n, 0);
  const required = step.min_selections;
  const atLimit = totalSelected >= step.max_selections;
  const ready = step.selection_type === 'exact'
    ? totalSelected === required
    : totalSelected >= step.min_selections;

  const totalUpcharge = step.options.reduce(
    (sum, opt) => sum + (selections[opt.name] ?? 0) * opt.upcharge,
    0
  );

  const increment = (name: string) => {
    if (atLimit) return;
    setSelections((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
  };

  const decrement = (name: string) => {
    setSelections((prev) => {
      const next = (prev[name] ?? 0) - 1;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: next };
    });
  };

  const handleConfirm = () => {
    const parts = step.options
      .filter((opt) => (selections[opt.name] ?? 0) > 0)
      .sort((a, b) => (selections[b.name] ?? 0) - (selections[a.name] ?? 0))
      .map((opt) => `${selections[opt.name]}× ${opt.name}`);
    onConfirm({ label: parts.join(' · '), upcharge: totalUpcharge });
  };

  const progressPct = Math.min((totalSelected / required) * 100, 100);

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="customization-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#2a1a1f]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet wrapper */}
          <div className="fixed inset-0 z-[71] flex items-end justify-center pointer-events-none">
            <motion.div
              key="customization-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="pointer-events-auto w-full max-w-[430px] max-h-[88vh] flex flex-col
                         bg-surface rounded-t-[36px] border border-on-background/[0.07]
                         shadow-[0_-24px_80px_rgba(42,26,31,0.12)]"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-on-background/[0.15]" />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-3 pb-4 flex-shrink-0">
                <div className="flex-1 pr-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant mb-1">
                    Customize
                  </p>
                  <h2 className="text-[17px] font-black uppercase tracking-tight text-on-background leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-[12px] text-on-surface-variant font-medium mt-1">{step.step_name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-on-background/[0.05] border border-on-background/[0.07] flex items-center justify-center flex-shrink-0 hover:bg-on-background/[0.09] transition-colors"
                  aria-label="Close"
                >
                  <X size={14} className="text-on-surface-variant" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-6 pb-4 flex-shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
                    {step.selection_type === 'exact' ? 'Select exactly' : 'Select up to'} {required}
                  </p>
                  <motion.p
                    key={totalSelected}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    className={`text-[12px] font-black tabular-nums ${
                      ready ? 'text-emerald-600' : atLimit ? 'text-[#e60023]' : 'text-on-surface-variant'
                    }`}
                  >
                    {totalSelected} / {required}
                  </motion.p>
                </div>
                <div className="h-1 bg-on-background/[0.07] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${ready ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#e60023] to-[#ff2060]'}`}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Options list */}
              <div className="overflow-y-auto flex-1 px-6 pb-4 space-y-2">
                {step.options.map((opt) => {
                  const qty = selections[opt.name] ?? 0;
                  const canAdd = !atLimit;
                  return (
                    <motion.div
                      key={opt.name}
                      layout
                      className={`flex items-center justify-between px-4 py-3.5 rounded-[18px] border transition-all duration-200 ${
                        qty > 0
                          ? 'bg-[#e60023]/[0.08] border-[#e60023]/25'
                          : 'bg-surface-dim border-on-background/[0.09]'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className={`text-[13px] font-black truncate transition-colors ${qty > 0 ? 'text-on-background' : 'text-on-background/75'}`}>
                          {opt.name}
                        </p>
                        {opt.upcharge > 0 && (
                          <p className="text-[10px] text-primary font-black mt-0.5">
                            +${opt.upcharge.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <AnimatePresence mode="popLayout">
                          {qty > 0 && (
                            <motion.button
                              key="minus"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                              onClick={() => decrement(opt.name)}
                              className="w-7 h-7 rounded-full bg-on-background/[0.05] border border-on-background/[0.12] flex items-center justify-center hover:bg-on-background/[0.09] active:scale-90 transition-all"
                              aria-label={`Remove one ${opt.name}`}
                            >
                              <Minus size={12} strokeWidth={2.5} className="text-on-background" />
                            </motion.button>
                          )}
                        </AnimatePresence>

                        <AnimatePresence mode="popLayout">
                          {qty > 0 && (
                            <motion.span
                              key={qty}
                              initial={{ scale: 1.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-[13px] font-black text-on-background min-w-[16px] text-center tabular-nums"
                            >
                              {qty}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => increment(opt.name)}
                          disabled={!canAdd}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            canAdd
                              ? 'bg-gradient-to-br from-[#e60023] to-[#ff2060] shadow-[0_3px_12px_rgba(230,0,35,0.45)] hover:shadow-[0_4px_16px_rgba(230,0,35,0.65)]'
                              : 'bg-on-background/[0.05] border border-on-background/[0.07]'
                          }`}
                          aria-label={`Add ${opt.name}`}
                        >
                          <Plus size={12} strokeWidth={2.5} className={canAdd ? 'text-white' : 'text-on-background/30'} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer CTA */}
              <div className="px-6 pt-4 pb-[max(env(safe-area-inset-bottom),24px)] flex-shrink-0 border-t border-on-background/[0.07]">
                {totalUpcharge > 0 && (
                  <p className="text-center text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-3">
                    +${totalUpcharge.toFixed(2)} upcharge included
                  </p>
                )}
                <motion.button
                  whileTap={{ scale: ready ? 0.97 : 1 }}
                  onClick={ready ? handleConfirm : undefined}
                  disabled={!ready}
                  className={`w-full py-4 rounded-full font-black text-[13px] uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 ${
                    ready
                      ? 'btn-brand shadow-[0_8px_32px_rgba(230,0,35,0.45)]'
                      : 'bg-on-background/[0.05] text-on-background/30 border border-on-background/[0.09]'
                  }`}
                >
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  {ready ? 'Add to Cart' : `${required - totalSelected} more to go`}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
