declare module '*.md' {
	const value: string;
	export default value;
}

/** The git commit the site was built from (see vite.config.ts). */
declare const __COMMIT__: string;
