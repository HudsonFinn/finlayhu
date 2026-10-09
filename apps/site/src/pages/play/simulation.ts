/*
 * Hold 50 Hz: a toy model of GB system frequency. Generation and demand must match every second;
 * any gap speeds up or slows down every spinning machine on the grid, and frequency moves.
 *
 * df/dt = (generation − demand) / INERTIA, with demand easing slightly as frequency falls (load
 * damping). Time runs fast and the numbers are rounded for play, but the shape is the real one.
 */

/** MW of imbalance that moves frequency by 1 Hz per second. Sets how fast trouble arrives. */
export const INERTIA = 25_000;
/** Demand falls this fraction per Hz below 50, as motors slow down. */
export const LOAD_DAMPING = 0.02;
/** How long a shift lasts, in seconds. */
export const SHIFT = 120;
/** Below this, demand disconnection starts and the shift is over. */
export const LOW_TRIP = 48.8;
/** Above this, generators' overspeed protection trips them and the shift is over. */
export const HIGH_TRIP = 52;

export type UnitId = 'battery' | 'hydro' | 'gas';

export interface UnitSpec {
	id: UnitId;
	label: string;
	/** Negative means charging or pumping. */
	min: number;
	max: number;
	/** How fast output can change, MW per second. */
	ramp: number;
	/** g CO₂ per kWh generated. */
	carbon: number;
	/** Storage size in MWh. Without it, the fuel never runs out. */
	energy?: number;
	note: string;
}

export const UNITS: UnitSpec[] = [
	{
		id: 'battery',
		label: 'Batteries',
		min: -2500,
		max: 2500,
		ramp: 2500,
		carbon: 0,
		energy: 25,
		note: 'Instant, but empties in seconds',
	},
	{
		id: 'hydro',
		label: 'Pumped hydro',
		min: -1500,
		max: 2000,
		ramp: 400,
		carbon: 0,
		energy: 60,
		note: 'Quick, with a reservoir to manage',
	},
	{
		id: 'gas',
		label: 'Gas (CCGT)',
		min: 0,
		max: 24_000,
		ramp: 120,
		carbon: 360,
		note: 'Plenty of it, but slow to move',
	},
];

/** Sources the operator can't dispatch in this game. */
export type FixedSource = 'nuclear' | 'wind' | 'solar' | 'imports' | 'other';
export type Driver = FixedSource | 'demand';

export interface Base extends Record<Driver, number> {
	/** Where this starting point came from. */
	source: 'standard' | 'live';
}

export interface Place {
	name: string;
	lon: number;
	lat: number;
}

export interface GridEvent {
	at: number;
	/** Seconds to fully apply; 0 is a step, like a trip. */
	over: number;
	driver: Driver;
	delta: number;
	/** A few words for the map. */
	title: string;
	message: string;
	/** Where it happens, for the map. */
	place: Place;
}

/** The shift: an evening peak with trips, a wind lull and a half-time surge. */
export const EVENTS: GridEvent[] = [
	{
		at: 6,
		over: 20,
		driver: 'demand',
		delta: 1500,
		title: 'Evening peak',
		message: 'Evening peak building: demand rising',
		place: { name: 'London', lon: -0.13, lat: 51.51 },
	},
	{
		at: 15,
		over: 90,
		driver: 'solar',
		delta: -2000,
		title: 'Sunset',
		message: 'Sun going down: solar fading',
		place: { name: 'Solar across the south', lon: -1.8, lat: 51.15 },
	},
	{
		at: 28,
		over: 0,
		driver: 'imports',
		delta: -1000,
		title: 'Interconnector trip',
		message: 'Interconnector trip: 1 GW of imports lost',
		place: { name: 'IFA, Sellindge', lon: 0.98, lat: 51.11 },
	},
	{
		at: 45,
		over: 15,
		driver: 'wind',
		delta: -2500,
		title: 'Wind lull',
		message: 'Wind dropping across Scotland',
		place: { name: 'Scottish wind farms', lon: -4.2, lat: 57.1 },
	},
	{
		at: 62,
		over: 4,
		driver: 'demand',
		delta: 1200,
		title: 'Half-time',
		message: 'Half-time: a million kettles go on',
		place: { name: 'Midlands and north', lon: -1.9, lat: 52.9 },
	},
	{
		at: 72,
		over: 6,
		driver: 'demand',
		delta: -1200,
		title: 'Second half',
		message: 'Second half kicks off: kettles done',
		place: { name: 'Midlands and north', lon: -1.9, lat: 52.9 },
	},
	{
		at: 85,
		over: 0,
		driver: 'nuclear',
		delta: -1200,
		title: 'Reactor trip',
		message: 'Reactor trip: 1.2 GW offline',
		place: { name: 'Heysham', lon: -2.92, lat: 54.03 },
	},
	{
		at: 100,
		over: 6,
		driver: 'wind',
		delta: 2000,
		title: 'Gust front',
		message: 'Gust front: wind surging',
		place: { name: 'Dogger Bank', lon: 1.9, lat: 54.75 },
	},
];

