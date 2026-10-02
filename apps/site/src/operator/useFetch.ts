import { useEffect, useState } from 'react';

export type LoadState<T> =
	| { status: 'loading' }
	| { status: 'error'; error: Error }
	| { status: 'ready'; data: T };

/** Fetches once on mount. For data that changes daily, not live feeds (those use @fhudson/grid). */
export function useFetch<T>(
	load: (signal: AbortSignal) => Promise<T>
): LoadState<T> {
	const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal)
			.then((data) => {
				setState({ status: 'ready', data });
			})
			.catch((e: unknown) => {
				if ((e as Error).name !== 'AbortError')
					setState({ status: 'error', error: e as Error });
			});
		return () => {
			controller.abort();
		};
		// Load once; callers pass a stable loader
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return state;
}

export async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
	const response = await fetch(url, { signal });
	if (!response.ok)
		throw new Error(`${url} returned ${String(response.status)}`);
	return (await response.json()) as T;
}

/** YYYY-MM-DD in the viewer's local time. */
export const localDate = (d: Date) =>
	[
		d.getFullYear(),
		String(d.getMonth() + 1).padStart(2, '0'),
		String(d.getDate()).padStart(2, '0'),
	].join('-');

export const daysAgo = (n: number) => {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d;
};
