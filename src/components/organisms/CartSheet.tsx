import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { Button } from '../atoms/Button';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSheet({ isOpen, onClose, onCheckout }: CartSheetProps) {
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full h-[85vh] bg-[#050505] rounded-t-[32px] z-[70] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/[0.06] md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.04]">
              <h2 className="font-headline-md text-[22px] font-bold">Your Cart</h2>
              <button 
                onClick={onClose}
                aria-label="Close cart"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cartItemsCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] text-center px-6 py-12">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-32 h-32 mb-6 rounded-full bg-white/5 flex items-center justify-center shadow-inner border border-white/5"
                  >
                    <ShoppingBag className="w-12 h-12 text-on-surface-variant opacity-60" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-headline-lg text-[24px] font-bold mb-2">Your cart is feeling light</h3>
                  <p className="font-body-md text-on-surface-variant mb-8 px-4 leading-relaxed text-sm">Let's treat those late-night cravings. Add some delicious snacks to get started!</p>
                  <Button 
                    whileTapScale={0.95}
                    onClick={onClose}
                    className="px-8 py-3.5 bg-primary text-on-primary font-label-bold text-[16px] rounded-full shadow-[0_4px_15px_rgba(230,0,35,0.4)] hover:shadow-[0_6px_20px_rgba(230,0,35,0.5)] transition-all font-bold"
                  >
                    Explore Snacks
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/[0.04]">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-label-bold text-[15px] truncate">{item.name}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 text-on-surface"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="font-label-bold text-[14px] min-w-[12px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 text-on-surface"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                        <div className="font-label-bold text-[15px]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 border-t border-white/[0.04] pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-body-lg text-[18px]">Total</span>
                      <span className="font-headline-md text-[20px] font-bold text-primary">
                        ${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      onClick={onCheckout}
                      disabled={cartItems.length === 0}
                      whileTapScale={0.95}
                      className="w-full py-4 bg-primary text-on-primary font-label-bold text-[16px] rounded-full shadow-[0_4px_15px_rgba(230,0,35,0.4)] hover:shadow-[0_6px_20px_rgba(230,0,35,0.5)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed font-bold"
                    >
                      Checkout
                    </Button>
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
