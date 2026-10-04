/*
 * The plotter's timing rules (docs/plans/figures.md, Part 1), as plain functions of time.
 * Figures compute every frame from the clock's time, so any frame can be rendered on its own:
 * that's what lets the exporter step through an animation.
 */

/** Beats in ms. Every duration in a figure is a multiple of BEAT. */
export const BEAT = 400;
/** One build step: a stroke drawn, a node arriving. */
export const STEP = 2 * BEAT;
/** How long a finished build holds before it loops. */
export const HOLD = 4 * BEAT;

/** 0 → 1 across [start, start + length], clamped. Linear: the plotter's pen. */
export function progress(time: number, start: number, length = STEP) {
	return Math.min(1, Math.max(0, (time - start) / length));
}

/** A short ease-out, for things settling once drawn. */
export const settle = (p: number) => 1 - (1 - p) ** 3;

/** SVG props that draw a stroke on as `p` goes 0 → 1. Hidden until it starts, so no speck. */
export const drawOn = (p: number) => ({
	pathLength: 1,
	strokeDasharray: '1 1',
	strokeDashoffset: 1 - p,
	visibility: p > 0 ? ('visible' as const) : ('hidden' as const),
});

/**
 * The dash offset for flow along a line at `speed` px/s, wrapped to one dash period so the
 * number stays small. Negative moves dashes forward along the path.
 */
export const flowOffset = (time: number, speed: number, period: number) =>
	-(((time / 1000) * speed) % period);
