import type { FigureMeta } from '../../kit/types';
import { BEAT, HOLD } from '../../kit/time';

/** The last feeder finishes drawing at 6.8 s; then the build holds. */
export const BUILD_END = 4400 + 6 * BEAT;

export const meta: FigureMeta = {
	number: 'BN-00-F1',
	title: 'The plotter: a substation drawn one mark at a time',
	alt: 'A substation drawn one mark at a time: a 132 kV circuit arrives at a boundary node, steps down through a transformer to a 33 kV busbar, and leaves on three feeders.',
	source: 'Illustrative',
	date: '04.10.26',
	duration: BUILD_END + HOLD,
};
