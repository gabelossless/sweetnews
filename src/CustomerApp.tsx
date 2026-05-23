import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Store, ReceiptText, User, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { useCartStore } from './store/cart';
import { useProfileStore } from './store/profile';
import { useOrdersStore } from './store/orders';
import { useToastStore } from './store/toast';
import { useIsStandalone } from './hooks/useIsStandalone';
import { useGeolocation } from './hooks/useGeolocation';
import { useAuth } from './context/AuthContext';
import { Product } from './types';
import { createOrder, subscribeToCustomerOrders } from './lib/orders';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

// Components
import { NavButton } from './components/molecules/NavButton';
import { CartSheet } from './components/organisms/CartSheet';
import { CheckoutForm } from './components/organisms/CheckoutForm';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { Logo } from './components/atoms/Logo';

// Views
import { ShopView } from './views/ShopView';
import { SearchView } from './views/SearchView';
import { OrdersView } from './views/OrdersView';
import { ProfileView } from './views/ProfileView';

export default function CustomerApp() {
  useGeolocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'shop' | 'search' | 'orders' | 'profile'>('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Standalone mode layout adjustment helper
  const isStandalone = useIsStandalone();

  // Profile fields & Offline state syncing
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Cart Store variables
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Orders Store variables
  const orders = useOrdersStore((state) => state.orders);
  // Sync Orders from Firestore
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToCustomerOrders(user.uid, (freshOrders) => {
      useOrdersStore.setState({ orders: freshOrders });
    });

    return () => unsubscribe();
  }, [user]);

  // Toast Store variables
  const toastMessage = useToastStore((state) => state.toastMessage);
  const showToast = useToastStore((state) => state.showToast);

  // Sync Online/Offline State
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePlaceOrder = async (details: { name: string; address: string; paymentMethodId?: string }) => {
    if (!user) {
      showToast('Please sign in to place an order');
      return;
    }

    setIsProcessing(true);
    
    // Auto sync back to profile store
    useProfileStore.getState().setDeliveryName(details.name);
    useProfileStore.getState().setDeliveryAddress(details.address);

    try {
      await createOrder({
        customerId: user.uid,
        customerName: details.name,
        items: [...cartItems],
        total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + 3.99,
        date: new Date().toLocaleDateString(),
        address: details.address,
        paymentMethodId: details.paymentMethodId,
      });

      setIsProcessing(false);
      setIsOrderPlaced(true);
      clearCart();
      
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsOrderPlaced(false);
        setActiveTab('orders');
      }, 1500);
    } catch (error) {
      console.error('Order placement failed:', error);
      showToast('Order failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCheckoutTrigger = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setIsOrderPlaced(false);
    }, 300);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    
    showToast(`Added ${product.name} to cart`);
  };

  return (
    <div className={`bg-background text-on-background min-h-screen pb-[120px] pt-[110px] sm:pt-[130px] font-body-md selection:bg-white selection:text-black overflow-x-hidden ${isStandalone ? 'standalone-layout' : ''}`}>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 pt-[max(env(safe-area-inset-top,54px),24px)] pb-6 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent z-50 md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2">
        <div className="flex items-center gap-3">
          {(() => {
            const initial =
              user?.displayName?.[0]?.toUpperCase() ??
              user?.email?.[0]?.toUpperCase() ??
              null;
            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('profile')}
                aria-label={user ? 'View member profile' : 'Sign in to your account'}
                className="w-12 h-12 rounded-full overflow-hidden border border-white/[0.08] shadow-sm cursor-pointer relative group bg-white/[0.04]"
              >
                {user?.photoURL ? (
                  <img
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    src={user.photoURL}
                  />
                ) : initial ? (
                  <div className="w-full h-full flex items-center justify-center text-white text-base font-black tracking-wide">
                    {initial}
                  </div>
                ) : (
                  <Logo size={48} className="w-full h-full" />
                )}
                {/* Connection status dot — green online, dim red offline */}
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                    isOnline
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                      : 'bg-white/15'
                  }`}
                />
              </motion.button>
            );
          })()}
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          aria-label="Sweet News — go to shop"
          className="text-[20px] font-headline-lg font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer select-none bg-transparent border-0 p-0"
        >
          SWEETNEWS
        </button>
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('search')}
            aria-label="Search delicacies"
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 shadow-sm border ${activeTab === 'search' ? 'btn-brand border-transparent shadow-[0_4px_20px_rgba(230,0,35,0.4)]' : 'bg-white/5 text-white hover:bg-white/10 border-white/[0.06]'}`}
          >
            <Search className="w-[22px] h-[22px]" strokeWidth={2.5} />
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsCartOpen(true)}
            aria-label="Open shopping cart"
            className="w-12 h-12 relative flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors duration-200 shadow-sm border border-white/[0.06] bg-white/5"
          >
            <motion.div
              key={cartItemsCount}
              initial={{ scale: 1.2, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={2.5} />
            </motion.div>
            <AnimatePresence>
              {cartItemsCount > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center font-label-bold text-[11px] shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
                >
                  <motion.span
                    key={cartItemsCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                  >
                    {cartItemsCount}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* Main Pages Container */}
      <main className="px-6 md:max-w-4xl md:mx-auto">
        <AnimatePresence mode="wait">
          
          {/* 1. SHOP VIEW */}
          {activeTab === 'shop' && (
            <ShopView
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onAddToCart={handleAddToCart}
              onNavigateToSearch={() => setActiveTab('search')}
            />
          )}

          {/* 2. SEARCH VIEW */}
          {activeTab === 'search' && (
            <SearchView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* 3. DEDICATED REAL-TIME ORDERS VIEW */}
          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onStartShopping={() => setActiveTab('shop')}
            />
          )}

          {/* 4. DEDICATED PROFILE VIEW */}
          {activeTab === 'profile' && (
            <ProfileView
              isOnline={isOnline}
            />
          )}

        </AnimatePresence>
      </main>

      {/* BottomNavBar Pill */}
      <nav className="fixed bottom-[calc(env(safe-area-inset-bottom,34px)+16px)] left-1/2 -translate-x-1/2 w-[90%] md:max-w-sm z-50 flex justify-around items-center px-4 py-3.5 bg-[#050505]/70 backdrop-blur-3xl rounded-[32px] border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.8),_inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300">
        <NavButton 
          icon={<Store />} 
          label="Shop" 
          isActive={activeTab === 'shop'} 
          onClick={() => setActiveTab('shop')} 
        />
        <NavButton 
          icon={<Search />} 
          label="Search" 
          isActive={activeTab === 'search'} 
          onClick={() => setActiveTab('search')} 
        />
        <NavButton 
          icon={<ReceiptText />} 
          label="Orders" 
          isActive={activeTab === 'orders'} 
          onClick={() => setActiveTab('orders')} 
        />
        <NavButton 
          icon={<User />} 
          label="Profile" 
          isActive={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
      </nav>

      {/* Cart Bottom Sheet Overlay */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckoutTrigger}
      />

      {/* Checkout Modal Overlay */}
      <Elements stripe={stripePromise}>
        <CheckoutForm
          isOpen={isCheckoutOpen}
          onClose={closeCheckout}
          onPlaceOrder={handlePlaceOrder}
          isProcessing={isProcessing}
          isOrderPlaced={isOrderPlaced}
        />
      </Elements>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white text-black px-5 py-3.5 rounded-full shadow-2xl md:bottom-28 border border-white/10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
            <span className="font-label-bold text-[13px] font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt Banner */}
      <InstallPrompt />
    </div>
  );
}
