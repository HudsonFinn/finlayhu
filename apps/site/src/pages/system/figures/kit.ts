/*
 * The motion rules from docs/plans/figures.md, as hooks and helpers. These move into
 * @fhudson/figures in Phase 2; the exporter will drive `useClock` frame by frame.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Beats in ms. Every duration in a figure is a multiple of BEAT. */
export const BEAT = 400;
export const STEP = 2 * BEAT;
export const HOLD = 4 * BEAT;

const reducedQuery = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
	const [reduced, setReduced] = useState(
		() => window.matchMedia(reducedQuery).matches
	);
	useEffect(() => {
		const media = window.matchMedia(reducedQuery);
		const update = () => {
			setReduced(media.matches);
		};
		media.addEventListener('change', update);
		return () => {
			media.removeEventListener('change', update);
		};
	}, []);
	return reduced;
}

/**
 * One clock per figure, in ms. With a duration it loops; without, it runs on.
 * Reduced motion starts it paused, on the final frame of a build.
 */
export function useClock(duration?: number) {
	const reduced = useReducedMotion();
	const [time, setTime] = useState(() =>
		reduced && duration ? duration - HOLD : 0
	);
	const [playing, setPlaying] = useState(!reduced);
	const last = useRef<number | null>(null);

	useEffect(() => {
		setPlaying(!reduced);
		if (reduced && duration) setTime(duration - HOLD);
	}, [reduced, duration]);

	useEffect(() => {
		if (!playing) return;
		let frame = requestAnimationFrame(function tick(now) {
			const dt = last.current === null ? 0 : now - last.current;
			last.current = now;
			setTime((t) => (duration ? (t + dt) % duration : t + dt));
			frame = requestAnimationFrame(tick);
		});
		return () => {
			cancelAnimationFrame(frame);
			last.current = null;
		};
	}, [playing, duration]);

	const toggle = useCallback(() => {
		setPlaying((p) => !p);
	}, []);

	return { time, setTime, playing, toggle };
}

/** 0 → 1 across [start, start + length], clamped. Linear: the plotter's pen. */
export function progress(time: number, start: number, length = STEP) {
	return Math.min(1, Math.max(0, (time - start) / length));
}

/** A short ease-out, for things settling once drawn. */
export const settle = (p: number) => 1 - (1 - p) ** 3;

/** Props that draw a stroke on: use with pathLength={1}. */
export const drawOn = (p: number) => ({
	pathLength: 1,
	strokeDasharray: '1 1',
	strokeDashoffset: 1 - p,
});

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
