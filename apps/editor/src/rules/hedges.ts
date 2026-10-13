import { proseOnly } from './prose';
import type { Flag, Rule } from './types';

const HEDGES = [
	'very',
	'really',
	'quite',
	'slightly',
	'somewhat',
	'fairly',
	'rather',
	'honestly',
	'actually',
	'basically',
	'literally',
	'just',
	'likely',
	'probably',
	'kind of',
	'sort of',
	'a bit',
	'a little',
];
const PATTERN = new RegExp(`\\b(${HEDGES.join('|')})\\b`, 'gi');

export const hedges: Rule = {
	id: 'hedges',
	title: 'Hedges and intensifiers',
	lookFor:
		'Words that soften or pump up a claim without adding meaning: very, really, slightly, honestly, actually, likely, a bit. Mark the ones you’d cut.',
	why: 'Each one makes the sentence less sure of itself. Keep a hedge only when the doubt is real, and swap “very fun” for a word that says how.',
	example: {
		before: 'It was honestly a very fun read and can be read in a couple of hours or less.',
		after: 'It was a fun read, and short: an evening is enough.',
	},
	check: (body) => {
		const flags: Flag[] = [];
		for (const match of proseOnly(body).matchAll(PATTERN))
			flags.push({
				start: match.index,
				end: match.index + match[0].length,
				note: `“${match[0].toLowerCase()}”: keep it only if it carries meaning`,
			});
		return flags;
	},
};
