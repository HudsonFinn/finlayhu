import { useEffect, useState } from 'react';

const tokenNames = [
	'paper',
	'sheet',
	'ink',
	'ink-muted',
	'hairline',
	'verdigris',
] as const;
export type TokenColours = Record<(typeof tokenNames)[number], string>;

function readTokens(): TokenColours {
	const styles = getComputedStyle(document.documentElement);
	return Object.fromEntries(
		tokenNames.map((name) => [
			name,
			styles.getPropertyValue(`--sl-${name}`).trim(),
		])
	) as TokenColours;
}

/**
 * Token colours as values, for places CSS variables can't reach (WebGL). Re-reads when the
 * theme changes, by data-theme or by the system setting.
 */
export function useTokenColours() {
	const [colours, setColours] = useState(readTokens);
	useEffect(() => {
		const update = () => {
			setColours(readTokens());
		};
		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		media.addEventListener('change', update);
		return () => {
			observer.disconnect();
			media.removeEventListener('change', update);
		};
	}, []);
	return colours;
}
