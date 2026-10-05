import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d2.json';
import previous from '../../data/bn-01/d1.json';

/** Substack diagram d2 (what changed since d1 draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F2',
	title: 'Garment gets an id and a name',
	alt: 'The Garment box gains two properties, id and name, above colour, what it is and size.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
