import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { figureBySlug, lazyFigure } from '@fhudson/figures';
import { Heading, Link, Text } from '@fhudson/ui';
import OpenCircuitPage from '../faults/OpenCircuitPage';

/**
 * fhudson.com/f/<slug>: where "Interactive version" links in Substack captions land. Inside the
 * site shell, so readers arrive on the site, not a bare page. /f/<slug>/embed is the bare one.
 */
function FigurePage() {
	const { slug } = useParams<{ slug: string }>();
	const figure = slug ? figureBySlug(slug) : undefined;
	if (!figure) return <OpenCircuitPage />;
	const Figure = lazyFigure(figure);

	return (
		<article className="flex flex-col gap-8">
			<header className="flex flex-col gap-4">
				<Text variant="label">{`Boundary Node · Figure ${figure.number}`}</Text>
				{/* Figure titles are sentences, too long for the display face */}
				<Heading
					level={1}
					className="font-body text-h2 font-semibold normal-case tracking-normal"
				>
					{figure.title}
				</Heading>
			</header>
			<Suspense fallback={null}>
				<Figure />
			</Suspense>
			<div className="flex max-w-[728px] flex-col gap-4">
				<Text>{figure.alt}</Text>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					<Link
						href="https://finlayhu.substack.com"
						variant="standalone"
					>
						Read Boundary Node
					</Link>
					<Link href="/f" variant="standalone">
						All figures
					</Link>
				</div>
			</div>
		</article>
	);
}

export default FigurePage;
