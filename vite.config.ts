import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Clean imports like `import { useWindowStore } from '@/state/windows'`
      // instead of relative `../../state/windows` everywhere.
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Faster builds: don't break on warnings about chunk size for our 3D assets.
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
