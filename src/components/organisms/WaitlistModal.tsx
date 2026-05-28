import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import {
  joinDriverWaitlist,
  WaitlistValidationError,
  WaitlistDuplicateError,
  WaitlistNetworkError,
  WaitlistEntry,
} from '../../lib/waitlist';
import { isValidEmail, isValidPhone, isNonEmpty } from '../../lib/utils';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_FLAG_KEY = 'sn-driver-waitlist-submitted';
const FLAG_TTL_DAYS = 30;

type FieldErrors = Partial<Record<keyof WaitlistEntry | '_form', string>>;

function readSubmittedFlag(): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_FLAG_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw) as { ts: number };
    const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return ageDays < FLAG_TTL_DAYS;
  } catch {
    return false;
  }
}

function writeSubmittedFlag() {
  try {
    localStorage.setItem(LOCAL_FLAG_KEY, JSON.stringify({ ts: Date.now() }));
  } catch {
    // ignore quota/private mode failures
  }
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<WaitlistEntry & { website: string }>({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: '',
    city: '',
    website: '', // honeypot — must stay empty
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  // If the user submitted recently, skip the form and show the success state
  useEffect(() => {
    if (isOpen && readSubmittedFlag()) {
      setSubmitted(true);
    }
  }, [isOpen]);

  // Reset transient state when closed
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setErrors({});
        if (!readSubmittedFlag()) setSubmitted(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const requiredFilled =
    formData.fullName.trim().length > 1 &&
    formData.email.trim().length > 3 &&
    formData.phone.trim().length > 3 &&
    formData.city.trim().length > 1;

  const setField = (key: keyof typeof formData, value: string) => {
    setFormData((s) => ({ ...s, [key]: value }));
    if (errors[key as keyof FieldErrors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validateField = (key: keyof WaitlistEntry) => {
    const value = formData[key];
    let msg: string | undefined;
    if (key === 'fullName' && !isNonEmpty(value, 2)) msg = 'Please enter your name.';
    if (key === 'email' && value && !isValidEmail(value)) msg = 'Please enter a valid email.';
    if (key === 'phone' && value && !isValidPhone(value)) msg = 'Please enter a valid phone number.';
    if (key === 'city' && !isNonEmpty(value, 2)) msg = 'Please enter your city.';
    if (msg) setErrors((e) => ({ ...e, [key]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: bots fill hidden fields. Pretend success, do nothing.
    if (formData.website.trim().length > 0) {
      setSubmitted(true);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await joinDriverWaitlist({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        vehicleType: formData.vehicleType,
        city: formData.city,
      });
      writeSubmittedFlag();
      setSubmitted(true);
    } catch (err) {
      if (err instanceof WaitlistValidationError) {
        setErrors({ [err.field]: err.message });
      } else if (err instanceof WaitlistDuplicateError) {
        setErrors({ email: "This email is already on the waitlist. We'll be in touch." });
      } else if (err instanceof WaitlistNetworkError) {
        setErrors({ _form: 'Connection issue. Try again in a moment.' });
      } else {
        setErrors({ _form: 'Something went wrong. Try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex justify-between items-center">
              <h3 className="text-lg font-black text-white tracking-tight">Join the Fleet</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 -mr-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-7">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    required
                    maxLength={200}
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    onBlur={() => validateField('fullName')}
                  />
                  {errors.fullName && <FieldError text={errors.fullName} />}

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    maxLength={200}
                    autoComplete="email"
                    inputMode="email"
                    value={formData.email}
                    onChange={(e) => setField('email', e.target.value)}
                    onBlur={() => validateField('email')}
                  />
                  {errors.email && <FieldError text={errors.email} />}

                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1 555 123 4567"
                    required
                    maxLength={50}
                    autoComplete="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    onBlur={() => validateField('phone')}
                  />
                  {errors.phone && <FieldError text={errors.phone} />}

                  <Input
                    label="City"
                    placeholder="Where you want to deliver"
                    required
                    maxLength={200}
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => setField('city', e.target.value)}
                    onBlur={() => validateField('city')}
                  />
                  {errors.city && <FieldError text={errors.city} />}

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">
                      Vehicle (optional)
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setField('vehicleType', e.target.value)}
                      className="w-full h-12 bg-[#141414] border border-white/[0.08] rounded-2xl px-4 text-sm text-white focus:outline-none focus:border-white/25 appearance-none font-medium"
                    >
                      <option value="" className="bg-black text-white">—</option>
                      <option value="Car" className="bg-black text-white">Car</option>
                      <option value="Scooter" className="bg-black text-white">Scooter</option>
                      <option value="Bicycle" className="bg-black text-white">Bicycle</option>
                      <option value="Motorcycle" className="bg-black text-white">Motorcycle</option>
                    </select>
                  </div>

                  {/* Honeypot — hidden from users, visible to bots */}
                  <div aria-hidden="true" className="hidden">
                    <label>
                      Website
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={(e) => setField('website', e.target.value)}
                      />
                    </label>
                  </div>

                  {errors._form && (
                    <p className="text-[11px] text-red-400 leading-snug" role="alert">
                      {errors._form}
                    </p>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    disabled={!requiredFilled || loading}
                    className="h-12 mt-2 bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 rounded-2xl font-bold transition-colors"
                  >
                    Join waitlist <Send className="ml-2" size={15} />
                  </Button>

                  <p className="text-[10px] text-white/30 text-center leading-relaxed pt-1">
                    We use your info only to reach out about delivery partnerships.
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">You're on the list</h3>
                  <p className="text-sm text-white/55 leading-relaxed max-w-[260px] mx-auto">
                    We'll email you when a slot opens in your city.
                  </p>
                  <button
                    onClick={onClose}
                    className="text-[11px] text-white/40 hover:text-white/70 transition-colors pt-2 uppercase tracking-widest font-bold"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FieldError({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-red-400 leading-snug -mt-2 ml-1" role="alert">
      {text}
    </p>
  );
}
