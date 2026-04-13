import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // In Docker, frontend container reaches backend via service name "backend".
      // The browser calls /api/... → Vite proxies it to http://backend:3001/api/...
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://backend:3001',
        changeOrigin: true,
      },
    },
  },
});
