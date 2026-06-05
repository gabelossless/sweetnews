import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ArrowRight, Mail, Lock } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { sanitizeObject } from '../../lib/utils';

export default function FleetLoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const sanitizedData = sanitizeObject(formData);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, sanitizedData.email, sanitizedData.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, sanitizedData.email, sanitizedData.password);
        await updateProfile(user, { displayName: sanitizedData.name });
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // fixed inset-0 + overflow-y-auto is the most reliable full-screen pattern on iOS Safari
    <div className="fixed inset-0 bg-background text-on-background overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full space-y-8"
          style={{ maxWidth: '384px' }}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter">
              FLEET<span style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LOGIN</span>
            </h1>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest">
              Sweet News Delivery Partners
            </p>
          </div>

          {/* Form card */}
          <div className="w-full bg-on-background/[0.05] border border-on-background/[0.09] rounded-3xl p-6 space-y-6">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              )}

              <Input
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                required
                icon={<Mail size={16} />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                required
                icon={<Lock size={16} />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <Button
                type="submit"
                variant="brand"
                fullWidth
                loading={loading}
                className="h-14 mt-4 rounded-2xl text-base"
              >
                {isLogin ? 'Sign In to Fleet' : 'Create Partner Account'} <ArrowRight className="ml-2" size={18} />
              </Button>

              {authError && (
                <p className="text-[12px] text-red-500 text-center leading-relaxed pt-1">
                  {authError}
                </p>
              )}
            </form>

            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-on-surface-variant hover:text-amber-600 transition-colors flex items-center gap-2 mx-auto"
              >
                {isLogin ? (
                  <><UserPlus size={14} /> New here? Apply to deliver</>
                ) : (
                  <><LogIn size={14} /> Already a partner? Sign in</>
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center text-on-background/30 px-4">
            By signing in, you agree to the Sweet News Delivery Partner Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
