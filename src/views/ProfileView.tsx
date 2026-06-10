import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Bell, Wifi, WifiOff, ShieldCheck, Crown, Check, LogOut, Plus, MapPin, Pencil, Trash2, Star, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { requestPermissionAndGetToken } from '../lib/fcm';
import { useProfileStore } from '../store/profile';
import { useAuth } from '../context/AuthContext';
import { WaitlistModal } from '../components/organisms/WaitlistModal';
import { OwlMascot } from '../components/atoms/OwlMascot';
import { useState, useRef } from 'react';
import { Address } from '../types';

interface ProfileViewProps {
  isOnline: boolean;
}

export function ProfileView({ isOnline }: ProfileViewProps) {
  const { user, role, login, logout, loginError } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  // Address management state
  const savedAddresses = useProfileStore((state) => state.savedAddresses);
  const addAddress = useProfileStore((state) => state.addAddress);
  const updateAddress = useProfileStore((state) => state.updateAddress);
  const removeAddress = useProfileStore((state) => state.removeAddress);
  const setDefaultAddress = useProfileStore((state) => state.setDefaultAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({ label: '', street: '', apt: '', city: '', state: '', zip: '' });

  const deliveryName = useProfileStore((state) => state.deliveryName);
  const pushNotifications = useProfileStore((state) => state.pushNotificationsEnabled);

  const setDeliveryName = useProfileStore((state) => state.setDeliveryName);
  const setPushNotifications = useProfileStore((state) => state.setPushNotificationsEnabled);

  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameChange = (val: string) => {
    setDeliveryName(val);
    setNameSaved(false);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => setNameSaved(true), 1000);
  };

  const openAddressForm = (address?: Address) => {
    if (address) {
      setEditingAddress(address.id);
      setAddressForm({ label: address.label, street: address.street, apt: address.apt ?? '', city: address.city, state: address.state, zip: address.zip });
    } else {
      setEditingAddress(null);
      setAddressForm({ label: '', street: '', apt: '', city: '', state: '', zip: '' });
    }
    setShowAddressForm(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.label.trim() || !addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.zip.trim()) return;
    if (editingAddress) {
      updateAddress(editingAddress, addressForm);
    } else {
      addAddress({ ...addressForm, isDefault: savedAddresses.length === 0 });
    }
    setShowAddressForm(false);
    setEditingAddress(null);
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

        <h2 className="text-[28px] font-black uppercase tracking-tighter text-on-background leading-tight mb-2">
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
        <p className="text-[12px] text-on-surface-variant font-medium mb-10 leading-relaxed max-w-[240px]">
          Save your address, track orders in real time, and unlock member rewards.
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={login}
          className="flex items-center gap-3 bg-surface text-on-background font-black text-[13px] px-6 py-4 rounded-full border border-on-background/[0.09] shadow-[0_8px_32px_rgba(42,26,31,0.10)] hover:bg-surface-container transition-colors w-full max-w-[280px] justify-center"
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

        {loginError && (
          <p className="text-[11px] text-red-600 mt-4 max-w-[280px] text-center leading-relaxed px-2">
            {loginError}
          </p>
        )}

        <p className="text-[10px] text-on-background/30 mt-6 leading-relaxed max-w-[260px]">
          By signing in you agree to our{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant underline hover:text-on-background transition-colors">
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
          className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-3 text-on-background"
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
          <span className="text-on-surface-variant">CARD.</span>
        </motion.h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-on-surface-variant font-black">
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
        <div className="glass-panel rounded-[28px] p-6 space-y-4 shadow-[0_8px_32px_rgba(42,26,31,0.10)]">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant border-b border-on-background/[0.07] pb-3">
            Delivery Protocol
          </h3>

          {/* Name field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">
                Recipient Name
              </p>
              <AnimatePresence>
                {nameSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, x: 8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="flex items-center gap-1 text-emerald-600"
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
              className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] hover:border-on-background/[0.12] focus:border-[#e60023]/40 focus:bg-on-background/[0.05] outline-none px-4 py-3 rounded-2xl mt-0.5 transition-all duration-200 placeholder:text-on-surface-variant tracking-wide"
            />
          </div>

          {/* Saved Addresses */}
          <div className="pt-2 border-t border-on-background/[0.07]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">
                Saved Addresses
              </p>
              <button
                onClick={() => openAddressForm()}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary hover:text-primary/70 transition-colors"
              >
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                Add
              </button>
            </div>

            {/* Address list */}
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-on-background/[0.05] border border-on-background/[0.07] group"
                >
                  <div className="w-7 h-7 rounded-full bg-on-background/[0.05] border border-on-background/[0.09] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-on-background truncate">
                        {addr.label}
                      </p>
                      <p className="text-[9px] text-on-surface-variant truncate">
                        {addr.street}{addr.apt ? `, ${addr.apt}` : ''}
                      </p>
                    </div>
                    <p className="text-[9px] text-on-surface-variant truncate">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        aria-label="Set as default"
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-on-background/[0.07] transition-colors"
                      >
                        <Star className="w-3 h-3 text-on-surface-variant hover:text-amber-500" strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      onClick={() => openAddressForm(addr)}
                      aria-label="Edit address"
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-on-background/[0.07] transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-on-surface-variant" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => removeAddress(addr.id)}
                      aria-label="Remove address"
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-600/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" strokeWidth={1.5} />
                    </button>
                  </div>
                  {addr.isDefault && (
                    <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-500" strokeWidth={1.5} />
                      <span className="text-[8px] font-black uppercase tracking-wider">Default</span>
                    </div>
                  )}
                </div>
              ))}
              {savedAddresses.length === 0 && (
                <div className="text-center py-4 px-3 rounded-2xl bg-on-background/[0.03] border border-dashed border-on-background/[0.07]">
                  <MapPin className="w-5 h-5 text-on-surface-variant mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    No saved addresses yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Fleet Partner Card ──────────────────────────────── */}
        <div className="glass-panel rounded-[28px] p-6 shadow-[0_8px_32px_rgba(42,26,31,0.10)]">
          <h3 className="text-lg font-black text-on-background tracking-tight mb-1.5">
            {role === 'driver_active'
              ? 'Fleet Terminal'
              : role === 'driver_pending'
              ? 'Application Pending'
              : 'Drive for Sweet News'}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-on-background text-background hover:bg-on-background/90 transition-colors text-[13px] font-bold rounded-full"
            >
              {role === 'driver_active' ? 'Open terminal' : 'Join waitlist'}
              <ChevronRight size={14} strokeWidth={2.5} />
            </motion.button>
          )}

          {role === 'driver_pending' && (
            <div className="inline-flex items-center gap-2 text-[11px] text-on-surface-variant font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Application under review
            </div>
          )}
        </div>

        <WaitlistModal
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
        />

        {/* ── PWA Telemetry ───────────────────────────────────── */}
        <div className="glass-panel rounded-[28px] p-6 space-y-4 shadow-[0_8px_32px_rgba(42,26,31,0.10)]">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant border-b border-on-background/[0.07] pb-3">
            PWA Sync Telemetry
          </h3>

          {/* Push notifications toggle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-on-background/[0.05] border border-on-background/[0.09] flex items-center justify-center text-on-background">
                  <Bell size={15} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] text-on-background font-black uppercase tracking-wider">
                    Push Notifications
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Real-time dispatch alerts.</p>
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
                    : 'bg-on-background/[0.12]'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                  className={`w-5 h-5 rounded-full shadow-md ${
                    pushNotifications ? 'bg-white translate-x-6' : 'bg-surface translate-x-0'
                  } transition-transform duration-300`}
                />
              </motion.button>
            </div>
            {pushError && (
              <p className="text-[10px] text-red-600 pl-12 leading-relaxed">{pushError}</p>
            )}
          </div>

          {/* Online / Offline status */}
          <div className="flex justify-between items-center py-1 border-t border-on-background/[0.07] pt-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                  isOnline
                    ? 'bg-on-background/[0.05] border-on-background/[0.09] text-on-background'
                    : 'bg-on-background/[0.03] border-on-background/[0.07] text-on-surface-variant'
                }`}
              >
                {isOnline
                  ? <Wifi size={15} strokeWidth={1.5} />
                  : <WifiOff size={15} strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-[12px] text-on-background font-black uppercase tracking-wider">
                  Asset Cache State
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium">
                  {isOnline
                    ? 'Fully synchronized — SW cache active.'
                    : 'Offline sandbox vault engaged.'}
                </p>
              </div>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                  : 'bg-on-background/[0.12]'
              }`}
            />
          </div>
        </div>

        {/* ── Account ─────────────────────────────────────────── */}
        <div className="glass-panel rounded-[28px] px-6 py-5 flex items-center justify-between shadow-[0_8px_32px_rgba(42,26,31,0.10)]">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-on-background/[0.07]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-on-background/[0.05] border border-on-background/[0.07] flex items-center justify-center text-on-background text-sm font-black">
                {(user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[12px] font-black text-on-background leading-tight truncate max-w-[180px]">
                {user.displayName ?? 'Member'}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate max-w-[180px]">{user.email}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={logout}
            aria-label="Sign out"
            className="w-9 h-9 rounded-full bg-on-background/[0.05] border border-on-background/[0.07] flex items-center justify-center hover:bg-on-background/[0.07] transition-colors"
          >
            <LogOut size={14} className="text-on-surface-variant" strokeWidth={2} />
          </motion.button>
        </div>

        {/* Footer trust line */}
        <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-[0.25em] text-on-background/30 py-4">
          <ShieldCheck size={11} className="text-on-surface-variant" />
          Secure 256-Bit SSL Protocol Guard
        </div>

      </section>

      {/* ── Address Form Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showAddressForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[91] flex items-end justify-center pointer-events-none">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                className="pointer-events-auto w-full max-w-[430px] bg-surface backdrop-blur-[50px] rounded-t-[32px] p-6 border-t border-on-background/[0.09] max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-center pt-0 pb-4">
                  <div className="w-10 h-1 bg-on-background/[0.15] rounded-full" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-black uppercase tracking-tight text-on-background">
                    {editingAddress ? 'Edit Address' : 'New Address'}
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="w-8 h-8 rounded-full bg-on-background/[0.05] flex items-center justify-center hover:bg-on-background/[0.07] transition-colors"
                  >
                    <X className="w-4 h-4 text-on-surface-variant" strokeWidth={2} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">
                      Label
                    </p>
                    <input
                      value={addressForm.label}
                      onChange={(e) => setAddressForm(f => ({ ...f, label: e.target.value }))}
                      placeholder="e.g. Home, Work"
                      className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] outline-none px-4 py-3 rounded-2xl transition-all duration-200 placeholder:text-on-surface-variant tracking-wide focus:border-primary/40"
                    />
                  </div>
                  <div>
                    <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">
                      Street Address
                    </p>
                    <input
                      value={addressForm.street}
                      onChange={(e) => setAddressForm(f => ({ ...f, street: e.target.value }))}
                      placeholder="123 Midnight Ave"
                      className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] outline-none px-4 py-3 rounded-2xl transition-all duration-200 placeholder:text-on-surface-variant tracking-wide focus:border-primary/40"
                    />
                  </div>
                  <div>
                    <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">
                      Apt / Suite (optional)
                    </p>
                    <input
                      value={addressForm.apt}
                      onChange={(e) => setAddressForm(f => ({ ...f, apt: e.target.value }))}
                      placeholder="Apt 4B"
                      className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] outline-none px-4 py-3 rounded-2xl transition-all duration-200 placeholder:text-on-surface-variant tracking-wide focus:border-primary/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">
                        City
                      </p>
                      <input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="City"
                        className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] outline-none px-4 py-3 rounded-2xl transition-all duration-200 placeholder:text-on-surface-variant tracking-wide focus:border-primary/40"
                      />
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">
                        State
                      </p>
                      <input
                        value={addressForm.state}
                        onChange={(e) => setAddressForm(f => ({ ...f, state: e.target.value }))}
                        placeholder="State"
                        className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] outline-none px-4 py-3 rounded-2xl transition-all duration-200 placeholder:text-on-surface-variant tracking-wide focus:border-primary/40"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-1">
                      ZIP Code
                    </p>
                    <input
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm(f => ({ ...f, zip: e.target.value }))}
                      placeholder="10001"
                      inputMode="numeric"
                      className="w-full text-sm font-bold text-on-background bg-on-background/[0.05] border border-on-background/[0.07] outline-none px-4 py-3 rounded-2xl transition-all duration-200 placeholder:text-on-surface-variant tracking-wide focus:border-primary/40"
                    />
                  </div>

                  <button
                    onClick={handleSaveAddress}
                    className="w-full mt-4 py-4 btn-brand text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {editingAddress ? 'Save Changes' : 'Add Address'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProfileView;
