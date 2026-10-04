import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'bun:test';
import type { FigureEntry } from '../src/kit/types';
import { recordFigures, substackUpload, toRecord } from './postRegistry';

const figure = (
	number: string,
	extra: Partial<FigureEntry> = {}
): FigureEntry => ({
	number,
	slug: number.toLowerCase(),
	title: `Figure ${number}`,
	alt: 'Alt text long enough to be real.',
	source: 'Illustrative',
	date: '04.10.26',
	load: () => Promise.reject(new Error('not loaded in tests')),
	...extra,
});

const filesFor = (slug: string, exts: string[]) =>
	['dark', 'light'].flatMap((t) =>
		exts.map((e) => `/post/figures/${slug}/${slug}-${t}.${e}`)
	);

describe('Substack upload choice', () => {
	test('a still uploads its dark PNG', () => {
		const f = figure('BN-03-F1');
		expect(substackUpload(f, filesFor(f.slug, ['png']))).toEqual([
			'/post/figures/bn-03-f1/bn-03-f1-dark.png',
		]);
	});

	test('a short loop uploads its dark GIF', () => {
		const f = figure('BN-03-F2', { loop: 8000 });
		expect(
			substackUpload(f, filesFor(f.slug, ['png', 'mp4', 'gif']))
		).toEqual(['/post/figures/bn-03-f2/bn-03-f2-dark.gif']);
	});

	test('a long animation leads with a still, then the MP4', () => {
		const f = figure('BN-03-F3', { loop: 40000 });
		expect(substackUpload(f, filesFor(f.slug, ['png', 'mp4']))).toEqual([
			'/post/figures/bn-03-f3/bn-03-f3-dark.png',
			'/post/figures/bn-03-f3/bn-03-f3-dark.mp4',
		]);
	});
});

describe('figures.json', () => {
	let dir = '';
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	test('records relative paths, replaces by number and keeps number order', () => {
		dir = mkdtempSync(join(tmpdir(), 'post-'));
		const at = (slug: string, exts: string[]) =>
			filesFor(slug, exts).map((f) => f.replace('/post', dir));
		const f10 = figure('BN-03-F10', { duration: 8400 });
		const f2 = figure('BN-03-F2');
		recordFigures(dir, [
			toRecord(f10, at(f10.slug, ['png', 'mp4', 'gif']), dir),
		]);
		recordFigures(dir, [toRecord(f2, at(f2.slug, ['png']), dir)]);
		const path = recordFigures(dir, [
			toRecord({ ...f2, title: 'Renamed' }, at(f2.slug, ['png']), dir),
		]);

		const records = JSON.parse(readFileSync(path, 'utf8')) as {
			number: string;
			title: string;
			kind: string;
			length?: number;
			upload: string[];
			interactive: string;
		}[];
		expect(records.map((r) => r.number)).toEqual(['BN-03-F2', 'BN-03-F10']);
		expect(records[0].title).toBe('Renamed');
		expect(records[0].upload).toEqual([
			'figures/bn-03-f2/bn-03-f2-dark.png',
		]);
		expect(records[1]).toMatchObject({
			kind: 'build',
			length: 8.4,
			interactive: 'https://fhudson.com/f/bn-03-f10',
		});
	});
});
