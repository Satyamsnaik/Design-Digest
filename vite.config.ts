import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
		react(),
		tailwindcss() as any,
	],

	// REQUIRED for GitHub Pages
	base: '/Design-Digest/',

	build: {
		outDir: 'dist',
		sourcemap: false,
	},
})
