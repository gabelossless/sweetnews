import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { User, Star, Package, LogOut, Save } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';

interface DriverProfile {
  displayName: string;
  photoURL: string;
  averageRating: number;
  totalDeliveries: number;
}

export default function FleetProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DriverProfile>({
    displayName: user?.displayName ?? '',
    photoURL: '',
    averageRating: 0,
    totalDeliveries: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setProfile({
          displayName: (d.displayName as string | undefined) ?? user.displayName ?? '',
          photoURL: (d.photoURL as string | undefined) ?? '',
          averageRating: (d.averageRating as number | undefined) ?? 0,
          totalDeliveries: (d.totalDeliveries as number | undefined) ?? 0,
        });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 pt-8">
      <h1 className="text-3xl font-black tracking-tight mb-6">Profile</h1>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-8 p-5 rounded-[24px] bg-white/[0.03] border border-white/[0.06]">
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt="Driver"
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/30 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-amber-400/60" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-black text-lg truncate">{profile.displayName || 'Driver'}</p>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest truncate">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.05] text-center">
          <Star className="w-5 h-5 text-amber-400 mx-auto mb-2" fill="#f59e0b" />
          <p className="text-xl font-black">
            {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '—'}
          </p>
          <p className="text-[8px] uppercase tracking-widest text-white/30 font-black mt-0.5">
            Rating
          </p>
        </div>
        <div className="p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.05] text-center">
          <Package className="w-5 h-5 text-white/40 mx-auto mb-2" />
          <p className="text-xl font-black">{profile.totalDeliveries}</p>
          <p className="text-[8px] uppercase tracking-widest text-white/30 font-black mt-0.5">
            Deliveries
          </p>
        </div>
      </div>

      {/* Edit form */}
      <div className="space-y-4 mb-8">
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black px-1">
          Edit Profile
        </p>
        <Input
          label="Display Name"
          placeholder="Your full name"
          value={profile.displayName}
          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
        />
        <Input
          label="Photo URL"
          placeholder="https://... (optional)"
          value={profile.photoURL}
          onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
        />
        <Button
          onClick={handleSave}
          loading={saving}
          fullWidth
          className="h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-amber-400/30 text-amber-400 bg-amber-400/[0.07] hover:bg-amber-400/[0.15] transition-colors"
        >
          {saved ? '✓ Saved' : <><Save className="w-4 h-4 mr-2 inline" /> Save Changes</>}
        </Button>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut(auth)}
        className="flex items-center gap-2 mx-auto text-white/30 hover:text-white/70 transition-colors text-[11px] font-black uppercase tracking-widest py-3"
      >
        <LogOut size={14} /> Sign Out
      </button>
    </div>
  );
}
