import { describe, expect, test } from 'bun:test';
import {
	EVENTS,
	LOW_TRIP,
	SHIFT,
	eventsFor,
	STANDARD_BASE,
	gradeFor,
	initialState,
	liveBase,
	setTarget,
	step,
	type GridState,
} from './simulation';

const DT = 0.05;

function run(s: GridState, seconds: number, act?: (s: GridState) => GridState) {
	const end = s.t + seconds;
	while (s.t < end - 1e-6 && s.outcome.kind === 'running')
		s = step(act ? act(s) : s, DT);
	return s;
}

describe('Hold 50 Hz', () => {
	test('starts balanced at 50 Hz', () => {
		const s = run(initialState(), 5);
		expect(Math.abs(s.f - 50)).toBeLessThan(0.05);
	});

	test('an unanswered trip pulls frequency down until demand is disconnected', () => {
		const s = run(initialState(), SHIFT);
		expect(s.outcome.kind).toBe('tripped');
		expect(s.f).toBeLessThan(LOW_TRIP);
	});

	test('logs each event as it starts', () => {
		const s = run(initialState(), 30, (s) => s);
		expect(s.log.map((l) => l.message)).toEqual(
			EVENTS.filter((e) => e.at <= s.t).map((e) => e.message)
		);
	});

	test('a battery runs flat and stops generating', () => {
		let s = setTarget(initialState(), 'battery', 2500);
		// Hold frequency still, so only the store runs out
		for (let i = 0; i < 30 / DT; i++) s = step({ ...s, f: 50 }, DT);
		expect(s.units.battery.stored).toBe(0);
		expect(s.units.battery.output).toBe(0);
	});

	test('ramps limit how fast gas moves', () => {
		const s = step(setTarget(initialState(), 'gas', 24_000), 1);
		expect(
			s.units.gas.output - initialState().units.gas.output
		).toBeCloseTo(120);
	});

	test('a steady operator can hold the shift in band', () => {
		// Batteries answer frequency at once; gas slowly takes over so the battery can recover
		const s = run(initialState(), SHIFT, (s) => {
			const error = s.f - 50;
			const battery = -40_000 * error - 0.5 * s.units.battery.output;
			const gas =
				s.units.gas.output +
				s.units.battery.output +
				s.units.hydro.output;
			return setTarget(
				setTarget(s, 'battery', battery),
				'gas',
				gas - 20_000 * error
			);
		});
		expect(s.outcome.kind).toBe('complete');
		expect(gradeFor(s)).toBe('Control engineer');
	});

	test('a shift only loses what it has', () => {
		const night = { ...STANDARD_BASE, solar: 0, imports: 0 };
		const drivers = eventsFor(night).map((e) => e.driver);
		expect(drivers).not.toContain('solar');
		expect(drivers).not.toContain('imports');
		expect(eventsFor(STANDARD_BASE)).toEqual(EVENTS);
	});

	test('a live start leaves gas room to move', () => {
		const base = liveBase(25_000, [
			{ fuel: 'wind', percent: 70 },
			{ fuel: 'nuclear', percent: 20 },
			{ fuel: 'solar', percent: 10 },
		]);
		const s = initialState(base);
		expect(s.units.gas.output).toBeGreaterThanOrEqual(2900);
		expect(base.source).toBe('live');
		expect(STANDARD_BASE.source).toBe('standard');
	});
});
