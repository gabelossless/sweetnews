import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { joinDriverWaitlist } from '../../lib/waitlist';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: 'Car',
    city: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await joinDriverWaitlist(formData);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      alert('Submission failed. Please try again.');
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
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white">Join the Fleet</h3>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Waitlist Application</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="E.g. James Bond"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="+1 (555) 000"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-1">Vehicle</label>
                      <select 
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/25 appearance-none font-bold"
                      >
                        <option value="Car" className="bg-black text-white">Car</option>
                        <option value="Scooter" className="bg-black text-white">Scooter</option>
                        <option value="Bicycle" className="bg-black text-white">Bicycle</option>
                      </select>
                    </div>
                  </div>
                  <Input
                    label="Target City"
                    placeholder="E.g. Gotham"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="h-14 mt-4 bg-white text-black hover:bg-white/90"
                  >
                    Submit Application <Send className="ml-2" size={16} />
                  </Button>
                </form>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Application Received</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">
                    You've been added to the Sweet News waitlist. We'll reach out via email once a slot opens in your zone.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
