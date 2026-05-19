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
            className="fixed bottom-0 left-0 w-full h-[85vh] bg-[#000]/80 backdrop-blur-[50px] rounded-t-[48px] z-[70] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.9),_inset_0_1px_0_rgba(255,255,255,0.1)] border-t border-white/[0.08] md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            
             <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.04]">
              <h2 className="font-headline-md text-[20px] font-black uppercase tracking-tight text-white">Your Cart</h2>
              <button 
                onClick={onClose}
                aria-label="Close cart"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
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
                    <ShoppingBag className="w-12 h-12 text-white/40" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display-xl text-[28px] uppercase tracking-tighter font-black mb-2">Your cart is empty</h3>
                  <p className="font-body-md text-white/40 mb-8 px-4 leading-relaxed text-xs font-medium">Let's treat those late-night cravings. Add some premium snacks to get started.</p>
                  <Button 
                    whileTapScale={0.95}
                    onClick={onClose}
                    className="px-8 py-3.5 bg-white text-black font-headline-md uppercase tracking-widest text-[11px] rounded-full shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:bg-white/90 transition-all font-black"
                  >
                    Discover
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-white/[0.02] p-4 rounded-[24px] border border-white/[0.05]">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-2xl" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-black uppercase tracking-wide text-white truncate">{item.name}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 text-white"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="text-[13px] font-black text-white min-w-[12px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 text-white"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm font-black text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 border-t border-white/[0.04] pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-black">Total</span>
                      <span className="text-[24px] font-black tracking-widest text-white">
                        ${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={onCheckout}
                      disabled={cartItems.length === 0}
                      whileTapScale={0.95}
                      className="w-full py-5 btn-brand font-headline-md uppercase tracking-[0.2em] text-[12px] rounded-full disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed font-black"
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
