import { daysAgo, getJson, localDate } from './useFetch';

interface RawActivity {
	id: number;
	name: string;
	type: string;
	sport_type?: string;
	start_date_local?: string;
	date?: string;
	distance: number;
	moving_time: number;
}

export interface Activity {
	id: number;
	name: string;
	type: string;
	date: string;
	/** Metres. */
	distance: number;
	/** Seconds. */
	movingTime: number;
}

/** The last 90 days of Strava activities, newest first. Duplicates from the API are removed. */
export async function loadActivities(signal: AbortSignal): Promise<Activity[]> {
	const start = localDate(daysAgo(89));
	const end = localDate(new Date());
	const body = await getJson<{ activities?: RawActivity[] }>(
		`https://fhudson.com/api/strava?start=${start}&end=${end}`,
		signal
	);
	const byId = new Map<number, Activity>();
	for (const a of body.activities ?? []) {
		byId.set(a.id, {
			id: a.id,
			name: a.name,
			type: a.sport_type ?? a.type,
			date: (a.start_date_local ?? a.date ?? '').slice(0, 10),
			distance: a.distance,
			movingTime: a.moving_time,
		});
	}
	return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
}

/** "RockClimbing" -> "Rock climbing" */
export const activityLabel = (type: string) =>
	type
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/^./, (c) => c.toUpperCase())
		.replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);
