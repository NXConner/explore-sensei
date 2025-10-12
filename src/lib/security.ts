import DOMPurify from 'dompurify';

/**
 * Security utilities for application hardening
 */

// XSS Prevention
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length === 64;
};

// Rate Limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return false;
  }
  
  rateLimitStore[key].count++;
  return true;
};

// Input Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// SQL Injection Prevention
export const escapeSQL = (input: string): string => {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// File Upload Security
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const scanFileForMalware = async (file: File): Promise<boolean> => {
  // In a real implementation, this would integrate with a malware scanning service
  // For now, we'll do basic checks
  const suspiciousPatterns = [
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec\s*\(/i,
    /<script/i,
    /javascript:/i
  ];
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const isClean = !suspiciousPatterns.some(pattern => pattern.test(content));
      resolve(isClean);
    };
    reader.readAsText(file);
  });
};

// Content Security Policy
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.openweathermap.org",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Secure Headers
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': getCSPHeader()
  };
};

// Encryption utilities
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Session Security
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

// API Security
export const validateAPIKey = (apiKey: string): boolean => {
  // In a real implementation, this would check against a database
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  return validKeys.includes(apiKey);
};

export const sanitizeAPIResponse = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeAPIResponse(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[sanitizeInput(key)] = sanitizeAPIResponse(value);
    }
    return sanitized;
  }
  
  return data;
};

// Audit Logging
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
  
  // In a real implementation, this would be sent to a logging service
  console.log('Security Event:', logEntry);
};

// Environment Security
export const validateEnvironment = (): {
  isSecure: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_MAPS_API_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      issues.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  // Check for development environment
  if (process.env.NODE_ENV === 'development') {
    issues.push('Running in development mode - security features may be reduced');
  }
  
  // Check for HTTPS
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
    issues.push('Not running over HTTPS in production');
  }
  
  return {
    isSecure: issues.length === 0,
    issues
  };
};

// Security middleware
export const createSecurityMiddleware = () => {
  return {
    validateRequest: (req: Request) => {
      // Validate request headers
      const userAgent = req.headers.get('user-agent');
      if (!userAgent || userAgent.length > 500) {
        return { isValid: false, reason: 'Invalid user agent' };
      }
      
      // Check for suspicious patterns
      const url = new URL(req.url);
      if (url.search.includes('script') || url.search.includes('javascript')) {
        return { isValid: false, reason: 'Suspicious query parameters' };
      }
      
      return { isValid: true };
    },
    
    sanitizeResponse: (response: Response) => {
      // Add security headers
      const headers = new Headers(response.headers);
      Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
  };
};
