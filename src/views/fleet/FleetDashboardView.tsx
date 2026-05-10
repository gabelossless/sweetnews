import { motion } from 'motion/react';
import { LogOut, MapPin, Package, Navigation, Settings } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

export default function FleetDashboardView() {
  const { } = useAuth();
  const handleSignOut = () => signOut(auth);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div>
          <h2 className="text-xl font-black tracking-tight">FLEET<span className="text-primary">DASH</span></h2>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Active Session</p>
        </div>
        <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-3xl p-6 text-white shadow-[0_20px_50px_rgba(255,107,0,0.3)]"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Current Status</p>
              <h3 className="text-2xl font-black italic">ON SHIFT</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Navigation className="text-white w-6 h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-[8px] uppercase font-bold opacity-60 mb-1">Deliveries</p>
              <p className="text-lg font-black">0</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-[8px] uppercase font-bold opacity-60 mb-1">Earnings</p>
              <p className="text-lg font-black">$0.00</p>
            </div>
          </div>
        </motion.div>

        <section className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Available Missions</h4>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center">
              <Package className="text-white/20 w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/40">Searching for snacks...</p>
              <p className="text-[10px] text-white/20">Orders will appear here as they are placed.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="p-4 border-t border-white/5 flex justify-around items-center bg-black/80 backdrop-blur-xl sticky bottom-0">
        <button className="text-primary"><Package size={24} /></button>
        <button className="text-on-surface-variant/40"><MapPin size={24} /></button>
        <button className="text-on-surface-variant/40"><Settings size={24} /></button>
      </nav>
    </div>
  );
}
