import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ChevronDown } from 'lucide-react';
import { ActiveOrder } from '../types';
import { TrackerCard } from '../components/organisms/TrackerCard';

interface OrdersViewProps {
  orders: ActiveOrder[];
  onStartShopping: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

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
      className="mt-2 min-h-[70vh] px-2 pb-8"
    >
      {/* Header */}
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-3xl font-black text-on-background tracking-tight">Orders</h1>
        {activeOrders.length > 0 && (
          <span className="text-[11px] text-on-surface-variant font-medium">
            {activeOrders.length} active
          </span>
        )}
      </header>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center min-h-[50vh] px-6">
          <div className="w-14 h-14 rounded-full bg-on-background/[0.05] flex items-center justify-center mb-5">
            <Package className="w-6 h-6 text-on-surface-variant" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-on-background tracking-tight mb-2">
            No orders yet
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-[260px] mb-6">
            Place your first order to start tracking it here.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onStartShopping}
            className="px-5 py-2.5 bg-on-background text-background hover:bg-on-background/90 transition-colors text-[13px] font-bold rounded-full"
          >
            Browse shop
          </motion.button>
        </div>
      )}

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <AnimatePresence>
            {activeOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <TrackerCard order={order} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      )}

      {/* Past orders — compact list */}
      {pastOrders.length > 0 && (
        <section className={activeOrders.length > 0 ? 'mt-8' : ''}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold px-1 mb-2">
            Past orders
          </p>
          <div className="space-y-2">
            {pastOrders.map((order) => (
              <PastOrderRow key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function PastOrderRow({ order }: { order: ActiveOrder }) {
  const [expanded, setExpanded] = useState(false);
  const shortId = order.id.slice(-6).toUpperCase();
  const itemCount = order.items.reduce((t, i) => t + i.quantity, 0);
  const thumbs = order.items.slice(0, 2);

  return (
    <div className="rounded-[20px] bg-on-background/[0.03] border border-on-background/[0.07] overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-on-background/[0.03] transition-colors text-left"
      >
        {/* Thumbnails stack */}
        <div className="relative flex-shrink-0 flex">
          {thumbs.map((item, i) => (
            <div
              key={item.id}
              className="w-9 h-9 rounded-lg border border-background bg-on-background/[0.05] flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: thumbs.length - i }}
            >
              {item.image ? (
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[7px] font-black text-on-background/30 uppercase text-center leading-tight px-0.5">
                  {item.name.split(' ').slice(0, 2).join('\n')}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Middle */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-background truncate">
            ${order.total.toFixed(2)}
            <span className="text-on-surface-variant font-normal ml-1.5">
              · {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </p>
          <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
            #{shortId} · {order.date}
          </p>
        </div>

        {/* Status + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              order.status === 'delivered'
                ? 'text-emerald-600 bg-emerald-500/[0.08]'
                : 'text-red-500 bg-red-500/[0.08]'
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <ChevronDown
            size={14}
            className={`text-on-surface-variant transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="px-3 pb-3 pt-1">
              {order.status === 'cancelled' && order.cancellationReason && (
                <div className="mb-3 px-3 py-2.5 rounded-2xl bg-red-500/[0.06] border border-red-500/[0.12]">
                  <p className="text-[10px] uppercase tracking-widest font-black text-red-500 mb-1">Cancellation reason</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{order.cancellationReason}</p>
                </div>
              )}
              <TrackerCard order={order} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrdersView;
