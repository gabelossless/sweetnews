/**
 * SN-UI-001 — PickList
 * Visual item checklist for the admin founder-delivery workflow.
 * Local state only — no Firestore writes, just a pick-aid while bagging orders.
 */
import { useState } from 'react';
import { CheckCircle2, Circle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PickItem {
  name: string;
  quantity: number;
  image?: string;
}

interface PickListProps {
  items: PickItem[];
  onAllPicked: () => void;
}

export function PickList({ items, onAllPicked }: PickListProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const pickedCount = Object.values(checked).filter(Boolean).length;
  const allPicked = pickedCount === items.length;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2 font-medium">
        <ShoppingBag className="w-3.5 h-3.5" />
        Bagging Checklist — {pickedCount} of {items.length} packed
      </p>

      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => toggle(idx)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
            checked[idx]
              ? 'bg-emerald-950/10 border-emerald-500/30 opacity-60'
              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex-shrink-0">
            {checked[idx] ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Circle className="w-4 h-4 text-white/20" />
            )}
          </div>

          {item.image && (
            <img
              src={item.image}
              alt=""
              className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
              loading="lazy"
            />
          )}

          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${checked[idx] ? 'line-through text-white/30' : 'text-white'}`}>
              {item.name}
            </p>
          </div>

          <span className={`text-[10px] font-semibold flex-shrink-0 ${checked[idx] ? 'text-emerald-500' : 'text-white/40'}`}>
            QTY: {item.quantity}
          </span>
        </button>
      ))}

      <AnimatePresence>
        {allPicked && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            onClick={onAllPicked}
            className="w-full mt-4 py-3.5 rounded-full bg-emerald-500 text-black font-semibold text-xs uppercase tracking-wider transition-all hover:bg-emerald-400"
          >
            Bagging Complete · Out for Delivery
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PickList;
