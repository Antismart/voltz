import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Conversation, Message } from '@/lib/types';

interface MessagingState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}

interface MessagingActions {
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string, messageId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMessagingStore = create<MessagingState & MessagingActions>()(
  immer((set) => ({
    conversations: [],
    selectedConversation: null,
    messages: {},
    loading: false,
    error: null,

    setConversations: (conversations) =>
      set((state) => {
        state.conversations = conversations;
      }),

    addConversation: (conversation) =>
      set((state) => {
        state.conversations.push(conversation);
      }),

    setSelectedConversation: (conversation) =>
      set((state) => {
        state.selectedConversation = conversation;
      }),

    setMessages: (conversationId, messages) =>
      set((state) => {
        state.messages[conversationId] = messages;
      }),

    addMessage: (conversationId, message) =>
      set((state) => {
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
      }),

    markAsRead: (conversationId, messageId) =>
      set((state) => {
        const messages = state.messages[conversationId];
        if (messages) {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            message.read = true;
          }
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
  }))
);
