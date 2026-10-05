import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d4.json';
import previous from '../../data/bn-01/d3.json';

/** Substack diagram d4 (what changed since d3 draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F4',
	title: 'Socks pair up',
	alt: 'A line labelled pairedWith loops from the Garment box back to itself, marked 0..1 at each end: a garment can be paired with at most one other.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
