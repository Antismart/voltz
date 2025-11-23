import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import type { ProfileMetadata, EventMetadata, StorageUploadResult } from '../types/index.js';

class StorageService {
  private baseURL: string;
  private apiKey?: string;

  constructor() {
    this.baseURL = config.OG_STORAGE_URL;
    this.apiKey = config.OG_STORAGE_API_KEY;
  }

  /**
   * Upload profile metadata to 0G Storage
   */
  async uploadProfile(metadata: ProfileMetadata): Promise<StorageUploadResult> {
    try {
      const data = JSON.stringify(metadata);
      const result = await this.upload(data, `profile-${metadata.address}.json`);

      logger.info({ address: metadata.address, uri: result.uri }, 'Profile uploaded to 0G Storage');
      return result;
    } catch (error) {
      logger.error({ error, address: metadata.address }, 'Failed to upload profile');
      throw error;
    }
  }

  /**
   * Upload event metadata to 0G Storage
   */
  async uploadEvent(metadata: EventMetadata, organizer: string): Promise<StorageUploadResult> {
    try {
      const data = JSON.stringify(metadata);
      const result = await this.upload(data, `event-${Date.now()}.json`);

      logger.info({ organizer, uri: result.uri }, 'Event uploaded to 0G Storage');
      return result;
    } catch (error) {
      logger.error({ error, organizer }, 'Failed to upload event');
      throw error;
    }
  }

  /**
   * Retrieve data from 0G Storage
   */
  async retrieve<T = any>(uri: string): Promise<T> {
    try {
      const response = await axios.get(uri, {
        headers: this.getHeaders(),
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      logger.error({ error, uri }, 'Failed to retrieve from 0G Storage');
      throw error;
    }
  }

  /**
   * Upload arbitrary data to 0G Storage
   * @private
   */
  private async upload(data: string, filename: string): Promise<StorageUploadResult> {
    try {
      // TODO: Replace with actual 0G Storage SDK when available
      // For now, this is a placeholder implementation

      // Calculate content hash (simplified CID simulation)
      const buffer = Buffer.from(data);
      const cid = this.generateCID(buffer);
      const size = buffer.length;

      // In production, this would use the 0G Storage SDK:
      // const client = new ZeroGStorageClient(this.baseURL, this.apiKey);
      // const result = await client.upload(buffer);

      // For development, you might want to use IPFS or local storage as fallback
      const uri = `${this.baseURL}/ipfs/${cid}`;

      // Mock upload - replace with actual 0G Storage SDK call
      if (config.NODE_ENV === 'development') {
        logger.debug({ filename, size, cid }, 'Mock upload to 0G Storage');
      }

      return {
        uri,
        cid,
        size,
      };
    } catch (error) {
      logger.error({ error, filename }, 'Upload failed');
      throw new Error('Failed to upload to 0G Storage');
    }
  }

  /**
   * Generate a content identifier (simplified)
   * @private
   */
  private generateCID(buffer: Buffer): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `Qm${hash.substring(0, 44)}`; // Simplified CID format
  }

  /**
   * Get request headers
   * @private
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Check if storage service is available
   */
  async ping(): Promise<boolean> {
    try {
      // TODO: Implement actual health check with 0G Storage
      return true;
    } catch (error) {
      logger.error({ error }, '0G Storage health check failed');
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
