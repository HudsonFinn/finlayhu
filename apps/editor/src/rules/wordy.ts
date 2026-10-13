import { proseOnly } from './prose';
import type { Flag, Rule } from './types';

/** Phrases with a shorter way to say them. */
const PHRASES: [RegExp, string][] = [
	[/\bin order to\b/gi, 'Try just “to”'],
	[/\bdue to the fact that\b/gi, 'Try “because”'],
	[/\bthe fact that\b/gi, 'Often just “that”, or rephrase'],
	[/\bthat which\b/gi, 'Try “what”'],
	[
		/\bis something (?:that )?(?:I|we|you|he|she|they)\b/gi,
		'Say it directly: “I identified with…”',
	],
	[/\ba number of\b/gi, 'Try “some” or “several”, or the number'],
	[/\bat this point in time\b/gi, 'Try “now”'],
	[/\bin terms of\b/gi, 'Name the thing you mean'],
	[
		/\bit is (?:worth noting|important to note) that\b/gi,
		'Cut it and make the point',
	],
	[/\b(?:is|are|was|were) able to\b/gi, 'Try “can” or “could”'],
	[
		/\bthere (?:is|are|was|were) \w+ (?:who|that)\b/gi,
		'Start with the subject: “Many people think…”',
	],
];

export const wordy: Rule = {
	id: 'wordy',
	title: 'Wordy phrases',
	lookFor:
		'Roundabout phrases with a shorter version: “in order to”, “the fact that”, “is something I…”, “that which”.',
	why: 'Every extra word is one more the reader carries. These phrases add length, not meaning.',
	example: {
		before: 'The language feels slightly disconnected from that which is spoken now.',
		after: 'The language feels distant from how we speak now.',
	},
	check: (body) => {
		const prose = proseOnly(body);
		const flags: Flag[] = [];
		for (const [pattern, fix] of PHRASES)
			for (const match of prose.matchAll(pattern))
				flags.push({
					start: match.index,
					end: match.index + match[0].length,
					note: fix,
				});
		return flags.sort((a, b) => a.start - b.start);
	},
};
