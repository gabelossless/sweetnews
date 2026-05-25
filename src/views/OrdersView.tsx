import { motion, AnimatePresence } from 'motion/react';
import { Radio, ReceiptText } from 'lucide-react';
import { ActiveOrder } from '../types';
import { TrackerCard } from '../components/organisms/TrackerCard';

interface OrdersViewProps {
  orders: ActiveOrder[];
  onStartShopping: () => void;
}

export function OrdersView({ orders, onStartShopping }: OrdersViewProps) {
  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const pastOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  return (
    <motion.div
      key="orders-tab"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-4 min-h-[70vh] px-2 pb-8"
    >
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-start justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="font-display-xl text-[48px] uppercase font-black leading-[0.85] tracking-tighter text-white"
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

          {activeOrders.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2060] animate-pulse shadow-[0_0_6px_rgba(255,32,96,0.9)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff2060]/70">
                Live
              </span>
            </div>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-white/25 font-black mt-2">
          {orders.length === 0
            ? 'Real-time order tracking'
            : activeOrders.length > 0
            ? `${activeOrders.length} in progress · ${pastOrders.length} completed`
            : `${pastOrders.length} completed`}
        </p>
      </section>

      {/* Content */}
      <section className="space-y-5">
        {orders.length === 0 ? (
          /* ── Empty state ─────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-[32px] border border-[#e60023]/10"
            style={{
              background:
                'linear-gradient(180deg, rgba(230,0,35,0.05) 0%, transparent 100%)',
            }}
          >
            <div className="flex flex-col items-center text-center px-8 py-16">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.9, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 mb-6 rounded-full border border-[#e60023]/20 flex items-center justify-center"
                style={{ background: 'rgba(230,0,35,0.08)' }}
              >
                <Radio className="w-7 h-7" style={{ color: '#ff2060' }} strokeWidth={1.5} />
              </motion.div>

              <h3 className="font-headline-md text-[13px] uppercase tracking-widest font-black mb-3 text-white">
                No Active Deliveries
              </h3>

              {/* Fixed: flex column + explicit max-width, no mx-auto wrapping bug */}
              <p className="text-white/35 text-[12px] leading-relaxed font-medium mb-8 w-full max-w-[240px]">
                Your order vault is empty. Browse the shop to place your first
                midnight delivery.
              </p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartShopping}
                className="px-8 py-3.5 btn-brand text-[10px] font-black tracking-[0.25em] rounded-full uppercase shadow-[0_8px_24px_rgba(230,0,35,0.45)] hover:shadow-[0_10px_32px_rgba(230,0,35,0.6)] transition-shadow"
              >
                Discover Treats
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {/* Active orders */}
            {activeOrders.length > 0 && (
              <>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black px-1 pb-1">
                  Active
                </p>
                {activeOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.96 }}
                    transition={{ delay: idx * 0.07, duration: 0.32 }}
                  >
                    <TrackerCard order={order} />
                  </motion.div>
                ))}
              </>
            )}

            {/* History */}
            {pastOrders.length > 0 && (
              <>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black px-1 pb-1 pt-4">
                  History
                </p>
                {pastOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      delay: (activeOrders.length + idx) * 0.06,
                      duration: 0.32,
                    }}
                  >
                    <TrackerCard order={order} />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        )}

        {/* Live telemetry footer */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 py-4 text-[9px] uppercase font-black tracking-[0.25em] text-white/15"
          >
            <ReceiptText size={11} className="text-white/20" />
            Live telemetry · updated in real-time
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

export default OrdersView;
