import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export const urlSchema = z.string().url('Invalid URL');

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function isValidAddress(address: string): boolean {
  return addressSchema.safeParse(address).success;
}

export function isValidUrl(url: string): boolean {
  return urlSchema.safeParse(url).success;
}
