import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory (default is "dist")
    assetsDir: 'assets', // Directory for static assets within dist
  },
});

