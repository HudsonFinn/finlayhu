/*
 * Every figure, in drawing-number order. `bun run fig new` adds to both lists; the markers
 * below are where it writes, so keep them.
 */
import { slugOf, type FigureEntry, type FigureMeta } from './kit/types';
import { meta as bn00f1 } from './figures/bn-00-f1-plotter/meta';
import { meta as bn00f2 } from './figures/bn-00-f2-flow/meta';
import { meta as bn00f3 } from './figures/bn-00-f3-substation/meta';
import { meta as bn00f4 } from './figures/bn-00-f4-two-networks-one-node/meta';
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
	// fig new: entries above
];

export const figureBySlug = (slug: string) =>
	figures.find((f) => f.slug === slug);
