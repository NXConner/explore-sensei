/**
 * Security headers and CSP configuration
 */

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

export const createSecurityMiddleware = () => {
  return {
    validateRequest: (req: Request) => {
      const userAgent = req.headers.get('user-agent');
      if (!userAgent || userAgent.length > 500) {
        return { isValid: false, reason: 'Invalid user agent' };
      }
      
      const url = new URL(req.url);
      if (url.search.includes('script') || url.search.includes('javascript')) {
        return { isValid: false, reason: 'Suspicious query parameters' };
      }
      
      return { isValid: true };
    },
    
    sanitizeResponse: (response: Response) => {
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
