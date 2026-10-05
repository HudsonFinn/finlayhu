import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/d6.json';
import previous from '../../data/bn-01/d5.json';

/** Substack diagram d6 (what changed since d5 draws on). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = previous;

export const meta: FigureMeta = {
	number: 'BN-01-F6',
	title: 'Kinds of garment',
	alt: 'Garment sits on top with id, name and colour; hollow triangles show that Shirt, TShirt, Jumper, Trousers, Sock and Jacket are each a kind of Garment and keep only what they add.',
	source: 'Your wardrobe',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
