import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d7a.json';
import previous from '../../data/bn-01/d6.json';

/** Substack diagram d7a (what changed since d6 draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F7',
	title: 'Places are things too',
	alt: 'A Place box with id and name appears beside the Garment tree, not yet connected to it.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
