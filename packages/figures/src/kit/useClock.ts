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
 * One clock per figure, in ms.
 *
 * - Looping (the default): with a duration it loops; without, it runs on. Reduced motion
 *   starts it paused on the still.
 * - `once`: waits at the start until `start()` (Frame calls it when the figure first scrolls
 *   into view), plays the build once and stops on its finished frame; `restart()` replays it.
 *   Reduced motion shows the finished frame straight away.
 *
 * Inside a fixed ClockContext (the exporter) it shows exactly that time and never ticks.
 */
export function useClock(duration?: number, { once = false } = {}) {
	const { fixedTime } = useContext(ClockContext);
	const reduced = useReducedMotion();
	const end = stillTime(duration);
	const [time, setTime] = useState(() => (reduced ? end : 0));
	const [playing, setPlaying] = useState(!reduced && !once);
	const [started, setStarted] = useState(reduced || !once);
	const last = useRef<number | null>(null);
	const fixed = fixedTime !== undefined;

	useEffect(() => {
		if (!reduced) return;
		setPlaying(false);
		setStarted(true);
		setTime(end);
	}, [reduced, end]);

	useEffect(() => {
		if (!playing || fixed) return;
		let frame = requestAnimationFrame(function tick(now) {
			const dt = last.current === null ? 0 : now - last.current;
			last.current = now;
			setTime((t) =>
				once
					? Math.min(end, t + dt)
					: duration
						? (t + dt) % duration
						: t + dt
			);
			frame = requestAnimationFrame(tick);
		});
		return () => {
			cancelAnimationFrame(frame);
			last.current = null;
		};
	}, [playing, fixed, duration, once, end]);

	// A once-through build stops on its finished frame
	useEffect(() => {
		if (once && playing && time >= end) setPlaying(false);
	}, [once, playing, time, end]);

	const toggle = useCallback(() => {
		setPlaying((p) => !p);
	}, []);

	const start = useCallback(() => {
		setStarted((was) => {
			if (!was) setPlaying(true);
			return true;
		});
	}, []);

	const restart = useCallback(() => {
		setStarted(true);
		setTime(0);
		setPlaying(!reduced);
		if (reduced) setTime(end);
	}, [reduced, end]);

	return {
		time: fixed ? fixedTime : time,
		setTime,
		playing: playing && !fixed,
		toggle,
		duration,
		fixed,
		once,
		started,
		start,
		restart,
	};
}

export type Clock = ReturnType<typeof useClock>;
