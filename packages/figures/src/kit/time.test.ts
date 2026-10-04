import { describe, expect, test } from 'bun:test';
import {
	BEAT,
	HOLD,
	STEP,
	drawOn,
	flowOffset,
	loopSpeed,
	progress,
	settle,
} from './time';
import { stillTime } from './useClock';

describe('timing', () => {
	test('steps and holds are whole beats', () => {
		expect(STEP % BEAT).toBe(0);
		expect(HOLD % BEAT).toBe(0);
	});

	test('progress is linear and clamped', () => {
		expect(progress(0, 400)).toBe(0);
		expect(progress(800, 400)).toBe(0.5);
		expect(progress(5000, 400)).toBe(1);
		expect(progress(500, 400, BEAT)).toBe(0.25);
	});

	test('settle eases out from 0 to 1', () => {
		expect(settle(0)).toBe(0);
		expect(settle(1)).toBe(1);
		expect(settle(0.5)).toBeGreaterThan(0.5);
	});

	test('drawOn hides the stroke at 0 and shows all of it at 1', () => {
		expect(drawOn(0).strokeDashoffset).toBe(1);
		expect(drawOn(1).strokeDashoffset).toBe(0);
	});

	test('flow moves forward and stays within one period', () => {
		const offset = flowOffset(10_000, 50, 16);
		expect(offset).toBeLessThanOrEqual(0);
		expect(offset).toBeGreaterThan(-16);
		expect(flowOffset(0, 50, 16)).toBe(-0);
	});

	test('loop speeds come back to the start of a dash at the loop point', () => {
		for (const speed of [10, 21.5, 62.5, 0.1]) {
			const s = loopSpeed(speed, 8000, 16);
			expect(Math.abs(flowOffset(8000, s, 16))).toBeCloseTo(0, 9);
			expect(s).toBeGreaterThan(0);
		}
		expect(loopSpeed(31, 8000, 16)).toBe(32);
	});

	test('the still is the finished build, or the start', () => {
		expect(stillTime(8400)).toBe(8400 - HOLD);
		expect(stillTime()).toBe(0);
	});
});
