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
      className="mt-4 min-h-[70vh] px-2"
    >
      <section className="mb-10">
        <h1 className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <span style={{ background: 'linear-gradient(135deg,#e60023,#ff2060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MEMBER</span><br/>
          <span className="text-white/30">CARD.</span>
        </h1>
        <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 font-black">Active Tiers, Identity, & Sync Telemetry</p>
      </section>

      {/* Main loyalty and status lists */}
      <section className="space-y-6 pb-8">
        {/* Apple Style Translucent Monolithic Membership Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="backdrop-blur-3xl border border-[#e60023]/20 rounded-[32px] p-6 text-white relative overflow-hidden group select-none shadow-[0_20px_60px_rgba(230,0,35,0.15)]"
          style={{ background: 'linear-gradient(135deg, #150004 0%, #0a0002 60%, #000 100%)' }}
        >
          <div className="relative z-10 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/[0.08]">VIP NIGHT OWL MEMBER</span>
                <h3 className="text-xl font-black mt-3 uppercase tracking-wide text-white">{deliveryName || 'Walt & Carter'}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-white text-sm font-bold">
                👑
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[8px] uppercase font-black tracking-[0.2em] text-white/40 block">Loyalty Balance</span>
                <p className="text-3xl font-black text-white mt-1">1,450 <span className="text-[10px] text-white/50 font-medium tracking-widest uppercase ml-1">pts</span></p>
              </div>
              <div>
                <button
                  onClick={() => onRedeemReward('Redeem Wagyu Sando')}
                  className="px-4 py-2 btn-brand text-[9px] font-black uppercase tracking-[0.2em] rounded-full transition-all flex items-center gap-1 cursor-pointer"
                >
                  Redeem Reward <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full blur-[120px] opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700" style={{ background: 'radial-gradient(circle, #ff2060, #e60023)' }} />
        </motion.div>

        {/* Profile settings & Address detail list */}
        <div className="bg-white/[0.01] rounded-[28px] border border-white/[0.05] p-6 space-y-4 shadow-xl">
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 border-b border-white/[0.04] pb-3 mb-2">Delivery Protocol</h3>
          
          {/* Name field */}
          <div className="flex justify-between items-center py-1">
            <div className="w-full">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Recipient Name</p>
              <input 
                type="text" 
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                placeholder="Recipient Name"
                className="text-sm font-black text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-white/10 px-1 py-1.5 rounded mt-1 w-full border-b border-white/5 focus:border-white/20 uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Address field */}
          <div className="flex justify-between items-center py-1 border-t border-white/[0.04] pt-3">
            <div className="w-full">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Primary Address</p>
              <input 
                type="text" 
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery Address"
                className="text-sm font-black text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-white/10 px-1 py-1.5 rounded mt-1 w-full border-b border-white/5 focus:border-white/20 uppercase tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Driver Partner Promotion - Premium Glass Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden border rounded-[32px] p-8 shadow-2xl group transition-all duration-500 bg-white/[0.01] border-white/10"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car size={80} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center border bg-white/5 border-white/10">
                <ShieldCheck size={14} className="text-white/60" />
              </div>
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/60">
                {role === 'driver_active' ? 'Active Partner' : 'Fleet Protocol'}
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              {role === 'driver_active' ? 'Courier Dispatch' : 'Earn with Sweet News'}
            </h3>
            
            <p className="text-xs text-white/40 max-w-[240px] leading-relaxed mb-6 font-medium">
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
                className="px-6 py-3 btn-brand text-[10px] font-black uppercase tracking-widest rounded-full transition-all transform active:scale-95"
              >
                {role === 'driver_active' ? 'Fleet Terminal' : 'Join Fleet Waitlist'}
              </button>
            )}

            {role === 'driver_pending' && (
              <div className="inline-block px-6 py-3 bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase font-black tracking-widest rounded-full">
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
        <div className="bg-white/[0.01] rounded-[28px] border border-white/[0.05] p-6 space-y-4 shadow-xl">
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 border-b border-white/[0.04] pb-3 mb-2">PWA Sync Telemetry</h3>
          
          {/* Push toggle */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Bell size={14} />
              </div>
              <div>
                <p className="text-xs text-white font-black uppercase tracking-wider">Push Notifications</p>
                <p className="text-[10px] text-white/40 font-medium">Real-time dispatch alert protocol.</p>
              </div>
            </div>
            <button 
              onClick={() => setPushNotifications(!pushNotifications)}
              aria-label="Toggle notifications"
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${pushNotifications ? 'bg-white' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${pushNotifications ? 'translate-x-6 bg-black' : 'translate-x-0 bg-white'}`} />
            </button>
          </div>

          {/* Offline sync status */}
          <div className="flex justify-between items-center py-1 border-t border-white/[0.04] pt-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOnline ? 'bg-white/5 border border-white/10 text-white' : 'bg-white/5 border border-white/5 text-white/40'}`}>
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              </div>
              <div>
                <p className="text-xs text-white font-black uppercase tracking-wider">Asset Cache State</p>
                <p className="text-[10px] text-white/40 font-medium">
                  {isOnline ? 'Fully synchronized. Assets cached on worker.' : 'Operating on offline sandbox cached vault.'}
                </p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/20'}`} />
          </div>
        </div>

        {/* Payment protection */}
        <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-[0.25em] text-white/40 py-4">
          <ShieldCheck size={12} className="text-white/60" /> Secure 256-Bit SSL Protocol Guard
        </div>

      </section>
    </motion.div>
  );
}

export default ProfileView;
