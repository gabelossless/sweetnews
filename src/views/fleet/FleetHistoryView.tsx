import { Package, Clock } from 'lucide-react';
import { ActiveOrder } from '../../types';

interface FleetHistoryViewProps {
  deliveredOrders: ActiveOrder[];
}

const PAYOUT_PER_DELIVERY = parseFloat(
  (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_DRIVER_PAYOUT_PER_DELIVERY ?? '3.50'
);

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function FleetHistoryView({ deliveredOrders }: FleetHistoryViewProps) {
  const todayCount = deliveredOrders.filter((o) => isToday(o.createdAt)).length;
  const totalEarnings = deliveredOrders.length * PAYOUT_PER_DELIVERY;
  const todayEarnings = todayCount * PAYOUT_PER_DELIVERY;

  return (
    <div className="p-6 pt-8">
      <h1 className="text-3xl font-black tracking-tight mb-6">History</h1>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-[24px] border border-emerald-500/20 bg-emerald-500/[0.06]">
          <span className="text-[9px] uppercase tracking-widest text-emerald-600/70 font-black block mb-1">
            Today
          </span>
          <span className="text-2xl font-black text-emerald-600">${todayEarnings.toFixed(2)}</span>
          <span className="text-[10px] text-emerald-600/50 font-medium block mt-0.5">
            {todayCount} {todayCount === 1 ? 'delivery' : 'deliveries'}
          </span>
        </div>
        <div className="p-5 rounded-[24px] border border-on-background/[0.09] bg-on-background/[0.03]">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black block mb-1">
            All Time
          </span>
          <span className="text-2xl font-black">${totalEarnings.toFixed(2)}</span>
          <span className="text-[10px] text-on-surface-variant font-medium block mt-0.5">
            {deliveredOrders.length} {deliveredOrders.length === 1 ? 'delivery' : 'deliveries'}
          </span>
        </div>
      </div>

      {/* Order list */}
      <div className="space-y-3">
        <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-variant font-black px-1 mb-3">
          Completed Deliveries
        </p>

        {deliveredOrders.length === 0 ? (
          <div className="py-16 text-center bg-on-background/[0.03] border border-dashed border-on-background/[0.07] rounded-[28px]">
            <Package className="w-10 h-10 text-on-background/30 mx-auto mb-3" />
            <p className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest">
              No deliveries yet
            </p>
          </div>
        ) : (
          deliveredOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-[20px] bg-on-background/[0.03] border border-on-background/[0.07] hover:bg-on-background/[0.05] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-on-background uppercase tracking-wide truncate">
                  {order.customerName}
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium truncate mt-0.5">
                  {order.address}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-on-background/30" />
                  <p className="text-[9px] text-on-surface-variant">{order.date}</p>
                </div>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-[15px] font-black text-emerald-600">
                  +${PAYOUT_PER_DELIVERY.toFixed(2)}
                </p>
                <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest">
                  #{order.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
