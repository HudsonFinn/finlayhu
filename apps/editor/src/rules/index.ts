import { commaSplices } from './commaSplices';
import { hedges } from './hedges';
import { judgmentRules } from './judgment';
import { longSentences } from './longSentences';
import { typos } from './typos';
import type { Rule } from './types';
import { wordy } from './wordy';

export type { Flag, Rule, Span } from './types';

/** Every pass, in the order they're offered. Checked rules first, then the judgment ones. */
export const rules: Rule[] = [
	longSentences,
	commaSplices,
	hedges,
	wordy,
	typos,
	...judgmentRules,
];

export const ruleById = (id: string) => rules.find((rule) => rule.id === id);
