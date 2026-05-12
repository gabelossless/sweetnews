import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useProfileStore } from '../../store/profile';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { sanitizeString } from '../../lib/utils';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (details: { name: string; address: string }) => void;
  isProcessing: boolean;
  isOrderPlaced: boolean;
}

export function CheckoutForm({ 
  isOpen, 
  onClose, 
  onPlaceOrder, 
  isProcessing, 
  isOrderPlaced 
}: CheckoutFormProps) {
  const cartItems = useCartStore((state) => state.items);
  
  // Connect to persistent profile store
  const savedName = useProfileStore((state) => state.deliveryName);
  const savedAddress = useProfileStore((state) => state.deliveryAddress);
  
  // Local editable checkout fields
  const [deliveryName, setLocalName] = useState(savedName);
  const [deliveryAddress, setLocalAddress] = useState(savedAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({ 
      name: sanitizeString(deliveryName), 
      address: sanitizeString(deliveryAddress) 
    });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + 3.99;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full h-[90vh] md:h-[85vh] bg-[#050505] md:rounded-[32px] rounded-t-[32px] md:max-w-md md:border border-white/[0.06] flex flex-col pt-6 pb-6 px-6 overflow-hidden z-[85] relative shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-lg text-[24px] font-bold tracking-tight">Checkout</h2>
              <button 
                onClick={onClose}
                aria-label="Close checkout"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            {isOrderPlaced ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-primary mb-6 animate-pulse" />
                </motion.div>
                <h3 className="font-headline-lg text-[28px] font-bold mb-3 tracking-tight">Cooking Order!</h3>
                <p className="font-body-md text-on-surface-variant mb-8 px-4 text-sm leading-relaxed">Your premium snacks are locked in. Redirecting you to the live tracking console...</p>
              </div>
            ) : (
              <>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
                <div className="space-y-6 flex-1 pb-4">
                  {/* Delivery Details */}
                  <section>
                    <h3 className="font-label-bold text-[11px] text-on-surface-variant mb-3 uppercase tracking-widest pl-1 font-bold">Delivery Details</h3>
                    <div className="space-y-3">
                      <Input 
                        required 
                        type="text" 
                        placeholder="Full Name" 
                        value={deliveryName}
                        onChange={(e) => setLocalName(e.target.value)}
                        className="bg-[#0a0a0a]"
                      />
                      <Input 
                        required 
                        type="text" 
                        placeholder="Street Address" 
                        value={deliveryAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                        className="bg-[#0a0a0a]"
                      />
                      <div className="flex gap-3">
                        <Input type="text" placeholder="Apt/Suite" className="w-1/3 bg-[#0a0a0a]" />
                        <Input type="text" placeholder="Instructions" className="w-2/3 bg-[#0a0a0a]" />
                      </div>
                    </div>
                  </section>
                  
                  {/* Payment Info */}
                  <section>
                    <h3 className="font-label-bold text-[11px] text-on-surface-variant mb-3 uppercase tracking-widest pl-1 font-bold">Payment Method</h3>
                    <div className="space-y-3">
                      <Input required type="text" placeholder="Card Number" maxLength={19} defaultValue="•••• •••• •••• 1024" className="bg-[#0a0a0a] font-mono" />
                      <div className="flex gap-3">
                        <Input required type="text" placeholder="MM/YY" maxLength={5} defaultValue="12/29" className="w-1/2 bg-[#0a0a0a] font-mono" />
                        <Input required type="text" placeholder="CVC" maxLength={4} defaultValue="459" className="w-1/2 bg-[#0a0a0a] font-mono" />
                      </div>
                    </div>
                  </section>

                  <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-[24px] p-5 mt-2">
                    <div className="flex justify-between items-center mb-3 font-body-md text-xs text-on-surface-variant font-medium">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 font-body-md text-xs text-on-surface-variant font-medium">
                      <span>Delivery Fee</span>
                      <span>$3.99</span>
                    </div>
                    <div className="w-full h-px bg-white/[0.06] my-3"></div>
                    <div className="flex justify-between items-center font-label-bold text-[18px] text-white">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/[0.04] mt-auto shrink-0 bg-[#050505]">
                  <Button 
                    type="submit"
                    disabled={isProcessing}
                    whileTapScale={0.95}
                    className="w-full py-4 bg-primary text-on-primary font-label-bold text-[16px] rounded-full shadow-[0_4px_15px_rgba(230,0,35,0.3)] disabled:opacity-70 flex justify-center items-center gap-2 relative overflow-hidden transition-all font-bold"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4 opacity-70" strokeWidth={2.5} />
                        <span>Pay ${total.toFixed(2)}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="mt-8 mb-4 px-6 text-center">
                <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">
                  Love the speed? <button onClick={() => window.location.href='/fleet'} className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">Apply to be a driver</button> and earn on your schedule.
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest text-on-surface-variant mt-4 opacity-40">
                  <ShieldCheck size={12} className="text-emerald-500" /> Secure Encryption Active
                </div>
              </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CheckoutForm;
