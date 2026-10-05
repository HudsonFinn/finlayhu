import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d7c.json';
import previous from '../../data/bn-01/d7b.json';

/** Substack diagram d7c (what changed since d7b draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F9',
	title: 'Is it clean?',
	alt: 'The Garment box gains a clean property: something true of the garment, not a connection to anything.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
