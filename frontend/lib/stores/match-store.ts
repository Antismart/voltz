import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Match } from '@/lib/types';

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
}

interface MatchActions {
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  removeMatch: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMatchStore = create<MatchState & MatchActions>()(
  immer((set) => ({
    matches: [],
    loading: false,
    error: null,

    setMatches: (matches) =>
      set((state) => {
        state.matches = matches;
      }),

    addMatch: (match) =>
      set((state) => {
        state.matches.push(match);
      }),

    updateMatch: (id, updates) =>
      set((state) => {
        const index = state.matches.findIndex((m) => m.id === id);
        if (index !== -1) {
          state.matches[index] = { ...state.matches[index], ...updates };
        }
      }),

    removeMatch: (id) =>
      set((state) => {
        state.matches = state.matches.filter((m) => m.id !== id);
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);
