import React, { useState, useEffect } from 'react';
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
import { useDeliveryHours } from './hooks/useDeliveryHours';
import { useAuth } from './context/AuthContext';
import { Product } from './types';
import { createOrder, subscribeToCustomerOrders } from './lib/orders';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

// Components
import { NavButton } from './components/molecules/NavButton';
import { CartSheet } from './components/organisms/CartSheet';
import { CheckoutForm } from './components/organisms/CheckoutForm';
import { CustomizationSheet } from './components/organisms/CustomizationSheet';
import { ProductDetailSheet } from './components/organisms/ProductDetailSheet';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OwlMascot } from './components/atoms/OwlMascot';

// Views
import { ShopView } from './views/ShopView';
import { SearchView } from './views/SearchView';
import { OrdersView } from './views/OrdersView';
import { ProfileView } from './views/ProfileView';
import { AboutView } from './views/AboutView';

export default function CustomerApp() {
  useGeolocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'shop' | 'search' | 'orders' | 'profile' | 'news'>('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Standalone mode layout adjustment helper
  const isStandalone = useIsStandalone();
  const { isOpen: isDeliveryOpen, opensAt } = useDeliveryHours();

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

  const handlePlaceOrder = async (details: { name: string; address: string; phone: string; paymentIntentId: string }) => {
    if (!user) {
      showToast('Please sign in to place an order');
      return;
    }

    setIsProcessing(true);

    useProfileStore.getState().setDeliveryName(details.name);
    useProfileStore.getState().setDeliveryAddress(details.address);
    useProfileStore.getState().setDeliveryPhone(details.phone);

    const orderItems = [...cartItems];
    const total = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + 3.99;

    try {
      const orderId = await createOrder({
        customerId: user.uid,
        customerName: details.name,
        items: orderItems,
        total,
        date: new Date().toLocaleDateString(),
        address: details.address,
        phone: details.phone,
        paymentIntentId: details.paymentIntentId,
      });

      // Fire-and-forget notifications (does not block checkout success)
      fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: details.name,
          address: details.address,
          phone: details.phone,
          items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total,
          customerEmail: user.email ?? undefined,
        }),
      }).catch(() => {});

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
    if (!user) {
      showToast('Sign in to place an order');
      setIsCartOpen(false);
      setActiveTab('profile');
      return;
    }
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
    if (product.customizationMatrix?.length) {
      setCustomizingProduct(product);
      return;
    }
    const isNew = !cartItems.some((i) => i.id === product.id);
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    if (isNew) showToast(`Added to cart`);
  };

  const handleCustomizationConfirm = (result: { label: string; upcharge: number }) => {
    if (!customizingProduct) return;
    addItem({
      id: customizingProduct.id,
      name: customizingProduct.name,
      price: customizingProduct.price + result.upcharge,
      image: customizingProduct.image,
      customizations: result,
    });
    showToast(`Added to cart`);
    setCustomizingProduct(null);
  };

  const handleAddFromDetail = (product: Product) => {
    const isNew = !cartItems.some((i) => i.id === product.id);
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    if (isNew) showToast('Added to cart');
  };

  const handleCustomizeFromDetail = (product: Product) => {
    setSelectedProduct(null);
    setCustomizingProduct(product);
  };

  return (
    <div className={`bg-background text-on-background min-h-screen pb-[120px] md:pb-12 pt-[128px] md:pt-[82px] font-body-md selection:bg-white selection:text-black overflow-x-hidden ${isStandalone ? 'standalone-layout' : ''}`}>

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-on-background/[0.07]">
        <div className="px-5 md:px-8 pt-[max(env(safe-area-inset-top),12px)] md:max-w-[1280px] md:mx-auto">
          {/* Row 1: Brand + [Desktop Nav] + Cart */}
          <div className="flex items-center justify-between py-2.5 md:py-3.5">
            <button
              type="button"
              onClick={() => setActiveTab('shop')}
              aria-label="Sweet News — go to shop"
              className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0"
            >
              <OwlMascot size={34} />
              <div className="flex flex-col items-start">
                <span className="text-[17px] font-black tracking-tight text-on-background leading-tight">Sweet News</span>
                {isDeliveryOpen ? (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
                    Live Now
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant leading-none">
                    Opens {opensAt}
                  </span>
                )}
              </div>
            </button>

            {/* Desktop navigation (hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1">
              {(
                [
                  { id: 'shop',    label: 'Shop',    icon: <Store size={14} strokeWidth={2.5} /> },
                  { id: 'search',  label: 'Search',  icon: <Search size={14} strokeWidth={2.5} /> },
                  { id: 'orders',  label: 'Orders',  icon: <ReceiptText size={14} strokeWidth={2.5} /> },
                  { id: 'profile', label: 'Profile', icon: <User size={14} strokeWidth={2.5} /> },
                ] as { id: typeof activeTab; label: string; icon: React.ReactNode }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-on-background/[0.07] text-on-background border border-on-background/[0.12]'
                      : 'text-on-surface-variant hover:text-on-background/75 hover:bg-on-background/[0.05]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              aria-label="Open shopping cart"
              className="w-10 h-10 relative flex items-center justify-center rounded-full text-on-background hover:bg-on-background/[0.07] transition-colors duration-200"
            >
              <motion.div
                key={cartItemsCount}
                initial={{ scale: 1.2, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={2.5} />
              </motion.div>
              <AnimatePresence>
                {cartItemsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#ff2d55] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-[0_2px_6px_rgba(255,45,85,0.5)]"
                  >
                    <motion.span key={cartItemsCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>
                      {cartItemsCount}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          {/* Row 2: Search bar (mobile only) */}
          <div className="pb-3 md:hidden" onClick={() => setActiveTab('search')}>
            <div
              role="button"
              aria-label="Search products"
              className="w-full h-10 pl-4 pr-4 glass-panel rounded-full flex items-center gap-2.5 text-on-surface-variant text-[11px] tracking-widest uppercase font-black cursor-pointer hover:bg-on-background/[0.05] transition-colors"
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
              <span>Search products...</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Pages Container */}
      <main className="px-6 md:px-8 max-w-[430px] md:max-w-[1280px] mx-auto">
        <AnimatePresence mode="wait">
          
          {/* 1. SHOP VIEW */}
          {activeTab === 'shop' && (
            <ShopView
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onAddToCart={handleAddToCart}
              onViewProduct={setSelectedProduct}
              onNavigateToNews={() => setActiveTab('news')}
            />
          )}

          {/* 2. SEARCH VIEW */}
          {activeTab === 'search' && (
            <SearchView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddToCart={handleAddToCart}
              onViewProduct={setSelectedProduct}
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

          {/* 5. ABOUT / NEWS VIEW */}
          {activeTab === 'news' && (
            <AboutView onBack={() => setActiveTab('shop')} />
          )}

        </AnimatePresence>
      </main>

      {/* BottomNavBar Pill (mobile only) */}
      <nav className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50 flex justify-around items-center px-4 py-3.5 bg-surface/80 backdrop-blur-3xl rounded-[32px] border border-on-background/[0.09] shadow-[0_20px_40px_rgba(42,26,31,0.12),_inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300">
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
          customerUid={user?.uid}
          customerEmail={user?.email ?? undefined}
        />
      </Elements>

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={handleAddFromDetail}
        onCustomize={handleCustomizeFromDetail}
      />

      {/* Customization Sheet */}
      <CustomizationSheet
        product={customizingProduct}
        onClose={() => setCustomizingProduct(null)}
        onConfirm={handleCustomizationConfirm}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-[#f5ede5] text-[#0f0a08] px-5 py-3.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.40)] md:bottom-28 border border-[#0f0a08]/10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            <span className="font-label-bold text-[13px] font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt Banner */}
      <InstallPrompt />
    </div>
  );
}
