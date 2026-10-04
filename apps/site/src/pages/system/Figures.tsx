import { Suspense } from 'react';
import { figures, lazyFigure } from '@fhudson/figures';
import { Text } from '@fhudson/ui';

/*
 * The figures identity sheet (docs/plans/figures.md, Phase 1): the rules, and the post 00
 * figures from @fhudson/figures that show them. Each figure's code loads on its own.
 */

const sheet = figures
	.filter((f) => f.number.startsWith('BN-00-'))
	.map((f) => ({ ...f, Figure: lazyFigure(f) }));

const rules = [
	[
		'Drawn, not rendered',
		'Line work on paper. No gradients, shadows, lighting or perspective.',
	],
	[
		'Lines draw on',
		'Strokes appear in the order you would draw them by hand; nodes arrive as rings.',
	],
	[
		'Flow is moving dashes',
		'Verdigris dashes at constant speed along a line. Faster means more.',
	],
	[
		'Beats of 400 ms',
		'A build step is 800 ms, a hold 1600 ms. Linear for drawing, ease-out to settle.',
	],
	[
		'3D is orthographic',
		'Isometric camera, paper faces, ink edges. Fixed, or one slow constant turn.',
	],
	[
		'Reduced motion',
		'Shows the finished drawing, with play and a time scrubber to step through.',
	],
];

export function Figures() {
	return (
		<div className="flex flex-col gap-10">
			<dl className="grid gap-x-8 gap-y-3 md:grid-cols-2">
				{rules.map(([rule, detail]) => (
					<div
						key={rule}
						className="flex flex-col gap-1 border-b border-hairline pb-3"
					>
						<dt className="font-data text-small text-ink">
							{rule}
						</dt>
						<dd className="text-small text-ink-muted">{detail}</dd>
					</div>
				))}
			</dl>
			{sheet.map(({ slug, title, Figure }) => (
				<div key={slug} className="flex flex-col gap-3">
					<Text variant="label">{title}</Text>
					<Suspense fallback={null}>
						<Figure />
					</Suspense>
				</div>
			))}
		</div>
	);
}
