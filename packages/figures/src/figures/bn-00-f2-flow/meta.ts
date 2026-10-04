import type { FigureMeta } from '../../kit/types';

export const SOURCES = [
	{ name: 'Wind', mw: 1240 },
	{ name: 'Nuclear', mw: 860 },
	{ name: 'Interconnector', mw: 400 },
];
export const LOADS = [
	{ name: 'Feeder A', mw: 1100 },
	{ name: 'Feeder B', mw: 900 },
	{ name: 'Feeder C', mw: 500 },
];
export const TOTAL = SOURCES.reduce((sum, s) => sum + s.mw, 0);
export const mw = (n: number) => `${n.toLocaleString('en-GB')} MW`;

const list = (items: { name: string; mw: number }[]) =>
	items.map((i) => `${i.name.toLowerCase()} ${mw(i.mw)}`).join(', ');

export const meta: FigureMeta = {
	number: 'BN-00-F2',
	title: 'Flow: power through a boundary node, speed by MW',
	alt: `Power flowing through a boundary node: ${list(SOURCES)} combine to ${mw(TOTAL)}, which leaves on ${list(LOADS)}. Faster dashes mean more power.`,
	source: 'Illustrative',
	date: '04.10.26',
	loop: 8000,
};
