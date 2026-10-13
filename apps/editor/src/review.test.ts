import { expect, test } from 'bun:test';
import {
	addMark,
	compare,
	removeMarkAt,
	segments,
	splitFrontmatter,
} from './review';

test('marks merge when they touch', () => {
	const marks = addMark(addMark([], { start: 0, end: 5 }), {
		start: 10,
		end: 12,
	});
	expect(addMark(marks, { start: 4, end: 10 })).toEqual([
		{ start: 0, end: 12 },
	]);
	expect(removeMarkAt(marks, 11)).toEqual([{ start: 0, end: 5 }]);
});

test('compare sorts flags and marks into both, rule only and you only', () => {
	const flags = [
		{ start: 0, end: 4, note: 'a' },
		{ start: 20, end: 24, note: 'b' },
	];
	const marks = [
		{ start: 2, end: 8 },
		{ start: 40, end: 44 },
	];
	expect(compare(marks, flags)).toEqual({
		both: [flags[0]],
		ruleOnly: [flags[1]],
		youOnly: [marks[1]],
	});
});

test('segments cover the whole text and carry what covers them', () => {
	const parts = segments(
		10,
		[{ start: 2, end: 6 }],
		[{ start: 4, end: 8, note: 'x' }]
	);
	expect(
		parts.map((p) => [p.start, p.end, p.marked, p.flags.length])
	).toEqual([
		[0, 2, false, 0],
		[2, 4, true, 0],
		[4, 6, true, 1],
		[6, 8, false, 1],
		[8, 10, false, 0],
	]);
});

test('frontmatter is split off with its offset', () => {
	const text = "---\ntitle: 'A'\n---\n\nBody.";
	const { offset, body } = splitFrontmatter(text);
	expect(body).toBe('\nBody.');
	expect(text.slice(offset)).toBe(body);
});
