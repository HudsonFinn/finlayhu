import { proseOnly } from './prose';
import type { Flag, Rule } from './types';

export const typos: Rule = {
	id: 'typos',
	title: 'Slips',
	lookFor:
		'Mechanical slips: a word typed twice, two spaces between words, or no space after a comma or full stop.',
	why: 'Small slips tell a reader the piece wasn’t checked, and they trust the rest a little less.',
	example: {
		before: 'Most know their own flaws and are aware of them  but are either unable or unwilling to to rectify them.',
		after: 'Most know their own flaws and are aware of them but are either unable or unwilling to rectify them.',
	},
	check: (body) => {
		const prose = proseOnly(body);
		const flags: Flag[] = [];
		const add = (match: RegExpExecArray, note: string) => {
			flags.push({
				start: match.index,
				end: match.index + match[0].length,
				note,
			});
		};
		for (const match of prose.matchAll(/\b(\w+)\s+\1\b/gi))
			add(match, `“${match[1]}” twice`);
		// Look in the body: blanking markdown leaves runs of spaces in the prose
		for (const match of body.matchAll(/(?<=\S) {2,}(?=\S)/g)) {
			const around = [match.index - 1, match.index + match[0].length + 1];
			if (prose.slice(...around) === body.slice(...around))
				add(match, 'Double space');
		}
		// Abbreviations like e.g. and i.e. are fine
		for (const match of prose.matchAll(/[a-z][,;:!?.](?=[A-Za-z])/g))
			if (
				!/\b(?:e\.g|i\.e)/i.test(
					prose.slice(match.index - 2, match.index + 4)
				)
			)
				add(match, 'No space after the punctuation');
		return flags.sort((a, b) => a.start - b.start);
	},
};
