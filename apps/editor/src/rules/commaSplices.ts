import { sentences, words } from './prose';
import type { Flag, Rule } from './types';

/** A sentence that opens with one of these has a dependent clause first, so its comma is fine. */
const OPENERS =
	/^(if|when|whenever|as|because|although|though|while|since|after|before|once|unless|whether|even|until|where)\b/i;
/** A comma, then a pronoun starting a new clause: "…hard to parse, it was…" */
const SPLICE =
	/,\s+(I|we|you|he|she|it|they|this)\s+(?!who\b|which\b)[A-Za-z’']+/g;

export const commaSplices: Rule = {
	id: 'comma-splices',
	title: 'Comma splices',
	lookFor:
		'Two complete sentences joined by only a comma. Test each comma: could both sides stand alone as sentences? If so, it’s a splice. The check only catches the common shape (“…, it was”), so trust your own marks over it.',
	why: 'A comma can’t hold two sentences together, so the reader stumbles where one thought ends. Use a full stop, a semicolon, or a joining word (and, but, so).',
	example: {
		before: 'We cannot fix all of our own flaws, if we could we wouldn’t be truly human.',
		after: 'We cannot fix all of our own flaws. If we could, we wouldn’t be truly human.',
	},
	// A heuristic: it catches the common shape, a comma followed by a new subject
	check: (body) => {
		const flags: Flag[] = [];
		for (const sentence of sentences(body)) {
			if (OPENERS.test(sentence.text)) continue;
			for (const match of sentence.text.matchAll(SPLICE)) {
				// The clause before the comma needs to be long enough to be a sentence
				if (words(sentence.text.slice(0, match.index)).length < 3)
					continue;
				flags.push({
					start: sentence.start + match.index,
					end: sentence.start + match.index + match[0].length,
					note: `Possible splice before “${match[1]}”`,
				});
			}
		}
		return flags;
	},
};
