import { motion } from 'motion/react';
import { Clock, ShieldCheck, LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function FleetPendingView() {
  const handleSignOut = () => signOut(auth);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 rounded-full p-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight">Application Pending</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Your application is currently in our queue. Our HQ team reviews every delivery partner to maintain our "Apple Standard" of service.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-xs font-medium text-white/80">Background Check: <span className="text-primary">Processing</span></p>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-xs font-medium text-white/80">Vehicle Verification: <span className="text-primary">Pending Review</span></p>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 mx-auto text-on-surface-variant hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
