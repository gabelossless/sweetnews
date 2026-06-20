import { AnimatePresence, motion } from 'motion/react';
import { Box, ChevronRight, Clock, MapPin, Navigation, Package, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../../components/atoms/Button';
import { ActiveOrder } from '../../types';
import { getMapUrl } from '../../lib/utils';
import { updateDriverLocation } from '../../lib/orders';
import FleetHistoryView from './FleetHistoryView';
import FleetProfileView from './FleetProfileView';

interface FleetDashboardViewProps {
  activeOrders: ActiveOrder[];
  deliveredOrders: ActiveOrder[];
  activeTab: 'dashboard' | 'history' | 'profile';
  onTabChange: (tab: 'dashboard' | 'history' | 'profile') => void;
  onStatusUpdate: (orderId: string, currentStatus: string, customerId: string) => void;
}

interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  btnFrom: string;
  btnTo: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  confirmed:  { bg: 'rgba(245,158,11,0.06)',  text: '#f59e0b', border: 'rgba(245,158,11,0.18)', btnFrom: '#f59e0b', btnTo: '#f97316' },
  cooking:    { bg: 'rgba(245,158,11,0.06)',  text: '#f59e0b', border: 'rgba(245,158,11,0.18)', btnFrom: '#f59e0b', btnTo: '#f97316' },
  delivering: { bg: 'rgba(59,130,246,0.06)',  text: '#3b82f6', border: 'rgba(59,130,246,0.18)', btnFrom: '#3b82f6', btnTo: '#6366f1' },
  delivered:  { bg: 'rgba(16,185,129,0.06)',  text: '#10b981', border: 'rgba(16,185,129,0.18)', btnFrom: '#10b981', btnTo: '#059669' },
};

const STATUS_LABELS: Record<string, string> = {
  confirmed:  'Preparing',
  cooking:    'Ready to Pick Up',
  delivering: 'En Route',
  delivered:  'Delivered',
};

const ACTION_LABELS: Record<string, string> = {
  confirmed:  'Start Preparation',
  cooking:    'Pick Up Order',
  delivering: 'Mark as Delivered',
};

export default function FleetDashboardView({
  activeOrders,
  deliveredOrders,
  activeTab,
  onTabChange,
  onStatusUpdate,
}: FleetDashboardViewProps) {
  // Location tracking for active deliveries
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Start/stop location tracking based on active delivering orders
  useEffect(() => {
    const deliveringOrders = activeOrders.filter(o => o.status === 'delivering');
    
    if (deliveringOrders.length > 0 && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(loc);
          
          // Update location for all delivering orders
          deliveringOrders.forEach(order => {
            updateDriverLocation(order.id, loc.lat, loc.lng).catch(console.error);
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 10000, 
          timeout: 15000 
        }
      );
      setWatchId(id);
    } else if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setCurrentLocation(null);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeOrders, watchId]);

  const handleStatusUpdate = async (orderId: string, currentStatus: string, customerId: string) => {
    onStatusUpdate(orderId, currentStatus, customerId);
  };
  return (
    <div className="min-h-screen bg-surface text-on-background pb-32">
      {/* ── Dashboard tab ──────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="p-6 pt-10">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[32px] font-black tracking-tight leading-none">Deliveries</h1>
              <p className="text-[10px] text-on-surface-variant flex items-center gap-1.5 mt-1.5 uppercase tracking-[0.2em] font-black">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active & Ready
              </p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Assigned</p>
                <p
                  className="text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {activeOrders.length}
                </p>
              </div>
              {/* GPS Status */}
              <div className="flex items-center gap-2 text-right">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
                  <span 
                    className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                  />
                  <span>{currentLocation ? 'GPS Active' : 'GPS Off'}</span>
                </div>
                {currentLocation && (
                  <div className="text-[8px] text-on-surface-variant font-mono">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="space-y-5">
            <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-variant font-black px-1">
              Active
            </p>

            <AnimatePresence mode="popLayout">
              {activeOrders.map((order) => {
                const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.confirmed;
                const actionLabel = ACTION_LABELS[order.status];
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-[28px] p-5 border"
                    style={{ background: s.bg, borderColor: s.border }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-2 inline-block"
                          style={{ color: s.text, borderColor: s.border }}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        <h3 className="text-[18px] font-black tracking-tight leading-tight">
                          {order.customerName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest">Total</p>
                        <p className="text-[18px] font-black">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Tappable map link */}
                    <a
                      href={getMapUrl(order.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] font-medium mb-4 rounded-[16px] py-2.5 px-3.5 border border-on-background/[0.07] bg-on-background/[0.03] hover:bg-on-background/[0.05] active:bg-on-background/[0.07] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.text }} />
                      <span className="truncate text-on-background/75 flex-1">{order.address}</span>
                      <Navigation className="w-3 h-3 flex-shrink-0 text-on-surface-variant" />
                    </a>

                    {/* Items */}
                    <div className="space-y-1.5 mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-[10px] py-1.5 border-b border-on-background/[0.07] last:border-0"
                        >
                          <span className="text-on-surface-variant">{item.quantity}× {item.name}</span>
                          <span className="text-on-surface-variant">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {actionLabel && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, order.status, order.customerId)}
                        className="w-full py-3.5 rounded-[18px] font-black text-[11px] uppercase tracking-widest text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${s.btnFrom}, ${s.btnTo})` }}
                      >
                        {actionLabel}
                        <ChevronRight className="w-4 h-4 ml-1.5 inline" />
                      </Button>
                    )}
                  </motion.div>
                );
              })}

              {activeOrders.length === 0 && (
                <div className="py-16 text-center bg-on-background/[0.03] border border-dashed border-on-background/[0.07] rounded-[28px]">
                  <Package className="w-10 h-10 text-on-background/30 mx-auto mb-3" />
                  <p className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest">
                    Waiting for assignments...
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── History tab ────────────────────────────────── */}
      {activeTab === 'history' && <FleetHistoryView deliveredOrders={deliveredOrders} />}

      {/* ── Profile tab ────────────────────────────────── */}
      {activeTab === 'profile' && <FleetProfileView />}

      {/* ── Bottom nav ─────────────────────────────────── */}
      <div className="fixed bottom-6 left-4 right-4 h-[62px] bg-background/80 backdrop-blur-xl border border-on-background/[0.09] rounded-[22px] flex items-center justify-around px-8 z-50">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-amber-600' : 'text-on-surface-variant hover:text-on-background'
          }`}
        >
          <Box className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-wider">Orders</span>
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'history' ? 'text-amber-600' : 'text-on-surface-variant hover:text-on-background'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-wider">History</span>
        </button>
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'profile' ? 'text-amber-600' : 'text-on-surface-variant hover:text-on-background'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  );
}
