import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Event } from '@/lib/types';

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
}

interface EventActions {
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventState & EventActions>()(
  immer((set) => ({
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,

    setEvents: (events) =>
      set((state) => {
        state.events = events;
      }),

    addEvent: (event) =>
      set((state) => {
        state.events.push(event);
      }),

    updateEvent: (id, updates) =>
      set((state) => {
        const index = state.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...updates };
        }
        if (state.selectedEvent?.id === id) {
          state.selectedEvent = { ...state.selectedEvent, ...updates };
        }
      }),

    deleteEvent: (id) =>
      set((state) => {
        state.events = state.events.filter((e) => e.id !== id);
        if (state.selectedEvent?.id === id) {
          state.selectedEvent = null;
        }
      }),

    setSelectedEvent: (event) =>
      set((state) => {
        state.selectedEvent = event;
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
