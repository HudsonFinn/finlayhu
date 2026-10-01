import { useLayoutEffect, useRef, useState } from 'react';

/**
 * The rendered width of a chart's container, so charts draw at real pixel size and their
 * text stays legible on phones instead of shrinking with a scaled viewBox.
 */
export function useChartWidth<T extends HTMLElement>(fallback = 600) {
	const ref = useRef<T>(null);
	const [width, setWidth] = useState(fallback);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || typeof ResizeObserver === 'undefined') return;
		const update = () => {
			const next = Math.round(el.getBoundingClientRect().width);
			if (next > 0) setWidth(next);
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => {
			observer.disconnect();
		};
	}, []);

	return [ref, width] as const;
}
