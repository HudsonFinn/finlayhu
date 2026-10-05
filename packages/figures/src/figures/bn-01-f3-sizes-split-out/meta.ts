import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d3.json';
import previous from '../../data/bn-01/d2.json';

/** Substack diagram d3 (what changed since d2 draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F3',
	title: 'Sizes split out',
	alt: 'The Garment box’s single size becomes size, waist, leg and shoeSize: one box now carries properties that only some garments use.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
