import { Suspense, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { figureBySlug, lazyFigure } from '@fhudson/figures';

/**
 * fhudson.com/f/<slug>/embed: the figure alone, for iframes. ?theme=dark|light overrides the
 * theme for this page only, so an embed can match the page around it.
 */
function FigureEmbedPage() {
	const { slug } = useParams<{ slug: string }>();
	const [params] = useSearchParams();
	const theme = params.get('theme');
	const figure = slug ? figureBySlug(slug) : undefined;

	useEffect(() => {
		if (theme !== 'dark' && theme !== 'light') return;
		const root = document.documentElement;
		const previous = root.getAttribute('data-theme');
		root.setAttribute('data-theme', theme);
		return () => {
			if (previous === null) root.removeAttribute('data-theme');
			else root.setAttribute('data-theme', previous);
		};
	}, [theme]);

	if (!figure)
		return (
			<p className="p-4 font-data text-small text-fault">
				No figure called {slug}
			</p>
		);
	const Figure = lazyFigure(figure);
	return (
		<main id="main">
			<Suspense fallback={null}>
				<Figure />
			</Suspense>
		</main>
	);
}

export default FigureEmbedPage;
