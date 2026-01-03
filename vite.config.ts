
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // This ensures assets are loaded like "./assets/file.js" instead of "/assets/file.js"
  // Critical for GitHub Pages or local testing
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
