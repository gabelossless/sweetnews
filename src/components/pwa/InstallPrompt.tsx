import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDown, Share, ChevronRight } from 'lucide-react';
import { Logo } from '../atoms/Logo';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'sn-install-dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    if (standalone) return;

    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (ios) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    dismiss();
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShowPrompt(false);
    setShowIOSSteps(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed bottom-[110px] left-4 right-4 z-[90] md:max-w-sm md:mx-auto md:left-1/2 md:-translate-x-1/2"
        >
          <div className="bg-[#0c0c0c] border border-white/[0.09] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Main row */}
            <div className="flex gap-3 items-center p-4">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                <Logo size={44} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-white uppercase tracking-wider leading-none">
                  Install Sweet News
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">
                  {isIOS ? 'Add to Home Screen for the best experience' : 'Get instant delivery notifications'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isIOS ? (
                  <button
                    onClick={() => setShowIOSSteps((v) => !v)}
                    className="h-8 px-3 rounded-full btn-brand text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                  >
                    How <ChevronRight size={11} className={`transition-transform ${showIOSSteps ? 'rotate-90' : ''}`} />
                  </button>
                ) : (
                  <button
                    onClick={handleInstall}
                    className="h-8 px-3 rounded-full btn-brand text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                  >
                    <ArrowDown size={11} /> Add
                  </button>
                )}
                <button
                  onClick={dismiss}
                  aria-label="Dismiss"
                  className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* iOS step-by-step guide */}
            <AnimatePresence>
              {isIOS && showIOSSteps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/[0.06] px-4 py-3 space-y-2.5">
                    {[
                      { icon: <Share size={13} />, text: 'Tap the Share button in Safari' },
                      { icon: <span className="text-[11px] font-black">+</span>, text: 'Scroll down and tap "Add to Home Screen"' },
                      { icon: <span className="text-[11px] font-black">✓</span>, text: 'Tap "Add" to confirm' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/[0.07] border border-white/[0.08] flex items-center justify-center text-white/60 flex-shrink-0">
                          {step.icon}
                        </div>
                        <p className="text-[11px] text-white/60 font-medium">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
