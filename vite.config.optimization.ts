import { defineConfig } from 'vite';

/**
 * Optimized Vite configuration for performance
 * This extends the base vite.config.ts with additional optimizations
 */

export const optimizationConfig = {
  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          'vendor-maps': [
            'leaflet',
            'mapbox-gl',
            '@googlemaps/js-api-loader',
          ],
          'vendor-charts': ['recharts'],
          'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei'],
          
          // Feature chunks
          'features-gamification': [
            './src/hooks/useGamification',
            './src/components/gamification/AchievementsPanel',
            './src/components/gamification/LeaderboardPanel',
          ],
          'features-analytics': [
            './src/components/analytics/AdvancedAnalytics',
            './src/hooks/useKPIData',
          ],
        },
      },
    },
    
    // Build optimization
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // Source maps
    sourcemap: false,
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'leaflet',
      'mapbox-gl',
    ],
    exclude: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  
  server: {
    hmr: {
      overlay: true,
    },
  },
};
