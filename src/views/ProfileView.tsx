import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Bell, Wifi, WifiOff, ShieldCheck, Crown, Check, LogOut } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { requestPermissionAndGetToken } from '../lib/fcm';
import { useProfileStore } from '../store/profile';
import { useAuth } from '../context/AuthContext';
import { WaitlistModal } from '../components/organisms/WaitlistModal';
import { OwlMascot } from '../components/atoms/OwlMascot';
import { useState, useRef } from 'react';

interface ProfileViewProps {
  isOnline: boolean;
}

export function ProfileView({ isOnline }: ProfileViewProps) {
  const { user, role, login, logout } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

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

  const handlePushToggle = async () => {
    setPushError(null);
    if (pushNotifications) {
      setPushNotifications(false);
      return;
    }
    setPushLoading(true);
    const token = await requestPermissionAndGetToken();
    setPushLoading(false);
    if (!token) {
      setPushError('Permission denied or not supported. Enable notifications in browser settings.');
      return;
    }
    setPushNotifications(true);
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { fcmToken: token }).catch(() => {});
    }
  };

  /* ── Signed-out screen ──────────────────────────────────────── */
  if (!user) {
    return (
      <motion.div
        key="profile-signed-out"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-4 min-h-[70vh] px-2 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="mb-8"
        >
          <OwlMascot size={90} />
        </motion.div>

        <h2 className="text-[28px] font-black uppercase tracking-tighter text-white leading-tight mb-2">
          Sign in to
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#e60023,#ff2060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Sweet News
          </span>
        </h2>
        <p className="text-[12px] text-white/35 font-medium mb-10 leading-relaxed max-w-[240px]">
          Save your address, track orders in real time, and unlock member rewards.
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={login}
          className="flex items-center gap-3 bg-white text-black font-black text-[13px] px-6 py-4 rounded-full shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:bg-white/90 transition-colors w-full max-w-[280px] justify-center"
        >
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        <p className="text-[10px] text-white/20 mt-6 leading-relaxed max-w-[260px]">
          By signing in you agree to our{' '}
          <a href="/privacy" className="text-white/35 underline hover:text-white/60 transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </motion.div>
    );
  }

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
                  {deliveryName || user.displayName?.split(' ')[0] || 'Night Owl'}
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
        <div className="glass-panel rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-black text-white tracking-tight mb-1.5">
            {role === 'driver_active'
              ? 'Fleet Terminal'
              : role === 'driver_pending'
              ? 'Application Pending'
              : 'Drive for Sweet News'}
          </h3>
          <p className="text-sm text-white/55 leading-relaxed mb-5">
            {role === 'driver_active'
              ? 'Your fleet terminal is active. Open it to view active deliveries.'
              : role === 'driver_pending'
              ? "We'll email you when a slot opens in your city."
              : 'Deliver in your city on your schedule. Apply in 30 seconds.'}
          </p>

          {role !== 'driver_pending' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (role === 'driver_active') {
                  window.location.href = '/fleet';
                } else {
                  setIsWaitlistOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black hover:bg-white/90 transition-colors text-[13px] font-bold rounded-full"
            >
              {role === 'driver_active' ? 'Open terminal' : 'Join waitlist'}
              <ChevronRight size={14} strokeWidth={2.5} />
            </motion.button>
          )}

          {role === 'driver_pending' && (
            <div className="inline-flex items-center gap-2 text-[11px] text-white/50 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Application under review
            </div>
          )}
        </div>

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
          <div className="space-y-2">
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
                onClick={handlePushToggle}
                disabled={pushLoading}
                aria-label="Toggle push notifications"
                className={`relative w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
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
            {pushError && (
              <p className="text-[10px] text-red-400 pl-12 leading-relaxed">{pushError}</p>
            )}
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

        {/* ── Account ─────────────────────────────────────────── */}
        <div className="glass-panel rounded-[28px] px-6 py-5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white text-sm font-black">
                {(user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[12px] font-black text-white leading-tight truncate max-w-[180px]">
                {user.displayName ?? 'Member'}
              </p>
              <p className="text-[10px] text-white/35 truncate max-w-[180px]">{user.email}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={logout}
            aria-label="Sign out"
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <LogOut size={14} className="text-white/40" strokeWidth={2} />
          </motion.button>
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