export const STANDARD_BASE: Base = {
	source: 'standard',
	demand: 30_000,
	nuclear: 4500,
	wind: 9000,
	solar: 2000,
	imports: 4000,
	other: 1500,
};

export interface UnitState {
	output: number;
	target: number;
	/** MWh stored, for units with storage. */
	stored: number;
}

export type Outcome =
	| { kind: 'running' }
	| { kind: 'complete' }
	| { kind: 'tripped'; reason: string };

export interface GridState {
	t: number;
	/** Hz */
	f: number;
	/** Hz per second, for the readout. */
	rocof: number;
	base: Base;
	/** This shift's events, fitted to its starting point. */
	events: GridEvent[];
	units: Record<UnitId, UnitState>;
	score: number;
	/** Seconds spent within ±0.2 Hz. */
	inBand: number;
	/** Tonnes CO₂ from dispatched gas. */
	tonnes: number;
	/** MWh generated in total, for average intensity. */
	energy: number;
	/** Events that have started, newest last. */
	log: GridEvent[];
	outcome: Outcome;
}

const clamp = (v: number, lo: number, hi: number) =>
	Math.min(hi, Math.max(lo, v));

/** A little weather and a little noise, so the operator always has something to do. */
const wiggle = (driver: Driver, t: number) => {
	if (driver === 'demand')
		return (
			150 * Math.sin(t * 0.7) +
			90 * Math.sin(t * 1.9 + 1) +
			60 * Math.sin(t * 3.3 + 2)
		);
	if (driver === 'wind')
		return 200 * Math.sin(t * 0.37) + 120 * Math.sin(t * 1.1 + 2);
	return 0;
};

/** One driver's value at time t: its base, every event so far, and noise. Never negative. */
export function driverAt(
	base: Base,
	driver: Driver,
	t: number,
	events = EVENTS
) {
	let value = base[driver];
	for (const e of events) {
		if (e.driver !== driver || t < e.at) continue;
		const share = e.over === 0 ? 1 : Math.min(1, (t - e.at) / e.over);
		value += e.delta * share;
	}
	return Math.max(0, value + wiggle(driver, t));
}

const FIXED: FixedSource[] = ['nuclear', 'wind', 'solar', 'imports', 'other'];

export const fixedAt = (base: Base, t: number, events = EVENTS) =>
	FIXED.reduce((sum, s) => sum + driverAt(base, s, t, events), 0);

/** Drops one source can't cover are left out: no interconnector trip with nothing importing. */
export const eventsFor = (base: Base) =>
	EVENTS.filter((e) => e.delta > 0 || base[e.driver] >= -e.delta);

/** Starts balanced: gas covers whatever the fixed sources don't, at 50 Hz exactly. */
export function initialState(base: Base = STANDARD_BASE): GridState {
	const events = eventsFor(base);
	const gas = clamp(
		driverAt(base, 'demand', 0, events) - fixedAt(base, 0, events),
		0,
		24_000
	);
	const unit = (id: UnitId, output: number): UnitState => {
		const spec = UNITS.find((u) => u.id === id);
		return { output, target: output, stored: (spec?.energy ?? 0) * 0.6 };
	};
	return {
		t: 0,
		f: 50,
		rocof: 0,
		base,
		events,
		units: {
			battery: unit('battery', 0),
			hydro: unit('hydro', 0),
			gas: unit('gas', gas),
		},
		score: 0,
		inBand: 0,
		tonnes: 0,
		energy: 0,
		log: [],
		outcome: { kind: 'running' },
	};
}

/**
 * Builds a starting point from a live demand reading and generation mix (percent by fuel).
 * Gas is left out: the operator dispatches it. If fixed sources alone would cover nearly all of
 * demand, wind is constrained off so gas starts with room to move both ways.
 */
