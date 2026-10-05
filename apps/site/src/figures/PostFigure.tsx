import { Suspense } from 'react';
import {
	FigureMaxWidthContext,
	figureBySlug,
	lazyFigure,
} from '@fhudson/figures';
import { Text } from '@fhudson/ui';

/**
 * A figure inside a post, from `::figure{slug="…" caption="…"}`. A wrong slug shows, rather
 * than vanishing.
 */
export function PostFigure({
	slug,
	caption,
}: {
	slug: string;
	caption?: string;
}) {
	const figure = figureBySlug(slug);
	if (!figure)
		return (
			<p className="border-[1.5px] border-fault p-3 font-data text-small text-fault">
				No figure called {slug}. Check <code>bun run fig list</code>.
			</p>
		);
	const Figure = lazyFigure(figure);
	return (
		<div data-block="figure" className="flex flex-col gap-2">
			{/* In a post, figures fill the text column rather than Substack's narrower one */}
			<FigureMaxWidthContext.Provider value={Infinity}>
				<Suspense fallback={null}>
					<Figure />
				</Suspense>
			</FigureMaxWidthContext.Provider>
			{caption ? (
				<Text variant="small" tone="muted">
					{caption}
				</Text>
			) : null}
		</div>
	);
}
