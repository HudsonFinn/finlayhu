import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';

export default tseslint.config(
	{ ignores: ['**/dist', '**/node_modules'] },
	{
		extends: [
			// js.configs.strict,
			...tseslint.configs.strictTypeChecked,
			eslintConfigPrettier,
		],
		files: ['**/*.{ts,tsx}'],
		settings: { react: { version: '18.3' } },
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				// Finds the nearest tsconfig for each file, so every workspace is covered
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			...react.configs.recommended.rules,
			...react.configs['jsx-runtime'].rules,
		},
	},
	{
		// react-three-fiber JSX takes three.js props, which TypeScript already checks
		files: ['**/figures/**/*.tsx'],
		rules: { 'react/no-unknown-property': 'off' },
	}
);
