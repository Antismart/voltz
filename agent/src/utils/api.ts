import axios, { AxiosInstance } from 'axios';

/**
 * API client for communicating with Voltz backend
 */
class BackendAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user profile by wallet address
   */
  async getUserProfile(walletAddress: string) {
    try {
      const response = await this.client.get(`/api/v1/profiles/${walletAddress}`);
      return response.data.profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * Get user matches by wallet address
   */
  async getUserMatches(walletAddress: string) {
    try {
      const response = await this.client.get(`/api/v1/matches/user/${walletAddress}`);
      return response.data.matches;
    } catch (error) {
      console.error('Failed to fetch user matches:', error);
      return [];
    }
  }

  /**
   * Get event details by event ID
   */
  async getEventDetails(eventId: string) {
    try {
      const response = await this.client.get(`/api/v1/events/${eventId}`);
      return response.data.event;
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      return null;
    }
  }

  /**
   * Get user's events
   */
  async getUserEvents(walletAddress: string) {
    try {
      const response = await this.client.get(`/api/v1/events/user/${walletAddress}`);
      return response.data.events;
    } catch (error) {
      console.error('Failed to fetch user events:', error);
      return [];
    }
  }

  /**
   * Log message activity
   */
  async logMessageActivity(data: {
    fromAddress: string;
    toAddress: string;
    messageType: string;
    timestamp: Date;
  }) {
    try {
      await this.client.post('/api/v1/agent/log', data);
    } catch (error) {
      console.error('Failed to log message activity:', error);
    }
  }
}

// Singleton instance
let apiInstance: BackendAPI | null = null;

export function getAPIClient(): BackendAPI {
  if (!apiInstance) {
    apiInstance = new BackendAPI();
  }
  return apiInstance;
}

export async function connectToBackend(): Promise<boolean> {
  const api = getAPIClient();
  const isConnected = await api.testConnection();
  if (isConnected) {
    console.log('✅ Connected to Voltz backend');
  } else {
    console.warn('⚠️  Could not connect to Voltz backend');
  }
  return isConnected;
}

export { BackendAPI };
