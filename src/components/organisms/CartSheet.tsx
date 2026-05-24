import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { X, ShoppingBag, Minus, Plus, Truck, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { Button } from '../atoms/Button';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const DELIVERY_FEE = 3.99;

export function CartSheet({ isOpen, onClose, onCheckout }: CartSheetProps) {
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const dragControls = useDragControls();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const orderTotal = subtotal + DELIVERY_FEE;

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
            className="fixed bottom-0 left-0 w-full h-[88vh] rounded-t-[48px] z-[70] flex flex-col
                       shadow-[0_-24px_80px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]
                       border-t border-white/[0.07]
                       md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)', backdropFilter: 'blur(60px)' }}
          >
            {/* Drag handle — touch to drag */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
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
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {cartItemsCount === 0 ? (
                /* Empty state */
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
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-black uppercase tracking-wide text-white truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-white/40 font-medium mt-0.5">
                              ${item.price.toFixed(2)} each
                            </p>
                            {/* Stepper */}
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

                  {/* Order summary */}
                  <div className="mt-8 space-y-4">
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
                    <Button
                      onClick={onCheckout}
                      disabled={cartItems.length === 0}
                      whileTapScale={0.95}
                      className="w-full py-5 btn-brand font-headline-md uppercase tracking-[0.2em] text-[12px] rounded-full disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed font-black shadow-[0_10px_32px_rgba(230,0,35,0.5)] hover:shadow-[0_12px_40px_rgba(230,0,35,0.65)] transition-shadow"
                    >
                      Proceed to Checkout →
                    </Button>

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
        </>
      )}
    </AnimatePresence>
  );
}

export default CartSheet;
