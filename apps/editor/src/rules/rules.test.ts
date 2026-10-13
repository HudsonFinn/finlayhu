import { expect, test } from 'bun:test';
import { commaSplices } from './commaSplices';
import { hedges } from './hedges';
import { longSentences } from './longSentences';
import { proseOnly, sentences } from './prose';
import { typos } from './typos';
import { wordy } from './wordy';
import { rules } from '.';
import type { Rule } from './types';

const flagged = (rule: Rule, body: string) =>
	(rule.check?.(body) ?? []).map((f) => body.slice(f.start, f.end));

test('prose keeps offsets and blanks markdown', () => {
	const body =
		'# Heading\n\n[Goodreads](https://a.b/c)\n\nSee [the post](https://x.y) now.';
	const prose = proseOnly(body);
	expect(prose.length).toBe(body.length);
	expect(prose).not.toContain('Heading');
	expect(prose).not.toContain('https');
	expect(prose).toContain('the post');
});

test('sentences split on full stops and lines, and skip URLs', () => {
	const body = 'One here. Two there!\n\nThree [link](https://a.b.c/d.e) end.';
	expect(sentences(body).map((s) => s.text.replace(/\s+/g, ' '))).toEqual([
		'One here.',
		'Two there!',
		'Three link end.',
	]);
});

test('long sentences flags over 30 words, not under', () => {
	const long = Array.from({ length: 31 }, () => 'word').join(' ') + '.';
	const short = 'A short one.';
	expect(flagged(longSentences, `${short} ${long}`)).toEqual([long]);
});

test('comma splices finds a new subject after a comma', () => {
	expect(
		flagged(
			commaSplices,
			'The language is hard to read, it feels very old.'
		)
	).toEqual([', it feels']);
	// A dependent clause first is fine
	expect(
		flagged(
			commaSplices,
			'When the language is hard to read, it slows me down.'
		)
	).toEqual([]);
	// So is "which"
	expect(
		flagged(commaSplices, 'He is weak and isolated, which reflects it.')
	).toEqual([]);
});

test('hedges and wordy phrases are found where they are', () => {
	expect(flagged(hedges, 'It was honestly a very fun read.')).toEqual([
		'honestly',
		'very',
	]);
	expect(
		flagged(
			wordy,
			'That is something I found I could identify with, in order to learn.'
		)
	).toEqual(['is something I', 'in order to']);
});

test('slips: repeated words, double spaces, missing spaces', () => {
	expect(
		flagged(typos, 'unwilling to to fix,it  now. See e.g. this.')
	).toEqual(['to to', 'x,', '  ']);
	// A link's blanked address isn't a double space
	expect(flagged(typos, 'See [this](https://a.b) now.')).toEqual([]);
});

test('every rule has a brief and a unique id', () => {
	expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
	for (const rule of rules) {
		expect(rule.lookFor.length).toBeGreaterThan(20);
		expect(rule.example.before).not.toBe(rule.example.after);
	}
});
