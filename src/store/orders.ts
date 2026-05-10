import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActiveOrder } from '../types';

export interface OrdersState {
  orders: ActiveOrder[];
  addOrder: (order: ActiveOrder) => void;
  updateOrdersProgress: () => void;
}

const DEFAULT_ORDERS: ActiveOrder[] = [
  {
    id: '8392',
    items: [
      { id: '1', name: 'Wagyu Katsu Sando', price: 24.50, quantity: 1, image: 'https://images.unsplash.com/photo-1627907228175-2bf8ec2c8dd6?q=80&w=600&auto=format&fit=crop' },
      { id: '3', name: 'Cold-Pressed Green Detox', price: 8.50, quantity: 1, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop' }
    ],
    total: 36.99,
    date: 'Yesterday, 11:42 PM',
    status: 'delivered',
    progress: 100,
    address: 'Downloads/sweet-news HQ, Suite 300'
  }
];

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: DEFAULT_ORDERS,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrdersProgress: () => set((state) => ({
        orders: state.orders.map((order) => {
          if (order.status === 'delivered') return order;
          const newProgress = Math.min(order.progress + 15, 100);
          let newStatus: ActiveOrder['status'] = order.status;
          
          if (newProgress >= 100) {
            newStatus = 'delivered';
          } else if (newProgress >= 70) {
            newStatus = 'delivering';
          } else if (newProgress >= 35) {
            newStatus = 'cooking';
          }

          return {
            ...order,
            progress: newProgress,
            status: newStatus
          };
        })
      }))
    }),
    {
      name: 'sweetnews-orders-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useOrdersStore;
