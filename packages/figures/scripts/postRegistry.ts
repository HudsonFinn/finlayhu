/*
 * A Boundary Node post folder's record of its figures, figures.json: the figures' counterpart
 * to charts.json (tools/dw_table.py --register). Written by `fig export … --post <folder>`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { interactiveUrl, type FigureEntry } from '../src/kit/types';

/** Animations longer than this get no GIF (see export.ts), so Substack gets the MP4. */
export const GIF_MAX_MS = 12_000;

export interface FigureRecord {
	number: string;
	slug: string;
	title: string;
	alt: string;
	source: string;
	interactive: string;
	kind: 'still' | 'build' | 'loop';
	/** Seconds, for builds and loops. */
	length?: number;
	/** What to put in the Substack post, in order. Paths are relative to the post folder. */
	upload: string[];
	/** Every exported file, relative to the post folder. */
	files: string[];
	/** yyyy-mm-dd */
	exported: string;
}

/**
 * The format guide (docs/plans/figures.md): a still uploads its PNG; a short loop its GIF,
 * which plays in email; anything longer a still to lead with, then the MP4. Always dark, for
 * the dark publication.
 */
export function substackUpload(figure: FigureEntry, files: string[]) {
	const dark = (ext: string) =>
		files.find((f) => f.endsWith(`${figure.slug}-dark.${ext}`));
	const length = figure.duration ?? figure.loop;
	const picks = !length
		? [dark('png')]
		: length <= GIF_MAX_MS
			? [dark('gif')]
			: [dark('png'), dark('mp4')];
	return picks.filter((f): f is string => f !== undefined);
}

export function toRecord(
	figure: FigureEntry,
	files: string[],
	postDir: string,
	today = new Date()
): FigureRecord {
	const rel = (f: string) => relative(postDir, f);
	const length = figure.duration ?? figure.loop;
	return {
		number: figure.number,
		slug: figure.slug,
		title: figure.title,
		alt: figure.alt,
		source: figure.source,
		interactive: `https://${interactiveUrl(figure)}`,
		kind: figure.duration ? 'build' : figure.loop ? 'loop' : 'still',
		...(length ? { length: length / 1000 } : {}),
		upload: substackUpload(figure, files).map(rel),
		files: files.map(rel),
		exported: today.toISOString().slice(0, 10),
	};
}

/** Adds or replaces each figure's record by drawing number, keeping the list in number order. */
export function recordFigures(postDir: string, records: FigureRecord[]) {
	const path = join(postDir, 'figures.json');
	const existing = existsSync(path)
		? (JSON.parse(readFileSync(path, 'utf8')) as FigureRecord[])
		: [];
	const byNumber = new Map(existing.map((r) => [r.number, r]));
	for (const record of records) byNumber.set(record.number, record);
	const sorted = [...byNumber.values()].sort((a, b) =>
		a.number.localeCompare(b.number, 'en', { numeric: true })
	);
	writeFileSync(path, `${JSON.stringify(sorted, null, 2)}\n`);
	return path;
}
