import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/ltds.json';

/** Substack diagram ltds (drawn on in full). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = undefined;

export const meta: FigureMeta = {
	number: 'BN-01-F12',
	title: 'LTDS: ten of CIM’s 193 kinds',
	alt: 'Ten classes from the LTDS profile of the IEC CIM, with IdentifiedObject on top and kinds below it down to ACLineSegment, PowerTransformer and Breaker, plus Substation, Terminal and ConnectivityNode joined by lines.',
	source: 'LTDS (IEC CIM)',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
