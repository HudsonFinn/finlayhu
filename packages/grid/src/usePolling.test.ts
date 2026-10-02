import { describe, expect, test } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { feedState, usePolling } from './usePolling';

const MINUTE = 60_000;

describe('feedState', () => {
	const now = Date.UTC(2026, 9, 2, 12);
	const at = (minutesAgo: number) => new Date(now - minutesAgo * MINUTE);
	test('is unknown before anything loads', () => {
		expect(
			feedState({
				hasData: false,
				error: undefined,
				latest: undefined,
				now,
				staleAfter: 5 * MINUTE,
			})
		).toBe('unknown');
	});
	test('is in service when fresh and isolated when stale', () => {
		expect(
			feedState({
				hasData: true,
				error: undefined,
				latest: at(2),
				now,
				staleAfter: 5 * MINUTE,
			})
		).toBe('in-service');
		expect(
			feedState({
				hasData: true,
				error: undefined,
				latest: at(6),
				now,
				staleAfter: 5 * MINUTE,
			})
		).toBe('isolated');
	});
	test('is a fault when the last request failed, even with data', () => {
		expect(
			feedState({
				hasData: true,
				error: new Error('503'),
				latest: at(1),
				now,
				staleAfter: 5 * MINUTE,
			})
		).toBe('fault');
	});
});

describe('usePolling', () => {
	test('loads data and reports in service', async () => {
		const { result } = renderHook(() =>
			usePolling(
				() => Promise.resolve([{ time: new Date(), value: 50.01 }]),
				{
					interval: 60_000,
					staleAfter: 5 * MINUTE,
					latestOf: (rows) => rows[rows.length - 1]?.time,
				}
			)
		);
		await waitFor(() => {
			expect(result.current.state).toBe('in-service');
		});
		expect(result.current.data?.[0]?.value).toBe(50.01);
	});

	test('a failing source reports a fault', async () => {
		const { result } = renderHook(() =>
			usePolling(() => Promise.reject(new Error('503')), {
				interval: 60_000,
				staleAfter: 5 * MINUTE,
				latestOf: () => undefined,
			})
		);
		await waitFor(() => {
			expect(result.current.state).toBe('fault');
		});
		expect(result.current.data).toBeUndefined();
	});
});
