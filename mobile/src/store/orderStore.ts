import { create } from 'zustand';
import { Order, DriverLocation } from '../types';

interface OrderState {
  activeOrder: Order | null;
  orderHistory: Order[];
  driverLocation: DriverLocation | null;
  eta: number | null;
  isLoading: boolean;
  setActiveOrder: (order: Order | null) => void;
  setOrderHistory: (orders: Order[]) => void;
  setDriverLocation: (loc: DriverLocation | null) => void;
  setEta: (eta: number | null) => void;
  setLoading: (v: boolean) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  activeOrder: null,
  orderHistory: [],
  driverLocation: null,
  eta: null,
  isLoading: false,
  setActiveOrder: (activeOrder) => set({ activeOrder }),
  setOrderHistory: (orderHistory) => set({ orderHistory }),
  setDriverLocation: (driverLocation) => set({ driverLocation }),
  setEta: (eta) => set({ eta }),
  setLoading: (isLoading) => set({ isLoading }),
}));
