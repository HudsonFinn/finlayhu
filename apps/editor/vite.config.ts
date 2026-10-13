import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { postsApi } from './server/postsApi';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		// The editor reads and writes the site's real posts, through the dev server
		postsApi({
			postsDir: here('../site/src/posts'),
			registry: here('../site/src/data/posts.ts'),
			reviewsFile: here('./reviews.json'),
		}),
	],
	// One React for the app and the workspace packages it imports
	resolve: { dedupe: ['react', 'react-dom'] },
});
