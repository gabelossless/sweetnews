import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Bell, Wifi, WifiOff, ShieldCheck, Car, Crown, Check } from 'lucide-react';
import { useProfileStore } from '../store/profile';
import { useAuth } from '../context/AuthContext';
import { WaitlistModal } from '../components/organisms/WaitlistModal';
import { useState, useRef } from 'react';

interface ProfileViewProps {
  isOnline: boolean;
}

export function ProfileView({ isOnline }: ProfileViewProps) {
  const { role } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);

  const deliveryName = useProfileStore((state) => state.deliveryName);
  const deliveryAddress = useProfileStore((state) => state.deliveryAddress);
  const pushNotifications = useProfileStore((state) => state.pushNotificationsEnabled);

  const setDeliveryName = useProfileStore((state) => state.setDeliveryName);
  const setDeliveryAddress = useProfileStore((state) => state.setDeliveryAddress);
  const setPushNotifications = useProfileStore((state) => state.setPushNotificationsEnabled);

  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameChange = (val: string) => {
    setDeliveryName(val);
    setNameSaved(false);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => setNameSaved(true), 1000);
  };

  const handleAddressChange = (val: string) => {
    setDeliveryAddress(val);
    setAddressSaved(false);
    if (addressTimer.current) clearTimeout(addressTimer.current);
    addressTimer.current = setTimeout(() => setAddressSaved(true), 1000);
  };

  return (
    <motion.div
      key="profile-tab"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-4 min-h-[70vh] px-2"
    >
      {/* Hero */}
      <section className="mb-10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-3 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
        >
          <span
            style={{
              background: 'linear-gradient(135deg,#e60023,#ff2060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MEMBER
          </span>
          <br />
          <span className="text-white/30">CARD.</span>
        </motion.h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-black">
          Identity · Tier · Sync Telemetry
        </p>
      </section>

      <section className="space-y-5 pb-8">

        {/* ── Membership Card ─────────────────────────────────── */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="relative rounded-[32px] p-6 text-white overflow-hidden group select-none
                     shadow-[0_24px_80px_rgba(230,0,35,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]
                     border border-[#e60023]/20"
          style={{ background: 'linear-gradient(135deg, #180005 0%, #0c0002 55%, #000 100%)' }}
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>

          {/* Big ambient orb */}
          <div
            className="absolute -right-12 -top-12 w-56 h-56 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, #ff2060, #e60023)' }}
          />

          <div className="relative z-10 flex flex-col justify-between h-48">
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black mb-1">
                  Sweet News Member
                </p>
                <h3 className="text-xl font-black uppercase tracking-wide text-white leading-tight">
                  {deliveryName || 'Night Owl'}
                </h3>
              </div>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 6 }}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e60023]/30 to-[#ff2060]/20 border border-[#e60023]/30 flex items-center justify-center shadow-[0_4px_16px_rgba(230,0,35,0.4)]"
              >
                <Crown className="w-5 h-5 text-[#ff8090]" strokeWidth={1.5} />
              </motion.div>
            </div>

            {/* Card number decorative row */}
            <div className="flex gap-3 items-center">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-1">
                  {[0, 1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="w-1 h-1 rounded-full bg-white/20"
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[8px] uppercase font-black tracking-[0.25em] text-white/30 block mb-1">
                  Loyalty Rewards
                </span>
                <p className="text-sm font-black text-white/25 tracking-widest uppercase">
                  Coming Soon
                </p>
              </div>
              <ChevronRight size={16} className="text-white/15" />
            </div>
          </div>
        </motion.div>

        {/* ── Delivery Protocol ───────────────────────────────── */}
        <div className="glass-panel rounded-[28px] p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35 border-b border-white/[0.04] pb-3">
            Delivery Protocol
          </h3>

          {/* Name field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">
                Recipient Name
              </p>
              <AnimatePresence>
                {nameSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, x: 8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="flex items-center gap-1 text-emerald-400"
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Saved</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="text"
              value={deliveryName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Your name"
              className="w-full text-sm font-bold text-white bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12] focus:border-[#e60023]/40 focus:bg-white/[0.06] outline-none px-4 py-3 rounded-2xl mt-0.5 transition-all duration-200 placeholder:text-white/20 tracking-wide"
            />
          </div>

          {/* Address field */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">
                Primary Address
              </p>
              <AnimatePresence>
                {addressSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, x: 8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="flex items-center gap-1 text-emerald-400"
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Saved</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="123 Midnight Ave"
              className="w-full text-sm font-bold text-white bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12] focus:border-[#e60023]/40 focus:bg-white/[0.06] outline-none px-4 py-3 rounded-2xl mt-0.5 transition-all duration-200 placeholder:text-white/20 tracking-wide"
            />
          </div>
        </div>

        {/* ── Fleet Partner Card ──────────────────────────────── */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden glass-panel rounded-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group transition-all duration-500"
        >
          {/* Big ghost car icon */}
          <div className="absolute top-0 right-0 p-7 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-500">
            <Car size={90} className="text-white" />
          </div>

          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-[32px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.1]">
                <ShieldCheck size={13} className="text-white/50" />
              </div>
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/50">
                {role === 'driver_active' ? 'Active Partner' : 'Fleet Protocol'}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              {role === 'driver_active' ? 'Courier Dispatch' : 'Earn with Sweet News'}
            </h3>
            <p className="text-[12px] text-white/35 max-w-[240px] leading-relaxed mb-6 font-medium">
              {role === 'driver_active'
                ? 'Your fleet terminal is active. Ready for your next high-yield delivery run?'
                : role === 'driver_pending'
                ? "Your application is under review by HQ. We'll alert you once approved."
                : 'Join our elite delivery fleet. Turn late nights into high-yield earnings.'}
            </p>

            {role !== 'driver_pending' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (role === 'driver_active') {
                    window.location.href = '/fleet';
                  } else {
                    setIsWaitlistOpen(true);
                  }
                }}
                className="px-6 py-3 btn-brand text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_6px_20px_rgba(230,0,35,0.4)] hover:shadow-[0_8px_28px_rgba(230,0,35,0.6)] transition-shadow"
              >
                {role === 'driver_active' ? 'Fleet Terminal' : 'Join Fleet Waitlist'}
              </motion.button>
            )}

            {role === 'driver_pending' && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.04] border border-white/[0.08] text-white/40 text-[10px] uppercase font-black tracking-widest rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-live-pulse" />
                Application Pending
              </div>
            )}
          </div>
        </motion.div>

        <WaitlistModal
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
        />

        {/* ── PWA Telemetry ───────────────────────────────────── */}
        <div className="glass-panel rounded-[28px] p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35 border-b border-white/[0.04] pb-3">
            PWA Sync Telemetry
          </h3>

          {/* Push notifications toggle */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                <Bell size={15} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[12px] text-white font-black uppercase tracking-wider">
                  Push Notifications
                </p>
                <p className="text-[10px] text-white/30 font-medium">Real-time dispatch alerts.</p>
              </div>
            </div>

            {/* Toggle */}
            <motion.button
              onClick={() => setPushNotifications(!pushNotifications)}
              aria-label="Toggle push notifications"
              className={`relative w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                pushNotifications
                  ? 'bg-gradient-to-r from-[#e60023] to-[#ff2060] shadow-[0_2px_12px_rgba(230,0,35,0.5)]'
                  : 'bg-white/10'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                className={`w-5 h-5 rounded-full shadow-md ${
                  pushNotifications ? 'bg-white translate-x-6' : 'bg-white/70 translate-x-0'
                } transition-transform duration-300`}
              />
            </motion.button>
          </div>

          {/* Online / Offline status */}
          <div className="flex justify-between items-center py-1 border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                  isOnline
                    ? 'bg-white/[0.04] border-white/[0.08] text-white'
                    : 'bg-white/[0.02] border-white/[0.04] text-white/30'
                }`}
              >
                {isOnline
                  ? <Wifi size={15} strokeWidth={1.5} />
                  : <WifiOff size={15} strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-[12px] text-white font-black uppercase tracking-wider">
                  Asset Cache State
                </p>
                <p className="text-[10px] text-white/30 font-medium">
                  {isOnline
                    ? 'Fully synchronized — SW cache active.'
                    : 'Offline sandbox vault engaged.'}
                </p>
              </div>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                  : 'bg-white/20'
              }`}
            />
          </div>
        </div>

        {/* Footer trust line */}
        <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-[0.25em] text-white/20 py-4">
          <ShieldCheck size={11} className="text-white/25" />
          Secure 256-Bit SSL Protocol Guard
        </div>

      </section>
    </motion.div>
  );
}

export default ProfileView;
