import { logger } from '@/lib/monitoring';

/**
 * Security audit logging
 */

export const logSecurityEvent = (event: {
  type: 'login' | 'logout' | 'failed_login' | 'rate_limit' | 'xss_attempt' | 'file_upload';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
}): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event.type,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details
  };
  
  if (import.meta.env?.DEV) {
    logger.info('Security Event', logEntry as any);
  }
};

export const validateAPIKey = (apiKey: string): boolean => {
  const validKeysRaw = (import.meta as any)?.env?.VITE_VALID_API_KEYS || "";
  const validKeys = String(validKeysRaw).split(',').map(k => k.trim()).filter(Boolean);
  return validKeys.includes(apiKey);
};

export const validateEnvironment = (): {
  isSecure: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_MAPS_API_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!(import.meta as any)?.env?.[envVar]) {
      issues.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  if (import.meta.env?.DEV) {
    issues.push('Running in development mode - security features may be reduced');
  }
  
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && import.meta.env?.PROD) {
    issues.push('Not running over HTTPS in production');
  }
  
  return {
    isSecure: issues.length === 0,
    issues
  };
};
