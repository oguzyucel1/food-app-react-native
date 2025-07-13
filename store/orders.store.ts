import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Sipariş tipi
export interface Order {
  id: string;
  items: any[];
  totalPrice: number;
  address: string;
  date: string;
  status: "processing" | "delivered" | "cancelled";
}

// Store tipi
interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => void;
  getOrders: () => Order[];
  clearOrders: () => void;
}

// Store oluşturma
const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      // Yeni sipariş ekleme
      addOrder: (orderData) => {
        const newOrder: Order = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...orderData,
          date: new Date().toISOString(),
          status: "processing",
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
      },

      // Tüm siparişleri getirme
      getOrders: () => {
        return get().orders;
      },

      // Tüm siparişleri temizleme (test için)
      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: "orders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useOrdersStore;
