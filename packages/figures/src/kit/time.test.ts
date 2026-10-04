import { describe, expect, test } from 'bun:test';
import { BEAT, HOLD, STEP, drawOn, flowOffset, progress, settle } from './time';
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

	test('the still is the finished build, or the start', () => {
		expect(stillTime(8400)).toBe(8400 - HOLD);
		expect(stillTime()).toBe(0);
	});
});
