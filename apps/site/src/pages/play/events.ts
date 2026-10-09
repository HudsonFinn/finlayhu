import type { GridEvent } from './simulation';

/** Whether an event leaves the grid short (supply lost or demand added). */
export const isShortfall = (e: GridEvent) =>
	(e.driver === 'demand' ? -e.delta : e.delta) < 0;

/** Trips (sudden shortfalls) are faults; slow shortfalls are warnings; the rest help. */
export function eventTone(e: GridEvent) {
	if (!isShortfall(e)) return 'text-verdigris';
	return e.over === 0 ? 'text-fault' : 'text-amber';
}

export function eventImpact(e: GridEvent) {
	const sign = e.delta > 0 ? '+' : '−';
	const what = e.driver === 'demand' ? 'demand' : e.driver;
	return `${sign}${(Math.abs(e.delta) / 1000).toFixed(1)} GW ${what}`;
}
