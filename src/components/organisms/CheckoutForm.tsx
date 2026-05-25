import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../../store/cart';
import { useProfileStore } from '../../store/profile';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { sanitizeString } from '../../lib/utils';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (details: { name: string; address: string; paymentIntentId: string }) => void;
  isProcessing: boolean;
  isOrderPlaced: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#a1a1a6' },
    },
    invalid: { color: '#ff453a' },
  },
};

export function CheckoutForm({
  isOpen,
  onClose,
  onPlaceOrder,
  isProcessing,
  isOrderPlaced,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useCartStore((state) => state.items);

  const savedName = useProfileStore((state) => state.deliveryName);
  const savedAddress = useProfileStore((state) => state.deliveryAddress);

  const [deliveryName, setLocalName] = useState(savedName);
  const [deliveryAddress, setLocalAddress] = useState(savedAddress);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    if (!stripe || !elements) {
      setCardError('Payment system not loaded. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsSubmitting(true);

    try {
      // Step 1: Create PaymentIntent server-side
      const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const totalCents = Math.round((subtotal + 3.99) * 100);

      const chargeRes = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalCents }),
      });

      const chargeData = await chargeRes.json() as { clientSecret?: string; error?: string };

      if (!chargeRes.ok || !chargeData.clientSecret) {
        setCardError(chargeData.error ?? 'Payment could not be initialised. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Confirm payment with card element
      const { paymentIntent, error } = await stripe.confirmCardPayment(chargeData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: sanitizeString(deliveryName) },
        },
      });

      if (error) {
        setCardError(error.message ?? 'Card declined. Please try another card.');
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent?.status !== 'succeeded') {
        setCardError('Payment was not completed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      onPlaceOrder({
        name: sanitizeString(deliveryName),
        address: sanitizeString(deliveryAddress),
        paymentIntentId: paymentIntent.id,
      });
    } catch {
      setCardError('A network error occurred. Please check your connection and try again.');
      setIsSubmitting(false);
    }
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full h-[95vh] bg-[#000]/90 backdrop-blur-[50px] rounded-t-[48px] z-[70] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.9),_inset_0_1px_0_rgba(255,255,255,0.1)] border-t border-white/[0.08] md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.04]">
              <h2 className="font-display-xl text-[24px] uppercase tracking-tighter font-black">Checkout</h2>
              <button
                onClick={onClose}
                aria-label="Close checkout"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            </div>

            {isOrderPlaced ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-white mb-6 animate-pulse" />
                </motion.div>
                <h3 className="font-display-xl text-[36px] uppercase font-black mb-3 tracking-tighter">Order Sent</h3>
                <p className="font-body-md text-white/40 mb-8 px-4 text-xs font-medium leading-relaxed">
                  Your premium snacks are locked in. Redirecting you to the live tracking console...
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto hide-scrollbar px-6 pt-6">
                  <div className="space-y-6 flex-1 pb-4">
                    {/* Delivery Details */}
                    <section>
                      <h3 className="font-headline-md text-[10px] text-white/40 mb-3 uppercase tracking-[0.25em] pl-1 font-black">
                        Delivery Details
                      </h3>
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
 
                    {/* Payment — Stripe Elements */}
                    <section>
                      <h3 className="font-headline-md text-[10px] text-white/40 mb-3 uppercase tracking-[0.25em] pl-1 font-black">
                        Payment Method
                      </h3>
                      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl px-4 py-4 focus-within:border-white/20 transition-colors">
                        <CardElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                      {cardError && (
                        <p className="text-[12px] text-red-400 mt-2 pl-1">{cardError}</p>
                      )}
                    </section>
 
                    {/* Order Summary */}
                    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-[24px] p-5 mt-2">
                      <div className="flex justify-between items-center mb-3 font-body-md text-xs text-white/40 font-medium">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3 font-body-md text-xs text-white/40 font-medium">
                        <span>Delivery Fee</span>
                        <span>$3.99</span>
                      </div>
                      <div className="w-full h-px bg-white/[0.06] my-3"></div>
                      <div className="flex justify-between items-center mb-6 px-1">
                        <span className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-black">Total</span>
                        <span className="text-[24px] font-black tracking-widest text-white">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isProcessing || isSubmitting || !stripe || !elements || cartItems.length === 0}
                        whileTapScale={0.95}
                        className="w-full py-5 btn-brand font-headline-md uppercase tracking-[0.2em] text-[12px] rounded-full transition-all disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed font-black"
                      >
                        {isSubmitting || isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
 
                </form>
 
                <div className="mt-4 mb-2 px-6 text-center">
                  <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                    Love the speed?{' '}
                    <button
                      onClick={() => (window.location.href = '/fleet')}
                      className="text-white font-black hover:underline bg-transparent border-none p-0 cursor-pointer uppercase tracking-wider text-[9px]"
                    >
                      Apply to be a driver
                    </button>{' '}
                    and earn on your schedule.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-[0.25em] text-white/40 mt-3">
                    <ShieldCheck size={12} className="text-white/60" /> Secure Encryption Active
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
