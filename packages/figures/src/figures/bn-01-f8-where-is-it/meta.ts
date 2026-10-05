import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d7b.json';
import previous from '../../data/bn-01/d7a.json';

/** Substack diagram d7b (what changed since d7a draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F8',
	title: 'Where is it?',
	alt: 'A line labelled isIn connects Garment to Place: a garment is in at most one place (0..1), and a place holds any number of garments (0..*).',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
