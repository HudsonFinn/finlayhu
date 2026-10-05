import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d9.json';
import previous from '../../data/bn-01/d7c.json';

/** Substack diagram d9 (what changed since d7c draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F10',
	title: 'One identification system',
	alt: 'A Thing box with id and name sits on top; Garment and Place are both kinds of Thing, so every id can be looked up in one place.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
