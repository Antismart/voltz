export interface User {
  id: string;
  address: string;
  email?: string;
  username?: string;
  profileType: 'ATTENDEE' | 'SPEAKER' | 'ORGANIZER' | 'SPONSOR';
  profileNFTId?: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  goals: string[];
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  credentials: Credential[];
  reputationScore: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  type: 'GITHUB' | 'TWITTER' | 'LINKEDIN' | 'CUSTOM';
  verified: boolean;
  attestationId?: string;
  metadata?: Record<string, any>;
  verifiedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  registered: number;
  checkedIn: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  isRegistered?: boolean;
  hasCheckedIn?: boolean;
  createdAt: string;
}

export interface Match {
  id: string;
  user: User;
  score: number;
  commonInterests: string[];
  commonSkills: string[];
  explanation: string;
  isConnected: boolean;
  eventId: string;
  generatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export interface Reputation {
  userId: string;
  totalPoints: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  breakdown: {
    events: number;
    connections: number;
    workshops: number;
    credentials: number;
  };
  history: ReputationHistory[];
}

export interface ReputationHistory {
  id: string;
  points: number;
  category: string;
  description: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
