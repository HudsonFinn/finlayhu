import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ClockContext } from './context';
import { HOLD } from './time';

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

/** The frame a still shows: the finished build, or the start of a continuous animation. */
export const stillTime = (duration?: number) =>
	duration ? duration - HOLD : 0;

/**
 * One clock per figure, in ms. With a duration it loops; without, it runs on.
 * Reduced motion starts it paused on the still. Inside a fixed ClockContext (the exporter)
 * it shows exactly that time and never ticks.
 */
export function useClock(duration?: number) {
	const { fixedTime } = useContext(ClockContext);
	const reduced = useReducedMotion();
	const [time, setTime] = useState(() => (reduced ? stillTime(duration) : 0));
	const [playing, setPlaying] = useState(!reduced);
	const last = useRef<number | null>(null);
	const fixed = fixedTime !== undefined;

	useEffect(() => {
		setPlaying(!reduced);
		if (reduced) setTime(stillTime(duration));
	}, [reduced, duration]);

	useEffect(() => {
		if (!playing || fixed) return;
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
	}, [playing, fixed, duration]);

	const toggle = useCallback(() => {
		setPlaying((p) => !p);
	}, []);

	return {
		time: fixed ? fixedTime : time,
		setTime,
		playing: playing && !fixed,
		toggle,
		duration,
		fixed,
	};
}

export type Clock = ReturnType<typeof useClock>;
