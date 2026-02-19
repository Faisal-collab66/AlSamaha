import { create } from 'zustand';
import { CartItem, SelectedOption } from '../types';

let cartIdCounter = 0;

interface CartState {
  items: CartItem[];
  couponCode: string;
  discountAmount: number;
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQty: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;

  // Computed helpers (not stored — derived in selectors)
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  discountAmount: 0,

  addItem: (item) => {
    cartIdCounter += 1;
    set((state) => ({
      items: [...state.items, { ...item, cartItemId: `cart_${cartIdCounter}` }],
    }));
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    }));
  },

  updateQty: (cartItemId, qty) => {
    if (qty <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.cartItemId === cartItemId ? { ...i, qty } : i
      ),
    }));
  },

  clearCart: () => set({ items: [], couponCode: '', discountAmount: 0 }),

  setCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
  clearCoupon: () => set({ couponCode: '', discountAmount: 0 }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const optionDelta = item.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
      return sum + (item.price + optionDelta) * item.qty;
    }, 0);
  },

  getItemCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}));
