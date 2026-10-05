import type { FigureMeta } from '../../kit/types';
import { BEAT, HOLD } from '../../kit/time';

/** When the playhead starts, and how long it spends on each year. */
export const SWEEP_START = 4 * BEAT;
export const YEAR_MS = BEAT;
export const FIRST_YEAR = 2008;
/** October 2026, when this was drawn. */
export const NOW = 2026.75;
export const SWEEP_END = SWEEP_START + (NOW - FIRST_YEAR) * YEAR_MS;

export interface Span {
	version: string;
	from: number;
	to: number;
	/** CIM100 is where everyone is heading: the one verdigris thing. */
	current?: boolean;
	/** Decided but not yet exchanging: drawn dashed. */
	mandated?: boolean;
}

export interface Lane {
	name: string;
	what: string;
	spans: Span[];
}

// From the post 3 research notes (boundary-node), each from a published source:
// ERCOT NMMS and CIM16 FAQ; ENTSO-E CGMES baseline (Aug 2014) and CGMES 3.0 (Oct 2022);
// Ofgem's open letter (Jan 2022) and the first GB CIM LTDS models (28 Nov 2025).
export const LANES: Lane[] = [
	{
		name: 'ERCOT',
		what: 'Texas market model',
		spans: [
			{ version: 'CIM10', from: 2010, to: 2025.5 },
			{ version: 'CIM16', from: 2025.5, to: NOW },
		],
	},
	{
		name: 'ENTSO-E',
		what: 'Europe, CGMES',
		spans: [
			{ version: 'CGMES 2.4.15 · CIM16', from: 2014.6, to: NOW },
			{
				version: 'CGMES 3 · CIM100',
				from: 2022.8,
				to: NOW,
				current: true,
			},
		],
	},
	{
		name: 'GB',
		what: 'DNO LTDS',
		spans: [
			{ version: 'MANDATED', from: 2022, to: 2025.9, mandated: true },
			{ version: 'CIM100', from: 2025.9, to: NOW, current: true },
		],
	},
];

export const meta: FigureMeta = {
	number: 'BN-03-F1',
	title: 'The version you are pinned to',
	alt: 'A timeline from 2008 to 2026. ERCOT runs on CIM10 from 2010 for fifteen years, moving to CIM16 in 2025. ENTSO-E adopts CGMES 2.4.15 (CIM16) in 2014 and adds CGMES 3 (CIM100) in 2022, running both. Great Britain mandates CIM in 2022 and its distribution networks publish their first CIM100 models in November 2025.',
	source: 'ERCOT · ENTSO-E · Ofgem',
	date: '04.10.26',
	// The sweep, a beat for the playhead to fade, then the hold
	duration: Math.ceil(SWEEP_END / BEAT) * BEAT + BEAT + HOLD,
};
