import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '@/lib/types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  immer((set) => ({
    user: null,
    loading: false,
    error: null,

    setUser: (user) =>
      set((state) => {
        state.user = user;
      }),

    updateUser: (updates) =>
      set((state) => {
        if (state.user) {
          state.user = { ...state.user, ...updates };
        }
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    clearUser: () =>
      set((state) => {
        state.user = null;
        state.error = null;
      }),
  }))
);
