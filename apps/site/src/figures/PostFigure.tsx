import { Suspense } from 'react';
import { figureBySlug, lazyFigure } from '@fhudson/figures';

/** A figure inside a post, from `::figure{slug="…"}`. A wrong slug shows, rather than vanishing. */
export function PostFigure({ slug }: { slug: string }) {
	const figure = figureBySlug(slug);
	if (!figure)
		return (
			<p className="border-[1.5px] border-fault p-3 font-data text-small text-fault">
				No figure called {slug}. Check <code>bun run fig list</code>.
			</p>
		);
	const Figure = lazyFigure(figure);
	return (
		<Suspense fallback={null}>
			<Figure />
		</Suspense>
	);
}
