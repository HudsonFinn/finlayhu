import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	// One React for the app and the workspace packages it imports
	resolve: { dedupe: ['react', 'react-dom'] },
	// Figures load lazily; pre-bundle three.js so the dev server doesn't re-optimise mid-visit
	optimizeDeps: {
		include: [
			'@fhudson/figures > three',
			'@fhudson/figures > @react-three/fiber',
		],
	},
});
