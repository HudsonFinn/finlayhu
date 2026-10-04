import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';

// The build's commit, shown as the revision in every page's title block
const commit = (() => {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'dev';
	}
})();

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	define: { __COMMIT__: JSON.stringify(commit) },
	assetsInclude: ['**/*.md', '88/*.webp'],
	// One React for the app and the workspace packages it imports
	resolve: { dedupe: ['react', 'react-dom'] },
	// Only lazy routes import these; pre-bundle them so the dev server doesn't re-optimise mid-visit
	optimizeDeps: {
		include: [
			'@fhudson/figures > three',
			'@fhudson/figures > @react-three/fiber',
		],
	},
});
