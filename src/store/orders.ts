import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActiveOrder } from '../types';

export interface OrdersState {
  orders: ActiveOrder[];
  addOrder: (order: ActiveOrder) => void;
  updateOrdersProgress: () => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
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
