import type { Rule } from './types';

/** Passes that need a reader's judgment. No automatic check yet: in v2 Claude flags these. */
export const judgmentRules: Rule[] = [
	{
		id: 'summary-vs-argument',
		title: 'Summary or argument',
		lookFor:
			'Paragraphs that only retell what happens, with no reaction or claim of yours. Mark each one.',
		why: 'A reader can get the plot anywhere. What only you can give them is what you made of it. Summary earns its place only as setup for a point.',
		example: {
			before: 'Due to the avoidance of finding the answer to his questions the narrator eventually drives himself into isolation, having one remaining dog that he still spends time with.',
			after: 'His isolation is self-made: he’d rather stay alone with his questions than risk someone else answering them.',
		},
	},
	{
		id: 'buried-point',
		title: 'Buried point',
		lookFor:
			'Your best idea. Find it, then mark it. Is it in the first two paragraphs? If it’s near the end, it’s buried.',
		why: 'Readers decide in the opening whether to keep going. Lead with the idea that reframes everything, then earn it.',
		example: {
			before: '(Second-to-last paragraph) …the book reads very differently if you understand that the dog is completely unable to perceive humans.',
			after: '(Opening) Kafka’s narrator investigates a world run by people he can’t see.',
		},
	},
	{
		id: 'pronoun-drift',
		title: 'Pronoun drift',
		lookFor:
			'The same person or thing called by different pronouns: “they” in one paragraph, “he” in the next. Mark each switch.',
		why: 'Each switch makes the reader check whether you mean someone new.',
		example: {
			before: 'When young their curiosity is entertained… the narrator eventually drives himself into isolation.',
			after: 'Pick one: “his curiosity… drives himself”, all the way through.',
		},
	},
];
