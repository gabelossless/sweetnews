import { useState } from 'react';
import { motion } from 'motion/react';
import { Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { sanitizeObject } from '../../lib/utils';

export default function FleetApplyView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    licensePlate: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const sanitizedData = sanitizeObject(formData);
      
      // 1. Log the application
      const applicationId = `app_${user.uid}`;
      await setDoc(doc(db, 'driver_applications', applicationId), {
        uid: user.uid,
        email: user.email,
        ...sanitizedData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });

      // 2. Update user profile to pending
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'driver_pending'
      });
      
      // The AuthContext will automatically update and show the Pending view
    } catch (error) {
      console.error('Application failed:', error);
      setSubmitError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background p-6 pt-12 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto w-full space-y-8"
      >
        <header className="space-y-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
            <Truck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Become a Partner</h1>
          <p className="text-on-surface-variant text-sm">
            Deliver premium snacks. Earn on your own schedule.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Vehicle Type"
              placeholder="e.g. Car, Scooter, Bike"
              required
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            />
            <Input
              label="License Plate / ID"
              placeholder="Your vehicle identifier"
              required
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="bg-on-background/[0.05] border border-on-background/[0.09] rounded-2xl p-4">
            <h4 className="text-xs font-bold text-on-background uppercase tracking-wider mb-3">Partner Benefits</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                <CheckCircle2 size={12} className="text-amber-600" /> Instant payouts after every shift
              </div>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                <CheckCircle2 size={12} className="text-amber-600" /> Premium route optimization
              </div>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                <CheckCircle2 size={12} className="text-amber-600" /> Exclusive "Sweet News" driver perks
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-[12px] text-red-500 text-center leading-relaxed">{submitError}</p>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            className="h-14 text-base font-bold rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}
          >
            Submit Application <ArrowRight className="ml-2" size={18} />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
