import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { figures } from './registry';

const folders = readdirSync(join(import.meta.dir, 'figures'));

describe('registry', () => {
	test('drawing numbers are well formed and unique', () => {
		for (const f of figures) expect(f.number).toMatch(/^BN-\d{2}-F\d+$/);
		expect(new Set(figures.map((f) => f.number)).size).toBe(figures.length);
	});

	test('every figure folder is registered, under its own number', () => {
		const slugs = figures.map((f) => f.slug);
		for (const folder of folders)
			expect(slugs).toContain(folder.split('-').slice(0, 3).join('-'));
		expect(folders.length).toBe(figures.length);
	});

	test('every figure has alt text, a source and a date', () => {
		for (const f of figures) {
			expect(f.alt.length).toBeGreaterThan(20);
			expect(f.alt.startsWith('TODO')).toBe(false);
			expect(f.source).not.toBe('');
			expect(f.date).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
		}
	});

	test('builds that loop end on a whole beat', () => {
		for (const f of figures)
			if (f.duration) expect(f.duration % 400).toBe(0);
	});
});
