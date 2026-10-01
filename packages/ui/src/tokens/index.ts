/*
 * Token metadata for docs and tooling. Values live in styles/tokens.css only;
 * read them at runtime with getComputedStyle when you need them.
 */

export interface ColorToken {
	name: string;
	cssVar: `--sl-${string}`;
	use: string;
}

export const colorTokens: ColorToken[] = [
	{ name: 'paper', cssVar: '--sl-paper', use: 'Page background' },
	{ name: 'sheet', cssVar: '--sl-sheet', use: 'Panels and inputs' },
	{ name: 'ink', cssVar: '--sl-ink', use: 'Text and strong rules' },
	{
		name: 'ink-muted',
		cssVar: '--sl-ink-muted',
		use: 'Secondary text and labels',
	},
	{
		name: 'hairline',
		cssVar: '--sl-hairline',
		use: 'Dividers and panel borders',
	},
	{
		name: 'verdigris',
		cssVar: '--sl-verdigris',
		use: 'Accent, links, live signals, in service',
	},
	{
		name: 'on-verdigris',
		cssVar: '--sl-on-verdigris',
		use: 'Text on verdigris fills',
	},
	{ name: 'amber', cssVar: '--sl-amber', use: 'Warnings, isolated' },
	{ name: 'fault', cssVar: '--sl-fault', use: 'Errors, fault' },
];

/** Foreground/background pairs that must meet WCAG AA. `min` is the required ratio. */
export const contrastPairs: {
	fg: string;
	bg: string;
	min: number;
	use: string;
}[] = [
	{ fg: 'ink', bg: 'paper', min: 4.5, use: 'Body text' },
	{ fg: 'ink', bg: 'sheet', min: 4.5, use: 'Text in panels' },
	{ fg: 'ink-muted', bg: 'paper', min: 4.5, use: 'Labels' },
	{ fg: 'ink-muted', bg: 'sheet', min: 4.5, use: 'Labels in panels' },
	{ fg: 'verdigris', bg: 'paper', min: 4.5, use: 'Links' },
	{ fg: 'verdigris', bg: 'sheet', min: 4.5, use: 'Links in panels' },
	{ fg: 'on-verdigris', bg: 'verdigris', min: 4.5, use: 'Primary buttons' },
	{ fg: 'amber', bg: 'paper', min: 4.5, use: 'Warning text' },
	{ fg: 'amber', bg: 'sheet', min: 4.5, use: 'Warning text in panels' },
	{ fg: 'fault', bg: 'paper', min: 4.5, use: 'Error text' },
	{ fg: 'fault', bg: 'sheet', min: 4.5, use: 'Error text in panels' },
];

export const typeFaces = [
	{
		role: 'Display',
		cssVar: '--sl-font-display',
		family: 'Michroma',
		use: 'Headings and buttons. Uppercase, short.',
	},
	{
		role: 'Body',
		cssVar: '--sl-font-body',
		family: 'Hanken Grotesk',
		use: 'Running text and UI',
	},
	{
		role: 'Data',
		cssVar: '--sl-font-data',
		family: 'JetBrains Mono',
		use: 'Labels, numbers, code, title blocks',
	},
] as const;

export const typeScale = [
	{ token: 'h1', px: 40, use: 'Page titles' },
	{ token: 'h2', px: 30, use: 'Section titles' },
	{ token: 'h3', px: 22, use: 'Sub-sections' },
	{ token: 'body', px: 17, use: 'Post text' },
	{ token: 'ui', px: 15, use: 'Interface text' },
	{ token: 'small', px: 13, use: 'Secondary text' },
	{ token: 'label', px: 11, use: 'Labels and metadata' },
] as const;

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64] as const;

export const strokes = [
	{
		name: 'hairline',
		cssVar: '--sl-stroke-hairline',
		use: 'Dividers, panel borders',
	},
	{
		name: 'rule',
		cssVar: '--sl-stroke-rule',
		use: 'Strong rules, focus rings',
	},
	{
		name: 'busbar',
		cssVar: '--sl-stroke-busbar',
		use: 'Emphasis lines, the node mark',
	},
] as const;

/** WCAG 2 contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
	const luminance = (hex: string) => {
		const [r, g, bl] = [1, 3, 5].map((i) => {
			const c = parseInt(hex.slice(i, i + 2), 16) / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}
