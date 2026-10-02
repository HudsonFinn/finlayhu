import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The rendered width of a chart's container, so charts draw at real pixel size and their
 * text stays legible on phones instead of shrinking with a scaled viewBox.
 *
 * Returns a callback ref, not a ref object: the measured element can mount later than the
 * component (a chart shows a placeholder while loading), and a callback ref measures it
 * whenever it appears.
 */
export function useChartWidth(fallback = 600) {
	const [width, setWidth] = useState(fallback);
	const observer = useRef<ResizeObserver | null>(null);

	const ref = useCallback((el: HTMLElement | null) => {
		observer.current?.disconnect();
		observer.current = null;
		if (!el || typeof ResizeObserver === 'undefined') return;
		const update = () => {
			const next = Math.round(el.getBoundingClientRect().width);
			if (next > 0) setWidth(next);
		};
		update();
		observer.current = new ResizeObserver(update);
		observer.current.observe(el);
	}, []);

	useEffect(
		() => () => {
			observer.current?.disconnect();
		},
		[]
	);

	return [ref, width] as const;
}
