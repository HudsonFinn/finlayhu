/*
 * Public GB grid data sources. Both allow requests from any browser origin.
 * - Elexon BMRS (Insights Solution), open data licence: https://data.elexon.co.uk
 * - Carbon Intensity API (NESO and University of Oxford), CC BY 4.0: https://carbonintensity.org.uk
 */

export interface Reading {
	/** When the value applies (UTC). */
	time: Date;
	value: number;
}

export type CarbonIndex =
	| 'very low'
	| 'low'
	| 'moderate'
	| 'high'
	| 'very high';

export interface CarbonReading extends Reading {
	/** The forecast for the half hour; `value` is the actual where published, else the forecast. */
	forecast: number;
	index: CarbonIndex;
}

export interface FuelShare {
	fuel: string;
	percent: number;
}

const ELEXON = 'https://data.elexon.co.uk/bmrs/api/v1';
const CARBON = 'https://api.carbonintensity.org.uk';

const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
	const response = await fetch(url, { signal });
	if (!response.ok)
		throw new Error(`${url} returned ${String(response.status)}`);
	return response.json();
}

// Parsers are separate from fetching so they can be tested against recorded responses.

/** Elexon FREQ: system frequency in Hz, one reading every 15 seconds. */
export function parseFrequency(body: unknown): Reading[] {
	const rows =
		(body as { data?: { measurementTime: string; frequency: number }[] })
			.data ?? [];
	return rows
		.map((r) => ({ time: new Date(r.measurementTime), value: r.frequency }))
		.sort((a, b) => a.time.getTime() - b.time.getTime());
}

/** Elexon demand outturn summary: transmission demand in MW, every 5 minutes. */
export function parseDemand(body: unknown): Reading[] {
	const rows = (Array.isArray(body) ? body : []) as {
		startTime: string;
		demand: number;
	}[];
	return rows
		.map((r) => ({ time: new Date(r.startTime), value: r.demand }))
		.sort((a, b) => a.time.getTime() - b.time.getTime());
}

/** Carbon intensity by half hour. Uses the actual where published, otherwise the forecast. */
export function parseCarbonIntensity(body: unknown): CarbonReading[] {
	const rows =
		(
			body as {
				data?: {
					from: string;
					intensity: {
						forecast: number;
						actual: number | null;
						index: CarbonIndex;
					};
				}[];
			}
		).data ?? [];
	return rows.map((r) => ({
		time: new Date(r.from),
		value: r.intensity.actual ?? r.intensity.forecast,
		forecast: r.intensity.forecast,
		index: r.intensity.index,
	}));
}

/** Current generation mix by fuel, as percentages, largest first. */
export function parseGenerationMix(body: unknown): {
	time: Date;
	mix: FuelShare[];
} {
	const data = (
		body as {
			data?: {
				from: string;
				generationmix: { fuel: string; perc: number }[];
			};
		}
	).data;
	return {
		time: new Date(data?.from ?? 0),
		mix: (data?.generationmix ?? [])
			.map((g) => ({ fuel: g.fuel, percent: g.perc }))
			.sort((a, b) => b.percent - a.percent),
	};
}

export const fetchFrequency = async (
	from: Date,
	to: Date,
	signal?: AbortSignal
) =>
	parseFrequency(
		await getJson(
			`${ELEXON}/system/frequency?from=${iso(from)}&to=${iso(to)}&format=json`,
			signal
		)
	);

export const fetchDemand = async (from: Date, to: Date, signal?: AbortSignal) =>
	parseDemand(
		await getJson(
			`${ELEXON}/demand/outturn/summary?from=${iso(from)}&to=${iso(to)}&format=json`,
			signal
		)
	);

/** Today's half hours, in UK time as the API defines "today". */
export const fetchCarbonIntensity = async (signal?: AbortSignal) =>
	parseCarbonIntensity(await getJson(`${CARBON}/intensity/date`, signal));

export const fetchGenerationMix = async (signal?: AbortSignal) =>
	parseGenerationMix(await getJson(`${CARBON}/generation`, signal));
