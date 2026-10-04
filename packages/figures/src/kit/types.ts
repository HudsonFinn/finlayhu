import type { ComponentType } from 'react';

export interface FigureMeta {
	/** Drawing number: BN-<post>-F<n>, e.g. BN-03-F2. Post 00 is the identity sheet. */
	number: string;
	/** For the workbench and registries only; never drawn in the figure. */
	title: string;
	/** What the figure shows, for screen readers and Substack's alt text. */
	alt: string;
	/** Where the data comes from, as printed in the title block. */
	source: string;
	/** Drawn date, dd.mm.yy, as in every other title block. */
	date: string;
	/** Loop length in ms for builds. Omit for stills and continuous animations. */
	duration?: number;
}

export interface FigureEntry extends FigureMeta {
	/** The URL path segment: fhudson.com/f/<slug>. */
	slug: string;
	load: () => Promise<{ default: ComponentType }>;
}

export const slugOf = (meta: Pick<FigureMeta, 'number'>) =>
	meta.number.toLowerCase();

export const interactiveUrl = (meta: Pick<FigureMeta, 'number'>) =>
	`fhudson.com/f/${slugOf(meta)}`;
