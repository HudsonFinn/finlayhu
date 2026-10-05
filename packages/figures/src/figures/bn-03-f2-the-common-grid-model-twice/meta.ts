import type { FigureMeta } from '../../kit/types';
import { BEAT } from '../../kit/time';

/** One hour per beat: the day loops in 9.6 s. */
export const HOUR_MS = BEAT;
/** ENTSO-E's merges, CET (2016 annual report; see the post 3 research notes). */
export const MERGES = [8, 16];
/** Models flow in for the two hours before a merge, and the common model out for two after. */
export const WINDOW = 2;
export const TSOS = 6;

export const meta: FigureMeta = {
	number: 'BN-03-F2',
	title: 'The common grid model, twice a day',
	alt: 'Schematic of a day of European grid model merging. Six TSOs’ models flow into a single merge, which runs at 08:00 and 16:00 CET and produces one common grid model; between merges the lines are quiet.',
	source: 'ENTSO-E · schematic',
	date: '04.10.26',
	loop: 24 * HOUR_MS,
};
