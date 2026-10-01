import { useCallback, useState, type KeyboardEvent } from 'react';

export interface ChartFocusOptions {
	/** Number of positions along the main axis (points, bars, columns). */
	count: number;
	/** Rows, for two-dimensional charts such as heatmaps. */
	rows?: number;
}

/**
 * The active data position, driven by pointer and keyboard alike. Arrow keys move it,
 * Home and End jump to the ends, Escape clears it. Focus shows the last position.
 */
export function useChartFocus({ count, rows = 1 }: ChartFocusOptions) {
	const [active, setActive] = useState<{ index: number; row: number } | null>(
		null
	);
	const [fromKeyboard, setFromKeyboard] = useState(false);

	const move = useCallback(
		(dx: number, dy: number) => {
			setFromKeyboard(true);
			setActive((current) => {
				const start = current ?? {
					index: dx < 0 ? count - 1 : 0,
					row: 0,
				};
				if (!current) return start;
				return {
					index: Math.min(count - 1, Math.max(0, start.index + dx)),
					row: Math.min(rows - 1, Math.max(0, start.row + dy)),
				};
			});
		},
		[count, rows]
	);

	const onKeyDown = (e: KeyboardEvent) => {
		if (count === 0) return;
		const keys: Record<string, () => void> = {
			ArrowRight: () => {
				move(1, 0);
			},
			ArrowLeft: () => {
				move(-1, 0);
			},
			ArrowDown: () => {
				move(0, rows > 1 ? 1 : 0);
			},
			ArrowUp: () => {
				move(0, rows > 1 ? -1 : 0);
			},
			Home: () => {
				setFromKeyboard(true);
				setActive((c) => ({ index: 0, row: c?.row ?? 0 }));
			},
			End: () => {
				setFromKeyboard(true);
				setActive((c) => ({ index: count - 1, row: c?.row ?? 0 }));
			},
			Escape: () => {
				setActive(null);
			},
		};
		const action = keys[e.key] as (() => void) | undefined;
		if (action) {
			e.preventDefault();
			action();
		}
	};

	const point = useCallback((index: number | null, row = 0) => {
		setFromKeyboard(false);
		setActive(index === null ? null : { index, row });
	}, []);

	return {
		active,
		fromKeyboard,
		/** Set the active position from a pointer. */
		point,
		focusProps: {
			tabIndex: 0,
			onKeyDown,
			onBlur: () => {
				setActive(null);
			},
		},
	};
}
