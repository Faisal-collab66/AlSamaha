import { create } from 'zustand';
import { AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  firebaseUid: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: AppUser | null) => void;
  setFirebaseUid: (uid: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUid: null,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setFirebaseUid: (firebaseUid) => set({ firebaseUid }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () => set({ user: null, firebaseUid: null, isLoading: false }),
}));
