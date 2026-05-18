import { motion } from 'motion/react';
import { ReceiptText } from 'lucide-react';
import { ActiveOrder } from '../types';
import { TrackerCard } from '../components/organisms/TrackerCard';

interface OrdersViewProps {
  orders: ActiveOrder[];
  onStartShopping: () => void;
}

export function OrdersView({ orders, onStartShopping }: OrdersViewProps) {
  return (
    <motion.div
      key="orders-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="mt-4 min-h-[70vh] px-2"
    >
      <section className="mb-10">
        <h1 className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          YOUR<br/>
          <span className="text-white/30">ORDERS.</span>
        </h1>
        <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 font-black">Real-Time Drop Ingress & Telemetry</p>
      </section>

      {/* Active simulated orders with dynamic tracker */}
      <section className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-[32px] p-8">
            <ReceiptText className="w-12 h-12 text-white/20 mx-auto mb-4 opacity-40" />
            <h3 className="font-headline-md text-[14px] uppercase tracking-widest font-black mb-2 text-white">No active deliveries</h3>
            <p className="text-white/40 text-[12px] max-w-xs mx-auto leading-relaxed font-medium mb-6">Your order vault is empty. Secure premium delicacies inside our shop stage to trigger active tracking.</p>
            <button 
              onClick={onStartShopping}
              className="px-8 py-3 bg-white text-black text-[10px] font-black tracking-[0.25em] rounded-full uppercase hover:bg-white/90 hover:scale-105 active:scale-95 transition-all"
            >
              Discover Treats
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <TrackerCard key={order.id} order={order} />
          ))
        )}
      </section>
    </motion.div>
  );
}

export default OrdersView;
