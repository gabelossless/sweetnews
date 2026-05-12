import { motion, AnimatePresence } from 'motion/react';
import {
  Box,
  Car,
  ChevronRight,
  Clock,
  LogOut,
  MapPin,
  Package,
  Settings,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/atoms/Button';
import { ActiveOrder } from '../../types';

interface FleetDashboardViewProps {
  activeOrders: ActiveOrder[];
  onStatusUpdate: (orderId: string, currentStatus: string) => void;
}

export default function FleetDashboardView({ activeOrders, onStatusUpdate }: FleetDashboardViewProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-black">
            Fleet <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-on-surface-variant text-sm flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Active & Ready
          </p>
        </div>
        <button
          onClick={() => logout()}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"
        >
          <LogOut className="w-5 h-5 text-on-surface-variant" />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[28px] border border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">
            Assigned
          </span>
          <span className="text-2xl font-black">{activeOrders.length}</span>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[28px] border border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">
            Today
          </span>
          <span className="text-2xl font-black">0</span>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2 px-2">
          <Navigation className="w-4 h-4 text-primary" />
          Active Deliveries
        </h2>

        <AnimatePresence mode="popLayout">
          {activeOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">
                    {order.status}
                  </span>
                  <h3 className="text-xl font-bold">{order.customerName}</h3>
                  <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {order.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-50 mb-1">Order Total</p>
                  <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-on-surface-variant">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => onStatusUpdate(order.id, order.status)}
                className="w-full py-4 rounded-2xl bg-primary text-white font-black"
              >
                {order.status === 'confirmed' && 'Start Preparation'}
                {order.status === 'cooking' && 'Pick Up Order'}
                {order.status === 'delivering' && 'Mark as Delivered'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}

          {activeOrders.length === 0 && (
            <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[32px]">
              <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-on-surface-variant">Waiting for new assignments...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-8 left-6 right-6 h-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-[28px] flex items-center justify-around px-8 z-50">
        <button className="text-primary">
          <Box className="w-6 h-6" />
        </button>
        <button className="text-on-surface-variant/40">
          <Car className="w-6 h-6" />
        </button>
        <button className="text-on-surface-variant/40">
          <Clock className="w-6 h-6" />
        </button>
        <button className="text-on-surface-variant/40">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