export function liveBase(
	demand: number,
	mix: { fuel: string; percent: number }[]
): Base {
	const share = (fuel: string) =>
		(mix.find((m) => m.fuel === fuel)?.percent ?? 0) / 100;
	const base: Base = {
		source: 'live',
		demand,
		nuclear: demand * share('nuclear'),
		wind: demand * share('wind'),
		solar: demand * share('solar'),
		// The mix reports exports as 0. Assume at least one link is importing, so it can trip
		imports: Math.max(1000, demand * share('imports')),
		other:
			demand *
			(share('biomass') +
				share('coal') +
				share('hydro') +
				share('other')),
	};
	const room = demand - fixedAt(base, 0) - 3000;
	if (room < 0) base.wind = Math.max(0, base.wind + room);
	return base;
}

export const generationOf = (s: GridState) =>
	fixedAt(s.base, s.t, s.events) +
	UNITS.reduce((sum, u) => sum + s.units[u.id].output, 0);

/** Demand as the grid sees it: lower when frequency sags, higher when it runs fast. */
export const loadOf = (s: GridState) =>
	driverAt(s.base, 'demand', s.t, s.events) * (1 + LOAD_DAMPING * (s.f - 50));

/** Points per second for where frequency sits: normal band, statutory limits, or outside. */
export function pointsFor(f: number) {
	const off = Math.abs(f - 50);
	if (off <= 0.2) return 10;
	if (off <= 0.5) return 2;
	return -5;
}

export function setTarget(s: GridState, id: UnitId, target: number): GridState {
	const spec = UNITS.find((u) => u.id === id);
	if (!spec) return s;
	return {
		...s,
		units: {
			...s.units,
			[id]: { ...s.units[id], target: clamp(target, spec.min, spec.max) },
		},
	};
}

/** Advances the grid by dt seconds. Pure: returns a new state. */
export function step(s: GridState, dt: number): GridState {
	if (s.outcome.kind !== 'running') return s;
	const t = s.t + dt;

	const units = { ...s.units };
	let tonnes = s.tonnes;
	let energy = s.energy;
	for (const spec of UNITS) {
		const u = s.units[spec.id];
		const move = clamp(
			u.target - u.output,
			-spec.ramp * dt,
			spec.ramp * dt
		);
		let output = u.output + move;
		let stored = u.stored;
		if (spec.energy !== undefined) {
			stored -= (output * dt) / 3600;
			// An empty store can't generate; a full one can't charge
			if (stored <= 0 && output > 0) output = 0;
			if (stored >= spec.energy && output < 0) output = 0;
			stored = clamp(stored, 0, spec.energy);
		}
		const mwh = (Math.max(0, output) * dt) / 3600;
		tonnes += (mwh * spec.carbon) / 1000;
		energy += mwh;
		units[spec.id] = { ...u, output, stored };
	}

	const next: GridState = { ...s, t, units };
	energy += (fixedAt(s.base, t, s.events) * dt) / 3600;
	const imbalance = generationOf(next) - loadOf(next);
	const rocof = imbalance / INERTIA;
	const f = s.f + rocof * dt;

	const log = [...s.log];
	for (const e of s.events) if (e.at > s.t && e.at <= t) log.push(e);

	let outcome: Outcome = { kind: 'running' };
	if (f < LOW_TRIP)
		outcome = {
			kind: 'tripped',
			reason: 'Frequency fell below 48.8 Hz: demand disconnection started. Homes went dark.',
		};
	else if (f > HIGH_TRIP)
		outcome = {
			kind: 'tripped',
			reason: 'Frequency rose above 52 Hz: generators tripped on overspeed.',
		};
	// Steps of 0.05 s add up to a hair under the end
	else if (t >= SHIFT - 1e-6) outcome = { kind: 'complete' };

	return {
		...next,
		f,
		rocof,
		tonnes,
		energy,
		log,
		outcome,
		score: s.score + pointsFor(f) * dt,
		inBand: s.inBand + (Math.abs(f - 50) <= 0.2 ? dt : 0),
	};
}

/** The best possible score: every second in the normal band. */
export const MAX_SCORE = SHIFT * 10;

export function gradeFor(s: GridState) {
	if (s.outcome.kind === 'tripped') return 'Tripped';
	const share = s.inBand / SHIFT;
	if (share >= 0.95) return 'Control engineer';
	if (share >= 0.8) return 'Shift lead';
	if (share >= 0.5) return 'Trainee';
	return 'Stood down';
}
