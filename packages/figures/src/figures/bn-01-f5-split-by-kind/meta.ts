import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d5.json';
import previous from '../../data/bn-01/d4.json';

/** Substack diagram d5 (what changed since d4 draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F5',
	title: 'Split by kind',
	alt: 'Six boxes side by side, Shirt, TShirt, Jumper, Trousers, Sock and Jacket, each repeating id, name and colour, with Sock keeping the pairedWith loop.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
