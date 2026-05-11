import { motion } from 'motion/react';
import { ChevronRight, Bell, Wifi, WifiOff, ShieldCheck, Car } from 'lucide-react';
import { useProfileStore } from '../store/profile';
import { useAuth } from '../context/AuthContext';
import { WaitlistModal } from '../components/organisms/WaitlistModal';
import { useState } from 'react';

interface ProfileViewProps {
  isOnline: boolean;
  onRedeemReward: (rewardName: string) => void;
}

export function ProfileView({ isOnline, onRedeemReward }: ProfileViewProps) {
  const { role } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const deliveryName = useProfileStore((state) => state.deliveryName);
  const deliveryAddress = useProfileStore((state) => state.deliveryAddress);
  const pushNotifications = useProfileStore((state) => state.pushNotificationsEnabled);
  
  const setDeliveryName = useProfileStore((state) => state.setDeliveryName);
  const setDeliveryAddress = useProfileStore((state) => state.setDeliveryAddress);
  const setPushNotifications = useProfileStore((state) => state.setPushNotificationsEnabled);

  return (
    <motion.div
      key="profile-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="mt-2 min-h-[70vh]"
    >
      <section className="mb-8">
        <h1 className="font-headline-lg text-[32px] leading-tight font-extrabold mb-1">
          Membership Card
        </h1>
        <p className="font-body-md text-[17px] text-on-surface-variant mb-6 font-medium">Manage details, active tiers & offline status.</p>
      </section>

      {/* Main loyalty and status lists */}
      <section className="space-y-6 pb-8">
        {/* Apple Style Metallic Gold Membership Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-gradient-to-br from-[#1c120c] via-[#2c1d11] to-[#0d0905] border border-amber-500/20 rounded-[32px] p-6 text-on-surface shadow-[0_12px_40px_rgba(0,0,0,0.8)] relative overflow-hidden group select-none"
        >
          <div className="relative z-10 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-amber-500/80 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">Night Owl Gold Member</span>
                <h3 className="text-xl font-bold mt-3 text-amber-100">{deliveryName || 'Walt & Carter'}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-lg font-bold">
                👑
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/60 block">Loyalty Balance</span>
                <p className="text-3xl font-extrabold text-white mt-1">1,450 <span className="text-xs text-amber-500 font-medium">pts</span></p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant block mb-1">Free sandbox claim</span>
                <button 
                  onClick={() => onRedeemReward('Redeem Wagyu Sando')}
                  className="text-sm font-semibold text-amber-500 hover:text-amber-400 mt-2 flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0 cursor-pointer font-sans font-bold"
                >
                  Redeem Sando <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500 rounded-full blur-[100px] opacity-[0.06] group-hover:scale-110 transition-transform duration-700" />
        </motion.div>

        {/* Profile settings & Address detail list */}
        <div className="bg-[#0a0a0a] rounded-[28px] border border-white/[0.06] p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold border-b border-white/[0.04] pb-3 mb-2">Delivery Credentials</h3>
          
          {/* Name field */}
          <div className="flex justify-between items-center py-1">
            <div className="w-full">
              <p className="text-xs text-on-surface-variant">Recipient Name</p>
              <input 
                type="text" 
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                placeholder="Recipient Name"
                className="text-sm font-bold text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/20 px-1 py-1 rounded mt-1 w-full border-b border-white/5 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Address field */}
          <div className="flex justify-between items-center py-1 border-t border-white/[0.04] pt-3">
            <div className="w-full">
              <p className="text-xs text-on-surface-variant">Primary Address</p>
              <input 
                type="text" 
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery Address"
                className="text-sm font-bold text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/20 px-1 py-1 rounded mt-1 w-full border-b border-white/5 focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Driver Partner Promotion - Premium Glass Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className={`relative overflow-hidden border rounded-[32px] p-8 shadow-2xl group transition-all duration-500 ${
            role === 'driver_active' 
              ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20' 
              : 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-white/10'
          }`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Car size={80} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                role === 'driver_active' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-indigo-500/20 border-indigo-500/30'
              }`}>
                <ShieldCheck size={16} className={role === 'driver_active' ? 'text-emerald-400' : 'text-indigo-400'} />
              </div>
              <span className={`text-[10px] uppercase font-black tracking-widest ${
                role === 'driver_active' ? 'text-emerald-300' : 'text-indigo-300'
              }`}>
                {role === 'driver_active' ? 'Active Partner' : 'Fleet Opportunity'}
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 italic">
              {role === 'driver_active' ? 'Welcome Back, Captain' : 'Earn with Sweet News'}
            </h3>
            
            <p className="text-sm text-on-surface-variant max-w-[240px] leading-relaxed mb-6">
              {role === 'driver_active' 
                ? 'Your fleet terminal is active. Ready for your next high-yield delivery run?'
                : role === 'driver_pending'
                  ? 'Your application is under review by Admin HQ. We\'ll alert you once approved.'
                  : 'Join our elite delivery fleet and turn your late nights into high-yield earnings.'}
            </p>
            
            {role !== 'driver_pending' && (
              <button 
                onClick={() => {
                  if (role === 'driver_active') {
                    window.location.href = '/fleet';
                  } else {
                    setIsWaitlistOpen(true);
                  }
                }}
                className="px-6 py-3 bg-white text-black text-xs font-black rounded-full hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-xl"
              >
                {role === 'driver_active' ? 'Go to Fleet Terminal' : 'Join the Waitlist'}
              </button>
            )}

            {role === 'driver_pending' && (
              <div className="inline-block px-6 py-3 bg-white/5 border border-white/10 text-white/50 text-xs font-black rounded-full italic">
                Application Pending
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>

        <WaitlistModal 
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
        />

        {/* PWA Performance dashboard */}
        <div className="bg-[#0a0a0a] rounded-[28px] border border-white/[0.06] p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold border-b border-white/[0.04] pb-3 mb-2">PWA Engine Control</h3>
          
          {/* Push toggle */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bell size={14} />
              </div>
              <div>
                <p className="text-xs text-white font-bold">Push Notifications</p>
                <p className="text-[10px] text-on-surface-variant">Alert me when dispatch driver leaves kitchen.</p>
              </div>
            </div>
            <button 
              onClick={() => setPushNotifications(!pushNotifications)}
              aria-label="Toggle notifications"
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${pushNotifications ? 'bg-primary' : 'bg-white/10'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Offline sync status */}
          <div className="flex justify-between items-center py-1 border-t border-white/[0.04] pt-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOnline ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              </div>
              <div>
                <p className="text-xs text-white font-bold">Offline Service Worker Status</p>
                <p className="text-[10px] text-on-surface-variant">
                  {isOnline ? 'Fully connected. Assets cached on service-worker.' : 'Currently operating in sandbox cache offline mode.'}
                </p>
              </div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
          </div>
        </div>

        {/* Driver Partner Promotion - Premium Glass Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 rounded-[32px] p-8 shadow-2xl group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Car size={80} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <ShieldCheck size={16} className="text-indigo-400" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Fleet Opportunity</span>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 italic">Earn with Sweet News</h3>
            <p className="text-sm text-on-surface-variant max-w-[240px] leading-relaxed mb-6">
              Join our elite delivery fleet and turn your late nights into high-yield earnings.
            </p>
            
            <button 
              onClick={() => window.location.href = '/fleet'}
              className="px-6 py-3 bg-white text-black text-xs font-black rounded-full hover:bg-indigo-400 hover:text-white transition-all transform active:scale-95 shadow-xl"
            >
              Get Started
            </button>
          </div>
          
          {/* Subtle animated light sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>

        {/* Payment protection */}
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant py-4">
          <ShieldCheck size={14} className="text-emerald-500" /> Secure 256-Bit SSL Checkout Guard
        </div>
      </section>
    </motion.div>
  );
}

export default ProfileView;
