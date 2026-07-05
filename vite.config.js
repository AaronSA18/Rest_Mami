import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'f5cf-38-252-215-44.ngrok-free.app',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ],
    // Security headers for development
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    }
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
      output: {}
    },
    // Enable compression
    reportCompressedSize: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
