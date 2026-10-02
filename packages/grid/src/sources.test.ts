import { describe, expect, test } from 'bun:test';
import frequency from './test/fixtures/frequency.json';
import demand from './test/fixtures/demand.json';
import carbon from './test/fixtures/carbon-intensity.json';
import generation from './test/fixtures/generation.json';
import {
	parseCarbonIntensity,
	parseDemand,
	parseFrequency,
	parseGenerationMix,
} from './sources';

// Fixtures are real responses, recorded on 1-2 October 2026 and trimmed

describe('parsers', () => {
	test('frequency readings are in time order and near 50 Hz', () => {
		const rows = parseFrequency(frequency);
		expect(rows.length).toBeGreaterThan(0);
		rows.forEach((r) => {
			expect(r.value).toBeGreaterThan(49);
			expect(r.value).toBeLessThan(51);
		});
		expect(
			rows.every(
				(r, i) => i === 0 || r.time >= (rows[i - 1]?.time ?? r.time)
			)
		).toBe(true);
	});

	test('demand is in MW', () => {
		const rows = parseDemand(demand);
		expect(rows.length).toBeGreaterThan(0);
		expect(rows[0]?.value).toBeGreaterThan(10_000);
	});

	test('carbon intensity falls back to the forecast', () => {
		const rows = parseCarbonIntensity({
			data: [
				{
					from: '2026-10-02T09:00Z',
					intensity: { forecast: 120, actual: null, index: 'low' },
				},
			],
		});
		expect(rows[0]?.value).toBe(120);
		expect(
			parseCarbonIntensity(carbon).every(
				(r) => typeof r.index === 'string'
			)
		).toBe(true);
	});

	test('generation mix is sorted largest first and sums to about 100%', () => {
		const { mix } = parseGenerationMix(generation);
		const total = mix.reduce((sum, f) => sum + f.percent, 0);
		expect(total).toBeGreaterThan(98);
		expect(total).toBeLessThan(102);
		expect(
			mix.every(
				(f, i) => i === 0 || f.percent <= (mix[i - 1]?.percent ?? 100)
			)
		).toBe(true);
	});

	test('missing data gives empty results, not errors', () => {
		expect(parseFrequency({})).toEqual([]);
		expect(parseDemand(null)).toEqual([]);
		expect(parseGenerationMix({}).mix).toEqual([]);
	});
});
