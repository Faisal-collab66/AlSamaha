import { create } from 'zustand';
import { Order } from '../types';

interface DriverState {
  isOnline: boolean;
  isDelivering: boolean;
  assignedOrders: Order[];
  activeOrder: Order | null;
  setOnline: (v: boolean) => void;
  setDelivering: (v: boolean) => void;
  setAssignedOrders: (orders: Order[]) => void;
  setActiveOrder: (order: Order | null) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  isOnline: false,
  isDelivering: false,
  assignedOrders: [],
  activeOrder: null,
  setOnline: (isOnline) => set({ isOnline }),
  setDelivering: (isDelivering) => set({ isDelivering }),
  setAssignedOrders: (assignedOrders) => set({ assignedOrders }),
  setActiveOrder: (activeOrder) => set({ activeOrder }),
}));
