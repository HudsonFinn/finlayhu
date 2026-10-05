/*
 * Every figure, in drawing-number order. `bun run fig new` adds to both lists; the markers
 * below are where it writes, so keep them.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { slugOf, type FigureEntry, type FigureMeta } from './kit/types';
import { meta as bn00f1 } from './figures/bn-00-f1-plotter/meta';
import { meta as bn00f2 } from './figures/bn-00-f2-flow/meta';
import { meta as bn00f3 } from './figures/bn-00-f3-substation/meta';
import { meta as bn00f4 } from './figures/bn-00-f4-two-networks-one-node/meta';
import { meta as bn03f1 } from './figures/bn-03-f1-the-version-you-are-pinned/meta';
import { meta as bn03f2 } from './figures/bn-03-f2-the-common-grid-model-twice/meta';
import { meta as bn03f3 } from './figures/bn-03-f3-voltage-layers-and-their-boundary/meta';
import { meta as bn01f1 } from './figures/bn-01-f1-one-box-garment/meta';
import { meta as bn01f2 } from './figures/bn-01-f2-garment-gets-an-id-and/meta';
import { meta as bn01f3 } from './figures/bn-01-f3-sizes-split-out/meta';
import { meta as bn01f4 } from './figures/bn-01-f4-socks-pair-up/meta';
import { meta as bn01f5 } from './figures/bn-01-f5-split-by-kind/meta';
import { meta as bn01f6 } from './figures/bn-01-f6-kinds-of-garment/meta';
import { meta as bn01f7 } from './figures/bn-01-f7-places-are-things-too/meta';
import { meta as bn01f8 } from './figures/bn-01-f8-where-is-it/meta';
import { meta as bn01f9 } from './figures/bn-01-f9-is-it-clean/meta';
import { meta as bn01f10 } from './figures/bn-01-f10-one-identification-system/meta';
import { meta as bn01f11 } from './figures/bn-01-f11-bike-share-four-of-its/meta';
import { meta as bn01f12 } from './figures/bn-01-f12-ltds-ten-of-cim-s/meta';
// fig new: imports above

const entry = (meta: FigureMeta, load: FigureEntry['load']): FigureEntry => ({
	...meta,
	slug: slugOf(meta),
	load,
});

export const figures: FigureEntry[] = [
	entry(bn00f1, () => import('./figures/bn-00-f1-plotter/Figure')),
	entry(bn00f2, () => import('./figures/bn-00-f2-flow/Figure')),
	entry(bn00f3, () => import('./figures/bn-00-f3-substation/Figure')),
	entry(
		bn00f4,
		() => import('./figures/bn-00-f4-two-networks-one-node/Figure')
	),
	entry(
		bn03f1,
		() => import('./figures/bn-03-f1-the-version-you-are-pinned/Figure')
	),
	entry(
		bn03f2,
		() => import('./figures/bn-03-f2-the-common-grid-model-twice/Figure')
	),
	entry(
		bn03f3,
		() =>
			import(
				'./figures/bn-03-f3-voltage-layers-and-their-boundary/Figure'
			)
	),
	entry(bn01f1, () => import('./figures/bn-01-f1-one-box-garment/Figure')),
	entry(
		bn01f2,
		() => import('./figures/bn-01-f2-garment-gets-an-id-and/Figure')
	),
	entry(bn01f3, () => import('./figures/bn-01-f3-sizes-split-out/Figure')),
	entry(bn01f4, () => import('./figures/bn-01-f4-socks-pair-up/Figure')),
	entry(bn01f5, () => import('./figures/bn-01-f5-split-by-kind/Figure')),
	entry(bn01f6, () => import('./figures/bn-01-f6-kinds-of-garment/Figure')),
	entry(
		bn01f7,
		() => import('./figures/bn-01-f7-places-are-things-too/Figure')
	),
	entry(bn01f8, () => import('./figures/bn-01-f8-where-is-it/Figure')),
	entry(bn01f9, () => import('./figures/bn-01-f9-is-it-clean/Figure')),
	entry(
		bn01f10,
		() => import('./figures/bn-01-f10-one-identification-system/Figure')
	),
	entry(
		bn01f11,
		() => import('./figures/bn-01-f11-bike-share-four-of-its/Figure')
	),
	entry(
		bn01f12,
		() => import('./figures/bn-01-f12-ltds-ten-of-cim-s/Figure')
	),
	// fig new: entries above
];

export const figureBySlug = (slug: string) =>
	figures.find((f) => f.slug === slug);

const components = new Map<string, LazyExoticComponent<ComponentType>>();

/** A figure's component, loaded on first render. One per figure, so React keeps its state. */
export function lazyFigure(figure: FigureEntry) {
	let component = components.get(figure.slug);
	if (!component) {
		component = lazy(figure.load);
		components.set(figure.slug, component);
	}
	return component;
}
