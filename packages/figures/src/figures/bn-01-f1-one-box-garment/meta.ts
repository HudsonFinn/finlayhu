import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d1.json';

/** Substack diagram d1 (drawn on in full). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = undefined;

export const meta: FigureMeta = {
	number: 'BN-01-F1',
	title: 'One box: Garment',
	alt: 'A UML diagram with one box, Garment, listing what is true of every garment: colour, what it is, and size.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
