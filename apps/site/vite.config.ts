import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	assetsInclude: ['**/*.md', '88/*.webp'],
	// One React for the app and the workspace packages it imports
	resolve: { dedupe: ['react', 'react-dom'] },
});
