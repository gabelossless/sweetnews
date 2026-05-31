import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginError: string | null;
  isAdmin: boolean;
  isDriver: boolean;
  isDriverPending: boolean;
  role: UserRole | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginError: null,
  isAdmin: false,
  isDriver: false,
  isDriverPending: false,
  role: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Detect iOS standalone (PWA installed to home screen) — popups are blocked there.
const isIOSStandalone =
  typeof window !== 'undefined' &&
  ('standalone' in window.navigator
    ? (window.navigator as Record<string, unknown>).standalone === true
    : window.matchMedia('(display-mode: standalone)').matches &&
      /iphone|ipad|ipod/i.test(window.navigator.userAgent));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      if (isIOSStandalone) {
        // Popup is blocked on iOS PWA — use redirect flow instead.
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error('Login failed:', error);
      const code = (error as { code?: string }).code ?? '';
      if (code === 'auth/unauthorized-domain') {
        setLoginError('This domain is not authorized in Firebase. Add it to Authorized Domains in Firebase Console.');
      } else if (code === 'auth/popup-blocked') {
        setLoginError('Popup was blocked. Please allow popups for this site and try again.');
      } else if (code === 'auth/popup-closed-by-user') {
        // User dismissed — not an error
      } else {
        setLoginError('Sign-in failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    // Pick up any pending redirect result (iOS standalone sign-in flow).
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'customer',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    profile,
    loading,
    loginError,
    isAdmin: profile?.role === 'admin',
    isDriver: profile?.role === 'driver_active',
    isDriverPending: profile?.role === 'driver_pending',
    role: profile?.role || null,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-background" aria-hidden />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
