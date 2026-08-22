import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 8787 es el puerto por default de `wrangler dev`
      '/api': 'http://localhost:8787',
    },
  },
});
