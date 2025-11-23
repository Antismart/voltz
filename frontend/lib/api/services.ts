import { apiClient } from './client';
import type { User, Event, Match, Conversation, Message, Reputation, ApiResponse, PaginatedResponse } from '../types';

// Auth Services
export const authService = {
  getMessage: async (address: string): Promise<{ message: string }> => {
    return apiClient.get(`/auth/message/${address}`);
  },

  login: async (data: { address: string; signature: string; message: string }) => {
    return apiClient.post('/auth/login', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  verify: async (): Promise<{ valid: boolean }> => {
    return apiClient.get('/auth/verify');
  },

  getMe: async (): Promise<User> => {
    return apiClient.get('/auth/me');
  },
};

// Profile Services
export const profileService = {
  create: async (data: {
    profileType: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    goals?: string[];
    socials?: Record<string, string>;
  }): Promise<User> => {
    return apiClient.post('/profiles', data);
  },

  update: async (data: Partial<User>): Promise<User> => {
    return apiClient.put('/profiles', data);
  },

  getByAddress: async (address: string): Promise<User> => {
    return apiClient.get(`/profiles/${address}`);
  },

  getMe: async (): Promise<User> => {
    return apiClient.get('/profiles/me');
  },
};

// Event Services
export const eventService = {
  create: async (data: {
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    maxAttendees: number;
    tags?: string[];
    image?: string;
    website?: string;
  }): Promise<Event> => {
    return apiClient.post('/events', data);
  },

  getById: async (id: string): Promise<Event> => {
    return apiClient.get(`/events/${id}`);
  },

  list: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Event>> => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/events?${query}`);
  },

  register: async (eventId: string, goals: string): Promise<void> => {
    return apiClient.post(`/events/${eventId}/register`, { eventId, goals });
  },

  checkIn: async (eventId: string): Promise<void> => {
    return apiClient.post(`/events/${eventId}/checkin`);
  },

  getMyEvents: async (): Promise<Event[]> => {
    return apiClient.get('/events/my');
  },
};

// Match Services
export const matchService = {
  getMatches: async (eventId: string): Promise<{ matches: Match[] }> => {
    return apiClient.get(`/matches/${eventId}`);
  },

  markViewed: async (matchId: string): Promise<void> => {
    return apiClient.put(`/matches/${matchId}/viewed`);
  },

  markContacted: async (matchId: string): Promise<void> => {
    return apiClient.put(`/matches/${matchId}/contacted`);
  },
};

// Message Services (backend cache, XMTP is separate)
export const messageService = {
  getConversations: async (): Promise<Conversation[]> => {
    return apiClient.get('/messages/conversations');
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    return apiClient.get(`/messages/${conversationId}`);
  },

  sendMessage: async (data: {
    to: string;
    content: string;
  }): Promise<Message> => {
    return apiClient.post('/messages/send', data);
  },
};

// Reputation Services
export const reputationService = {
  getReputation: async (address?: string): Promise<Reputation> => {
    const url = address ? `/reputation/${address}` : '/reputation/me';
    return apiClient.get(url);
  },

  getHistory: async (): Promise<Reputation['history']> => {
    return apiClient.get('/reputation/history');
  },
};

// Credential Services
export const credentialService = {
  verifyGithub: async (code: string): Promise<{ verified: boolean }> => {
    return apiClient.post('/credentials/verify/github', { code });
  },

  verifyTwitter: async (code: string): Promise<{ verified: boolean }> => {
    return apiClient.post('/credentials/verify/twitter', { code });
  },

  verifyLinkedIn: async (code: string): Promise<{ verified: boolean }> => {
    return apiClient.post('/credentials/verify/linkedin', { code });
  },

  getMyCredentials: async () => {
    return apiClient.get('/credentials/me');
  },
};

// Analytics Services
export const analyticsService = {
  getStats: async (): Promise<{
    totalEvents: number;
    totalConnections: number;
    totalMatches: number;
    reputationRank: number;
  }> => {
    return apiClient.get('/analytics/stats');
  },
};
