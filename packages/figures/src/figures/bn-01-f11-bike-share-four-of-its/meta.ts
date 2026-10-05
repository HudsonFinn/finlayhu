import { umlBuild } from '../../kit/umlBuild';
import type { FigureMeta } from '../../kit/types';
import type { UmlSpec } from '../../kit/uml';
import spec from '../../data/bn-01/gbfs.json';

/** Substack diagram gbfs (drawn on in full). */
export const SPEC: UmlSpec = spec;
export const PREVIOUS: UmlSpec | undefined = undefined;

export const meta: FigureMeta = {
	number: 'BN-01-F11',
	title: 'Bike share, four of its kinds',
	alt: 'A simplified GBFS bike-share model: Region, Station, Vehicle and VehicleType, joined by three lines, region_id, station_id and vehicle_type_id.',
	source: 'GBFS \u00b7 simplified',
	date: '13.09.26',
	duration: umlBuild(SPEC, PREVIOUS).duration,
};
