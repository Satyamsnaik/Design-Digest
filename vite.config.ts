import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // This ensures assets are loaded like "./assets/file.js" instead of "/assets/file.js"
    // Critical for GitHub Pages or local testing
    base: './', 
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // Stringify the API key to inject it as a string literal into the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});