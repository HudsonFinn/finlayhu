import { sentences, words } from './prose';
import type { Rule } from './types';

const LIMIT = 30;

export const longSentences: Rule = {
	id: 'long-sentences',
	title: 'Long sentences',
	lookFor: `Sentences over ${String(LIMIT)} words. Read each one aloud: if you run out of breath or lose the subject, it’s too long.`,
	why: 'A reader holds the start of a sentence in their head until the end. Past about 30 words, they drop it. Split at the point where the idea turns.',
	example: {
		before: 'The fear that they could get the answers to their questions from others if they only tried but do not as they fear they actually do not want the answers to their own questions or do not want the question answered by someone else as it would take away from their own achievement is something I found I could identify with.',
		after: 'The narrator could get answers from others if they only tried. They don’t, because they fear an answer from someone else would take away their own achievement. I identified with this.',
	},
	check: (body) =>
		sentences(body)
			.map((s) => ({ ...s, count: words(s.text).length }))
			.filter((s) => s.count > LIMIT)
			.map((s) => ({
				start: s.start,
				end: s.end,
				note: `${String(s.count)} words`,
			})),
};
