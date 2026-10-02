import { useEffect, useRef, useState } from 'react';

/** Matches @fhudson/ui's State, so a feed's state can drive a Status lamp directly. */
export type FeedState = 'in-service' | 'isolated' | 'fault' | 'unknown';

export interface Feed<T> {
	/** The last good data. Kept through errors, so a failing feed still shows its last reading. */
	data: T | undefined;
	state: FeedState;
	/** When the newest reading applies. */
	latest: Date | undefined;
	error: Error | undefined;
}

/**
 * - unknown: nothing has loaded yet
 * - fault: the last request failed
 * - isolated: the newest reading is older than `staleAfter`
 * - in-service: fresh
 */
export function feedState({
	hasData,
	error,
	latest,
	now,
	staleAfter,
}: {
	hasData: boolean;
	error: Error | undefined;
	latest: Date | undefined;
	now: number;
	staleAfter: number;
}): FeedState {
	if (error) return 'fault';
	if (!hasData || !latest) return 'unknown';
	return now - latest.getTime() > staleAfter ? 'isolated' : 'in-service';
}

export interface PollingOptions<T> {
	/** How often to fetch, in ms. */
	interval: number;
	/** How old the newest reading may be before the feed counts as stale, in ms. */
	staleAfter: number;
	/** The time the newest reading in the data applies to. */
	latestOf: (data: T) => Date | undefined;
}

/** Fetches on mount and then every `interval`, pausing while the tab is hidden. */
export function usePolling<T>(
	fetcher: (signal: AbortSignal) => Promise<T>,
	{ interval, staleAfter, latestOf }: PollingOptions<T>
): Feed<T> {
	const [data, setData] = useState<T>();
	const [error, setError] = useState<Error>();
	const [now, setNow] = useState(() => Date.now());
	const fetcherRef = useRef(fetcher);
	fetcherRef.current = fetcher;

	useEffect(() => {
		let controller: AbortController | undefined;
		let timer: ReturnType<typeof setInterval> | undefined;

		const load = async () => {
			controller?.abort();
			controller = new AbortController();
			try {
				const next = await fetcherRef.current(controller.signal);
				setData(next);
				setError(undefined);
			} catch (e) {
				if ((e as Error).name !== 'AbortError') setError(e as Error);
			}
			setNow(Date.now());
		};

		const start = () => {
			void load();
			timer = setInterval(() => {
				void load();
			}, interval);
		};
		const stop = () => {
			clearInterval(timer);
			controller?.abort();
		};
		const onVisibility = () => {
			if (document.hidden) stop();
			else start();
		};

		start();
		document.addEventListener('visibilitychange', onVisibility);
		// Re-check staleness even when no new data arrives
		const clock = setInterval(() => {
			setNow(Date.now());
		}, 15_000);
		return () => {
			stop();
			clearInterval(clock);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [interval]);

	const latest = data === undefined ? undefined : latestOf(data);
	return {
		data,
		latest,
		error,
		state: feedState({
			hasData: data !== undefined,
			error,
			latest,
			now,
			staleAfter,
		}),
	};
}
