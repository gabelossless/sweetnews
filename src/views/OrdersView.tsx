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
      className="mt-2 min-h-[70vh]"
    >
      <section className="mb-8">
        <h1 className="font-headline-lg text-[32px] leading-tight font-extrabold mb-1">
          Your Orders
        </h1>
        <p className="font-body-md text-[17px] text-on-surface-variant mb-6 font-medium">Real-time order tracking & delivery archives.</p>
      </section>

      {/* Active simulated orders with dynamic tracker */}
      <section className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-[#050505] border border-white/[0.04] rounded-3xl p-8">
            <ReceiptText className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-40" />
            <h3 className="font-headline-md text-[18px] font-bold mb-1">No Orders Yet</h3>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto leading-relaxed">Ready to treat yourself? Place an order in the shop, and track your delivery details live right here!</p>
            <button 
              onClick={onStartShopping}
              className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-widest rounded-full uppercase"
            >
              Start Shopping
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
