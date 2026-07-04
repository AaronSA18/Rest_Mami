import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '0e65-38-252-215-45.ngrok-free.app',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ]
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    // Enable CSS minification
    cssMinify: true,
    // Generate source maps for debugging (disabled in prod for performance)
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // Enable compression
    reportCompressedSize: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
