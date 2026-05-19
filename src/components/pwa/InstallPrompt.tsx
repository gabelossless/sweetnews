import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share, X, ArrowDown } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = 
      /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as any).MSStream;
    
    // Check if already in standalone display mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone;

    setIsIOS(isIosDevice);

    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show banner after a short delay so it doesn't interrupt immediate first-loads
      setTimeout(() => setShowPrompt(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS devices, since beforeinstallprompt is not supported, we show the custom iOS guide
    if (isIosDevice) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-[110px] left-4 right-4 z-[90] bg-[#0a0a0a]/90 backdrop-blur-md rounded-2xl border border-white/[0.08] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex gap-4 items-center justify-between md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 md:bottom-28"
        >
          <div className="flex-1 flex gap-3 items-center min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
              🍩
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Install Sweet News</h4>
              <p className="text-[10px] text-white/40 truncate mt-0.5 font-medium">
                {isIOS ? 'Add to Home Screen for order tracking' : 'Get instant delivery notifications'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isIOS ? (
              <button 
                onClick={() => {
                  alert("To install, tap the Share icon at the bottom of your Safari browser, then choose 'Add to Home Screen'!");
                  setShowPrompt(false);
                }}
                className="h-8 px-4 rounded-full bg-white text-black font-black uppercase tracking-wider text-[10px] transition-colors flex items-center gap-1.5 hover:bg-white/90 cursor-pointer"
              >
                <Share size={12} /> Steps
              </button>
            ) : (
              <button 
                onClick={handleInstallClick}
                className="h-8 px-4 rounded-full bg-white text-black font-black uppercase tracking-wider text-[10px] transition-colors flex items-center gap-1 hover:bg-white/90 cursor-pointer"
              >
                <ArrowDown size={12} /> Install
              </button>
            )}
            
            <button 
              onClick={handleDismiss}
              aria-label="Dismiss prompt"
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
