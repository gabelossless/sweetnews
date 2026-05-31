import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { X, ShoppingBag, Minus, Plus, Truck, ShieldCheck, Lock, Moon } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useDeliveryHours } from '../../hooks/useDeliveryHours';
import { Button } from '../atoms/Button';
import { products } from '../../data/products';
import { Product } from '../../types';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const DELIVERY_FEE = 3.99;
const ORDER_MINIMUM = 10;
const UPSELL_THRESHOLD = 20;

export function CartSheet({ isOpen, onClose, onCheckout }: CartSheetProps) {
  const { isOpen: isDeliveryOpen, opensAt } = useDeliveryHours();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const addItem = useCartStore((state) => state.addItem);
  const dragControls = useDragControls();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const orderTotal = subtotal + DELIVERY_FEE;

  const cartItemIds = new Set(cartItems.map((i) => i.id));
  const belowMinimum = subtotal < ORDER_MINIMUM;
  const amountNeeded = ORDER_MINIMUM - subtotal;
  const minProgress = Math.min((subtotal / ORDER_MINIMUM) * 100, 100);
  const showUpsell = subtotal > 0 && subtotal < UPSELL_THRESHOLD;
  const upsellItems = [...products]
    .filter((p) => !cartItemIds.has(p.id) && p.categoryId !== 'news')
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
          />

          {/* Positioning wrapper — aligns to bottom on mobile, centers on desktop */}
          <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none md:items-center">
          {/* Sheet */}
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260, mass: 0.9 }}
            className="pointer-events-auto w-full max-w-[430px]
                       h-[88vh] md:h-auto md:max-h-[88vh]
                       rounded-t-[48px] md:rounded-[32px]
                       flex flex-col
                       shadow-[0_-24px_80px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]
                       border-t border-white/[0.07] md:border md:border-white/[0.08]"
            style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)' }}
          >
            {/* Drag handle — hidden on desktop where drag-to-close isn't expected */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none md:hidden"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 bg-white/15 rounded-full hover:bg-white/30 transition-colors" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.05]">
              <div>
                <h2 className="font-headline-md text-[20px] font-black uppercase tracking-tight text-white leading-none">
                  Your Cart
                </h2>
                {cartItemsCount > 0 && (
                  <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] font-black mt-0.5">
                    {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                aria-label="Close cart"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5 text-white/50 hover:text-white transition-colors" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
              {cartItemsCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <motion.div
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 22 }}
                    className="w-28 h-28 mb-6 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.06] shadow-[inset_0_2px_0_rgba(255,255,255,0.04)]"
                  >
                    <ShoppingBag className="w-11 h-11 text-white/30" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display-xl text-[26px] uppercase tracking-tighter font-black mb-2 text-white">
                    Cart is empty
                  </h3>
                  <p className="font-body-md text-white/35 mb-8 px-4 leading-relaxed text-[12px] font-medium">
                    Treat those late-night cravings. Add something premium from the vault.
                  </p>
                  <Button
                    whileTapScale={0.94}
                    onClick={onClose}
                    className="px-8 py-3.5 bg-white text-black font-headline-md uppercase tracking-widest text-[11px] rounded-full shadow-[0_8px_24px_rgba(255,255,255,0.15)] hover:bg-white/90 transition-all font-black"
                  >
                    Discover
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  {/* Cart items */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -16, scale: 0.97 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 16, scale: 0.95, height: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                          className="flex gap-4 items-center bg-white/[0.025] p-4 rounded-[22px] border border-white/[0.05] hover:border-white/[0.09] transition-colors"
                        >
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-wide text-center px-1 leading-tight">
                                {item.name.split(' ').slice(0, 2).join('\n')}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-black uppercase tracking-wide text-white truncate">
                              {item.name}
                            </h4>
                            {item.customizations && (
                              <p className="text-[10px] text-white/30 font-medium mt-0.5 truncate">
                                {item.customizations.label}
                              </p>
                            )}
                            <p className="text-[11px] text-white/40 font-medium mt-0.5">
                              ${item.price.toFixed(2)} each
                            </p>
                            <div className="flex items-center gap-2 mt-2.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all text-white"
                              >
                                <Minus className="w-3 h-3" strokeWidth={2.5} />
                              </button>
                              <motion.span
                                key={item.quantity}
                                initial={{ scale: 1.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-[13px] font-black text-white min-w-[16px] text-center"
                              >
                                {item.quantity}
                              </motion.span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all text-white"
                              >
                                <Plus className="w-3 h-3" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                          <div className="text-[15px] font-black text-white flex-shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Upsell rail */}
                  <AnimatePresence>
                    {showUpsell && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-6 overflow-hidden"
                      >
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black px-1 mb-3">
                          Add to your order
                        </p>
                        <div
                          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6"
                          style={{ maskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}
                        >
                          {upsellItems.map((product) => (
                            <UpsellCard
                              key={product.id}
                              product={product}
                              onAdd={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                            />
                          ))}
                          <div className="w-6 flex-shrink-0" aria-hidden />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Order summary */}
                  <div className="mt-8 space-y-4">
                    {/* Minimum progress */}
                    <AnimatePresence>
                      {belowMinimum && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-2xl bg-amber-500/[0.07] border border-amber-400/20 px-4 py-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                              Order minimum
                            </p>
                            <p className="text-[10px] text-amber-400 font-black">
                              Add ${amountNeeded.toFixed(2)} more
                            </p>
                          </div>
                          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-amber-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${minProgress}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Delivery info */}
                    <div className="flex items-center gap-3 px-1 py-3 border-t border-white/[0.04]">
                      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black uppercase tracking-wider text-white/70">
                          Delivery Fee
                        </p>
                        <p className="text-[10px] text-white/30 font-medium">Estimated 25–45 min</p>
                      </div>
                      <span className="text-[13px] font-black text-white/60">
                        ${DELIVERY_FEE.toFixed(2)}
                      </span>
                    </div>

                    {/* Total row */}
                    <div className="flex justify-between items-center px-1 pb-2">
                      <span className="text-[11px] tracking-[0.25em] uppercase text-white/35 font-black">
                        Order Total
                      </span>
                      <motion.span
                        key={orderTotal}
                        initial={{ scale: 1.1, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[26px] font-black tracking-tight text-white"
                      >
                        ${orderTotal.toFixed(2)}
                      </motion.span>
                    </div>

                    {/* Checkout CTA */}
                    {!isDeliveryOpen ? (
                      <div className="w-full py-4 rounded-full bg-white/[0.03] border border-white/[0.07] flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <Moon size={12} className="text-white/30" strokeWidth={1.5} />
                          <p className="text-[11px] font-black uppercase tracking-widest text-white/30">
                            We're Closed
                          </p>
                        </div>
                        <p className="text-[9px] text-white/20 font-medium">
                          Deliveries available 9 PM – 4 AM · Opens {opensAt}
                        </p>
                      </div>
                    ) : belowMinimum ? (
                      <div className="w-full py-4 rounded-full bg-amber-500/[0.08] border border-amber-400/25 flex items-center justify-center gap-2">
                        <Lock size={12} className="text-amber-400/70" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                          Add ${amountNeeded.toFixed(2)} to unlock checkout
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={onCheckout}
                        whileTapScale={0.95}
                        className="w-full py-5 btn-brand font-headline-md uppercase tracking-[0.2em] text-[12px] rounded-full font-black shadow-[0_10px_32px_rgba(230,0,35,0.5)] hover:shadow-[0_12px_40px_rgba(230,0,35,0.65)] transition-shadow"
                      >
                        Proceed to Checkout →
                      </Button>
                    )}

                    {/* Trust signals */}
                    <div className="flex items-center justify-center gap-2 pt-2 text-[9px] uppercase font-black tracking-[0.2em] text-white/20">
                      <ShieldCheck size={11} className="text-white/25" />
                      256-bit SSL · Secure Checkout
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function UpsellCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 w-[120px] rounded-[20px] bg-white/[0.03] border border-white/[0.06] p-3 flex flex-col gap-2"
    >
      {/* Image / placeholder */}
      <div className="w-full aspect-square rounded-[14px] bg-white/[0.04] border border-white/[0.05] flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[8px] font-black text-white/20 uppercase tracking-wide text-center px-1 leading-tight">
            {product.name.split(' ').slice(0, 2).join('\n')}
          </span>
        )}
      </div>

      {/* Name + price */}
      <div className="flex-1">
        <p className="text-[10px] font-black text-white/80 leading-tight line-clamp-2 uppercase tracking-wide">
          {product.name}
        </p>
        <p className="text-[11px] font-black text-white mt-0.5">
          ${product.price.toFixed(2)}
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        aria-label={`Add ${product.name}`}
        className="w-full py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 border border-white/[0.1] transition-all text-[10px] font-black text-white/70 uppercase tracking-wider"
      >
        + Add
      </button>
    </motion.div>
  );
}

export default CartSheet;
