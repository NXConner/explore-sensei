import { generateCSRFToken, generateSecureToken } from './csrf-protection';

/**
 * Session management utilities
 */

export const createSecureSession = (userId: string): {
  sessionId: string;
  expiresAt: number;
  csrfToken: string;
} => {
  const sessionId = generateSecureToken(64);
  const csrfToken = generateCSRFToken();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  return {
    sessionId,
    expiresAt,
    csrfToken
  };
};

export const validateSession = (sessionId: string, expiresAt: number): boolean => {
  return sessionId.length === 128 && Date.now() < expiresAt;
};

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
