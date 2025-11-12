/**
 * Mobile optimization utilities
 * Provides functions for optimizing performance and UX on mobile devices
 */

/**
 * Detect if running on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if running on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Detect if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detect if device has touch support
 */
export function hasTouchSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get device pixel ratio for image optimization
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Get network connection info (if available)
 */
export function getNetworkInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} | null {
  if (typeof window === 'undefined') return null;
  
  const connection = (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;
  
  if (!connection) return null;
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Check if device is on slow network
 */
export function isSlowNetwork(): boolean {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return false;
  
  const slowTypes = ['slow-2g', '2g'];
  return networkInfo.effectiveType
    ? slowTypes.includes(networkInfo.effectiveType)
    : false;
}

/**
 * Check if data saver mode is enabled
 */
export function isDataSaverEnabled(): boolean {
  const networkInfo = getNetworkInfo();
  return networkInfo?.saveData === true;
}

/**
 * Optimize image URL for mobile (responsive images)
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  width?: number,
  quality: number = 80
): string {
  if (!width) return baseUrl;
  
  const dpr = getDevicePixelRatio();
  const optimizedWidth = Math.ceil(width * dpr);
  
  // If the URL already has query params, append; otherwise add
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}w=${optimizedWidth}&q=${quality}`;
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): () => void {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    img.src = src;
    return () => {};
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
    ...options,
  });
  
  observer.observe(img);
  
  return () => observer.unobserve(img);
}

/**
 * Preload critical resources for mobile
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch',
  crossorigin?: boolean
): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Debounce function for mobile performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for mobile performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback (with fallback)
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers without requestIdleCallback
  return setTimeout(callback, options?.timeout || 1) as unknown as number;
}

/**
 * Cancel idle callback (with fallback)
 */
export function cancelIdleCallback(handle: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Optimize viewport for mobile
 */
export function optimizeViewport(): void {
  if (typeof document === 'undefined') return;
  
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;
  
  // Set optimal viewport for mobile
  viewport.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
  );
}

/**
 * Prevent zoom on double tap (iOS)
 */
export function preventDoubleTapZoom(): void {
  if (typeof document === 'undefined') return;
  
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );
}

/**
 * Enable hardware acceleration for better performance
 */
export function enableHardwareAcceleration(element: HTMLElement): void {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
}

/**
 * Disable hardware acceleration
 */
export function disableHardwareAcceleration(element: HTMLElement): void {
  element.style.transform = '';
  element.style.willChange = '';
}

/**
 * Get optimal chunk size for mobile networks
 */
export function getOptimalChunkSize(): number {
  const networkInfo = getNetworkInfo();
  
  if (isSlowNetwork() || isDataSaverEnabled()) {
    return 100 * 1024; // 100KB for slow networks
  }
  
  if (networkInfo?.effectiveType === '3g') {
    return 200 * 1024; // 200KB for 3G
  }
  
  return 500 * 1024; // 500KB for fast networks
}

/**
 * Check if device supports WebP images
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(false);
      return;
    }
    
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimal image format for device
 */
export async function getOptimalImageFormat(): Promise<'webp' | 'jpg' | 'png'> {
  if (await supportsWebP()) {
    return 'webp';
  }
  
  // Fallback to JPEG for better compression
  return 'jpg';
}

