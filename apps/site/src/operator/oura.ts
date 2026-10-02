import { daysAgo, getJson, localDate } from './useFetch';

type Contributors = Record<string, number>;
interface DayScores {
	readiness?: { data: { score: number; contributors: Contributors }[] };
	sleep?: { data: { score: number; contributors: Contributors }[] };
	activity?: { data: { score: number; contributors: Contributors }[] };
}
interface OuraRange {
	dates?: Record<string, DayScores>;
}

export interface OuraDay {
	date: string;
	label: string;
	readiness: number | null;
	sleep: number | null;
	activity: number | null;
}

export interface OuraWeek {
	days: OuraDay[];
	/** Today's scores. Null when the ring hasn't synced today. */
	today: OuraDay | undefined;
	/** Today's readiness contributors, when there's a readiness score. */
	readinessContributors: Contributors | null;
}

const dayLabel = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
});

/** The last eight days of Oura scores, every day present, missing scores as null. */
export async function loadOuraWeek(signal: AbortSignal): Promise<OuraWeek> {
	const start = localDate(daysAgo(7));
	const end = localDate(new Date());
	const body = await getJson<OuraRange>(
		`https://fhudson.com/api/oura?start=${start}&end=${end}`,
		signal
	);
	if (!body.dates) throw new Error('Unexpected Oura response: no dates');
	const dates = body.dates;
	const days: OuraDay[] = Array.from({ length: 8 }, (_, i) => {
		const d = daysAgo(7 - i);
		const key = localDate(d);
		const scores = dates[key] as DayScores | undefined;
		return {
			date: key,
			label: dayLabel.format(d),
			readiness: scores?.readiness?.data[0]?.score ?? null,
			sleep: scores?.sleep?.data[0]?.score ?? null,
			activity: scores?.activity?.data[0]?.score ?? null,
		};
	});
	const todayScores = dates[end] as DayScores | undefined;
	return {
		days,
		today: days.at(-1),
		readinessContributors:
			todayScores?.readiness?.data[0]?.contributors ?? null,
	};
}
