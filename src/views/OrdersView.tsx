import { motion, AnimatePresence } from 'motion/react';
import { ReceiptText, Radio } from 'lucide-react';
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-4 min-h-[70vh] px-2"
    >
      {/* Hero */}
      <section className="mb-10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="font-display-xl text-[54px] uppercase font-black leading-[0.85] tracking-tighter mb-3 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
        >
          <span
            style={{
              background: 'linear-gradient(135deg,#e60023,#ff2060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            YOUR
          </span>
          <br />
          <span className="text-white/30">ORDERS.</span>
        </motion.h1>

        <div className="flex items-center gap-2 mt-2">
          {orders.length > 0 ? (
            <>
              <span className="animate-live-pulse inline-block w-2 h-2 rounded-full bg-[#ff2060] shadow-[0_0_8px_rgba(255,32,96,0.9)]" />
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#ff2060]/70 font-black">
                {orders.length} Active {orders.length === 1 ? 'Delivery' : 'Deliveries'}
              </p>
            </>
          ) : (
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-black">
              Real-Time Drop Ingress &amp; Telemetry
            </p>
          )}
        </div>
      </section>

      {/* Orders list / empty state */}
      <section className="space-y-6">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center py-20 bg-gradient-to-b from-[#e60023]/[0.04] to-transparent border border-[#e60023]/10 rounded-[32px] p-8"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#e60023]/10 border border-[#e60023]/15 flex items-center justify-center"
            >
              <Radio className="w-7 h-7" style={{ color: '#ff2060' }} strokeWidth={1.5} />
            </motion.div>

            <h3 className="font-headline-md text-[14px] uppercase tracking-widest font-black mb-2 text-white">
              No Active Deliveries
            </h3>
            <p className="text-white/35 text-[12px] max-w-xs mx-auto leading-relaxed font-medium mb-8">
              Your order vault is empty. Secure premium delicacies from the shop stage to trigger live tracking.
            </p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartShopping}
              className="px-8 py-3.5 btn-brand text-[10px] font-black tracking-[0.25em] rounded-full uppercase shadow-[0_8px_24px_rgba(230,0,35,0.45)] hover:shadow-[0_10px_32px_rgba(230,0,35,0.6)] transition-shadow"
            >
              Discover Treats
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
              >
                <TrackerCard order={order} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Live tracking footer note */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 py-4 text-[9px] uppercase font-black tracking-[0.25em] text-white/20"
          >
            <ReceiptText size={11} className="text-white/30" />
            Live telemetry updated in real-time
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

export default OrdersView;
