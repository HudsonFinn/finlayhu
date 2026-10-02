import {
	fetchCarbonIntensity,
	fetchDemand,
	fetchFrequency,
	fetchGenerationMix,
	type CarbonReading,
	type FuelShare,
	type Reading,
} from './sources';
import { usePolling } from './usePolling';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const last = (rows: { time: Date }[]) => rows[rows.length - 1]?.time;

/** System frequency for the last hour. Elexon publishes every 15 s, about two minutes behind. */
export function useFrequency() {
	return usePolling<Reading[]>(
		(signal) =>
			fetchFrequency(new Date(Date.now() - HOUR), new Date(), signal),
		{ interval: 15 * SECOND, staleAfter: 5 * MINUTE, latestOf: last }
	);
}

/** Transmission demand for the last six hours, every 5 minutes. */
export function useDemand() {
	return usePolling<Reading[]>(
		(signal) =>
			fetchDemand(new Date(Date.now() - 6 * HOUR), new Date(), signal),
		{ interval: 5 * MINUTE, staleAfter: 20 * MINUTE, latestOf: last }
	);
}

/** Today's carbon intensity by half hour. */
export function useCarbonIntensity() {
	return usePolling<CarbonReading[]>(fetchCarbonIntensity, {
		interval: 5 * MINUTE,
		staleAfter: 90 * MINUTE,
		latestOf: last,
	});
}

/** The current half hour's generation mix. */
export function useGenerationMix() {
	return usePolling<{ time: Date; mix: FuelShare[] }>(fetchGenerationMix, {
		interval: 5 * MINUTE,
		staleAfter: 90 * MINUTE,
		latestOf: (d) => d.time,
	});
}
