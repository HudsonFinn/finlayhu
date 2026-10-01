/** Series colours, in their fixed order. Never cycled: past six, fold into "Other". */
export const SERIES_COLORS = [1, 2, 3, 4, 5, 6].map(
	(n) => `var(--sl-series-${String(n)})`
);

/** Colour for the "Other" series and anything past the sixth. */
export const OTHER_COLOR = 'var(--sl-ink-muted)';

export const seriesColor = (index: number) =>
	SERIES_COLORS[index] ?? OTHER_COLOR;

/** Sequential ramp steps, light to dark (flipped in dark mode by the tokens). */
export const SEQUENTIAL = [1, 2, 3, 4, 5, 6, 7].map(
	(n) => `var(--sl-seq-${String(n)})`
);

export const INK = 'var(--sl-ink)';
export const MUTED = 'var(--sl-ink-muted)';
export const HAIRLINE = 'var(--sl-hairline)';
export const PAPER = 'var(--sl-paper)';
export const LABEL_FONT = { font: '10px var(--sl-font-data)' } as const;

/** Series marker shapes, in slot order, so identity never rests on colour alone. */
export const SHAPES = ['square', 'diamond', 'triangle'] as const;
