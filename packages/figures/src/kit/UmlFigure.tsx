import { useMemo } from 'react';
import { Frame } from './Frame';
import { BEAT, drawOn, progress, settle } from './time';
import { layoutUml, type UmlSpec } from './uml';
import { umlBuild } from './umlBuild';
import { useClock } from './useClock';
import type { FigureMeta } from './types';

/**
 * On a wide screen, wide diagrams never shrink below this, so their text stays readable; they
 * scroll sideways. On a phone they fit the width instead (readers pinch to zoom), because a
 * scrolled diagram opens on its empty edge.
 */
const MIN_SCALE = 0.6;

/**
 * A UML class diagram that draws itself. With `previous`, only what's new since that diagram
 * draws on, in verdigris; the rest is there from the start, in ink. Without, it all draws on.
 */
export function UmlFigure({
	meta,
	spec,
	previous,
}: {
	meta: FigureMeta;
	spec: UmlSpec;
	previous?: UmlSpec;
}) {
	// Diagrams draw once, when the reader reaches them, and stay drawn
	const clock = useClock(meta.duration, { once: true });
	const layout = useMemo(() => layoutUml(spec), [spec]);
	const steps = useMemo(
		() => new Map(umlBuild(spec, previous).steps.map((s) => [s.group, s])),
		[spec, previous]
	);
	const t = clock.time;
	const highlight = previous !== undefined;

	const colour = (group: string, tone: 'ink' | 'muted' = 'ink') =>
		highlight && steps.has(group)
			? 'var(--sl-verdigris)'
			: tone === 'ink'
				? 'var(--sl-ink)'
				: 'var(--sl-ink-muted)';
	const drawn = (group: string) => {
		const s = steps.get(group);
		return s ? progress(t, s.start, s.length) : 1;
	};
	const shown = (group: string) => {
		const s = steps.get(group);
		return s ? settle(progress(t, s.start + s.length - BEAT / 2, BEAT)) : 1;
	};

	return (
		<Frame meta={meta} clock={clock}>
			{({ width, compact }) => {
				const fit = width > 0 ? Math.min(1, width / layout.width) : 1;
				const scale =
					clock.fixed || compact ? fit : Math.max(fit, MIN_SCALE);
				return (
					<div className="overflow-x-auto">
						<svg
							viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`}
							width={layout.width * scale}
							height={layout.height * scale}
							className="mx-auto block"
							role="img"
							aria-label={meta.alt}
						>
							{layout.shapes.map((shape, i) => {
								const p = drawn(shape.group);
								const common = {
									stroke: colour(shape.group),
									strokeWidth: 1.5,
									...drawOn(p),
								};
								return shape.kind === 'rect' ? (
									<rect
										key={i}
										{...shape.geometry}
										fill="var(--sl-paper)"
										fillOpacity={p}
										{...common}
									/>
								) : shape.kind === 'polygon' ? (
									<polygon
										key={i}
										{...shape.geometry}
										fill="var(--sl-paper)"
										{...common}
									/>
								) : (
									<path
										key={i}
										{...shape.geometry}
										fill="none"
										{...common}
									/>
								);
							})}
							{layout.texts.map((text, i) => (
								<text
									key={i}
									x={text.x}
									y={text.y}
									textAnchor={text.anchor}
									opacity={shown(text.group)}
									fill={colour(text.group, text.tone)}
									style={{
										fontFamily:
											text.face === 'body'
												? 'var(--sl-font-body)'
												: 'var(--sl-font-data)',
										fontSize: text.size,
										fontWeight:
											text.face === 'body' ? 600 : 400,
									}}
								>
									{text.text}
								</text>
							))}
						</svg>
					</div>
				);
			}}
		</Frame>
	);
}
