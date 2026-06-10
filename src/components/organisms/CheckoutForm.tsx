import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, ChevronDown, MapPin, Plus } from 'lucide-react';
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
      color: '#2a1a1f',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#7a6a6f' },
    },
    invalid: { color: '#d61f2b' },
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
  const savedAddresses = useProfileStore((state) => state.savedAddresses);
  const addAddress = useProfileStore((state) => state.addAddress);

  const defaultAddress = savedAddresses.find(a => a.isDefault);
  const initialAddress = defaultAddress ? `${defaultAddress.street}${defaultAddress.apt ? `, ${defaultAddress.apt}` : ''}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.zip}` : '';

  const [deliveryName, setLocalName] = useState(savedName);
  const [deliveryAddress, setLocalAddress] = useState(initialAddress);
  const [deliveryApt, setLocalApt] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);
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

      const sanitizedApt = sanitizeString(deliveryApt).trim();
      const fullAddress = sanitizedApt
        ? `${sanitizeString(deliveryAddress)}, ${sanitizedApt}`
        : sanitizeString(deliveryAddress);

      onPlaceOrder({
        name: sanitizeString(deliveryName),
        address: fullAddress,
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#2a1a1f]/40 backdrop-blur-sm"
          />
          {/* Positioning wrapper */}
          <div className="fixed inset-0 z-[81] flex items-end md:items-center justify-center pointer-events-none">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pointer-events-auto w-full max-w-[430px] h-[95vh] md:h-auto md:max-h-[90vh] bg-surface backdrop-blur-[50px] rounded-t-[48px] md:rounded-[32px] flex flex-col shadow-[0_-20px_60px_rgba(42,26,31,0.12),_inset_0_1px_0_rgba(255,255,255,0.1)] border-t border-on-background/[0.09] md:border md:border-on-background/[0.09]"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-on-background/[0.15] rounded-full" />
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-b border-on-background/[0.07]">
              <h2 className="font-display-xl text-[24px] uppercase tracking-tighter font-black text-on-background">Checkout</h2>
              <button
                onClick={onClose}
                aria-label="Close checkout"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-on-background/[0.05] hover:bg-on-background/[0.07] transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant hover:text-on-background" />
              </button>
            </div>

            {isOrderPlaced ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-primary mb-6 animate-pulse" />
                </motion.div>
                <h3 className="font-display-xl text-[36px] uppercase font-black mb-3 tracking-tighter text-on-background">Order Sent</h3>
                <p className="font-body-md text-on-surface-variant mb-8 px-4 text-xs font-medium leading-relaxed">
                  Your premium snacks are locked in. Redirecting you to the live tracking console...
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto hide-scrollbar px-6 pt-6">
                  <div className="space-y-6 flex-1 pb-4">
                    {/* Delivery Details */}
                    <section>
                      <h3 className="font-headline-md text-[10px] text-on-surface-variant mb-3 uppercase tracking-[0.25em] pl-1 font-black">
                        Delivery Details
                      </h3>
                      <div className="space-y-3">
                        <Input
                          required
                          type="text"
                          placeholder="Full Name"
                          value={deliveryName}
                          onChange={(e) => setLocalName(e.target.value)}
                          className="bg-surface-dim"
                        />
                        {/* Saved address selector */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowAddressPicker(!showAddressPicker)}
                            className="w-full flex items-center gap-3 text-sm font-bold text-on-background bg-surface-dim border border-on-background/[0.07] hover:border-on-background/[0.12] outline-none px-4 py-3 rounded-2xl text-left transition-all duration-200"
                          >
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
                            <span className="flex-1 truncate">
                              {deliveryAddress || 'Select or type an address'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${showAddressPicker ? 'rotate-180' : ''}`} strokeWidth={2} />
                          </button>

                          <AnimatePresence>
                            {showAddressPicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
                                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-20 top-full mt-1 left-0 right-0 bg-surface border border-on-background/[0.09] rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.3)] overflow-hidden"
                              >
                                {savedAddresses.map((addr) => (
                                  <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => {
                                      const full = `${addr.street}${addr.apt ? `, ${addr.apt}` : ''}, ${addr.city}, ${addr.state} ${addr.zip}`;
                                      setLocalAddress(full);
                                      setShowAddressPicker(false);
                                    }}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-on-background/[0.05] transition-colors text-left"
                                  >
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold text-on-background truncate">{addr.label}</p>
                                      <p className="text-[10px] text-on-surface-variant truncate">
                                        {addr.street}{addr.apt ? `, ${addr.apt}` : ''}, {addr.city}, {addr.state} {addr.zip}
                                      </p>
                                    </div>
                                    {addr.isDefault && (
                                      <span className="text-[8px] font-black uppercase tracking-wider text-amber-500 flex-shrink-0">Default</span>
                                    )}
                                  </button>
                                ))}
                                <div className="border-t border-on-background/[0.07]">
                                  <input
                                    type="text"
                                    placeholder="Or type a custom address..."
                                    value={deliveryAddress}
                                    onChange={(e) => setLocalAddress(e.target.value)}
                                    className="w-full text-sm font-bold text-on-background bg-transparent outline-none px-4 py-3 placeholder:text-on-surface-variant tracking-wide"
                                    onFocus={() => setShowAddressPicker(false)}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <Input
                          type="text"
                          placeholder="Apt / Suite (optional)"
                          value={deliveryApt}
                          onChange={(e) => setLocalApt(e.target.value)}
                          className="bg-surface-dim"
                        />
                      </div>
                    </section>

                    {/* Payment — Stripe Elements */}
                    <section>
                      <h3 className="font-headline-md text-[10px] text-on-surface-variant mb-3 uppercase tracking-[0.25em] pl-1 font-black">
                        Payment Method
                      </h3>
                      <div className="bg-surface-dim border border-on-background/[0.09] rounded-2xl px-4 py-4 focus-within:border-on-background/[0.12] transition-colors">
                        <CardElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                      {cardError && (
                        <p className="text-[12px] text-red-600 mt-2 pl-1">{cardError}</p>
                      )}
                    </section>

                    {/* Order Summary */}
                    <div className="bg-surface-dim border border-on-background/[0.07] rounded-[24px] p-5 mt-2">
                      <div className="flex justify-between items-center mb-3 font-body-md text-xs text-on-surface-variant font-medium">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3 font-body-md text-xs text-on-surface-variant font-medium">
                        <span>Delivery Fee</span>
                        <span>$3.99</span>
                      </div>
                      <div className="w-full h-px bg-on-background/[0.07] my-3"></div>
                      <div className="flex justify-between items-center mb-6 px-1">
                        <span className="text-[11px] tracking-[0.2em] uppercase text-on-surface-variant font-black">Total</span>
                        <span className="text-[24px] font-black tracking-widest text-on-background">
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
                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-medium">
                    Love the speed?{' '}
                    <button
                      onClick={() => (window.location.href = '/fleet')}
                      className="text-on-background font-black hover:underline bg-transparent border-none p-0 cursor-pointer uppercase tracking-wider text-[9px]"
                    >
                      Apply to be a driver
                    </button>{' '}
                    and earn on your schedule.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-[0.25em] text-on-surface-variant mt-3">
                    <ShieldCheck size={12} className="text-on-surface-variant" /> Secure Encryption Active
                  </div>
                </div>
              </>
            )}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CheckoutForm;
