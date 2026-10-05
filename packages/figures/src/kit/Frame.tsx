import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, TitleBlock } from '@fhudson/ui';
import {
	COMPACT_BELOW,
	FigureMaxWidthContext,
	FigureWidthContext,
} from './context';
import { BEAT } from './time';
import { interactiveUrl, type FigureMeta } from './types';
import type { Clock } from './useClock';

function Controls({ clock }: { clock: Clock }) {
	// A once-through build only needs a way to see it again
	if (clock.once)
		return (
			<div className="flex flex-wrap items-center gap-3">
				<Button
					variant="ghost"
					size="sm"
					onPress={clock.restart}
					isDisabled={!clock.started}
				>
					Replay
				</Button>
			</div>
		);
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Button variant="ghost" size="sm" onPress={clock.toggle}>
				{clock.playing ? 'Pause' : 'Play'}
			</Button>
			{clock.duration ? (
				<label className="flex items-center gap-3 font-data text-label uppercase tracking-widest text-ink-muted">
					Time
					<input
						type="range"
						min={0}
						max={clock.duration}
						step={BEAT / 10}
						value={clock.time}
						onChange={(event) => {
							if (clock.playing) clock.toggle();
							clock.setTime(Number(event.target.value));
						}}
						className="w-40 accent-[var(--sl-verdigris)]"
					/>
					<span className="w-12 tabular-nums text-ink">
						{(clock.time / 1000).toFixed(1)} s
					</span>
				</label>
			) : null}
		</div>
	);
}

/**
 * The sheet every figure sits on: a drawing grid, a title block strip (where to find the
 * interactive version, drawing number, source, date), and play controls when the figure
 * moves. Measures its width, so figures can switch to a compact layout and keep labels at
 * their true size.
 */
export function Frame({
	meta,
	clock,
	children,
}: {
	meta: FigureMeta;
	clock?: Clock;
	/** A node, or a function of the measured size for figures with a compact layout. */
	children:
		| ReactNode
		| ((size: { width: number; compact: boolean }) => ReactNode);
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const maxWidth = useContext(FigureMaxWidthContext);
	const waiting = clock?.once && !clock.started ? clock.start : undefined;

	// A once-through build starts when half of it has scrolled into view
	useEffect(() => {
		const element = ref.current;
		if (!element || !waiting) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) waiting();
			},
			{ threshold: 0.5 }
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, [waiting]);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => {
			setWidth(entry.contentRect.width);
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<figure
			className="flex w-full flex-col gap-3"
			style={{
				maxWidth: Number.isFinite(maxWidth) ? maxWidth : undefined,
			}}
			data-figure={meta.number}
		>
			<div
				data-figure-sheet
				className="flex flex-col border-[1.5px] border-ink bg-paper"
			>
				<div ref={ref} className="drawing-grid">
					<FigureWidthContext.Provider value={width}>
						{typeof children === 'function'
							? children({
									width,
									compact: width > 0 && width < COMPACT_BELOW,
								})
							: children}
					</FigureWidthContext.Provider>
				</div>
				<TitleBlock
					className="border-0 border-t-[1.5px]"
					fields={[
						{ label: 'Interactive', value: interactiveUrl(meta) },
						{ label: 'Drawing', value: meta.number },
						{ label: 'Source', value: meta.source },
						{ label: 'Date', value: meta.date },
					]}
				/>
			</div>
			{clock && !clock.fixed ? <Controls clock={clock} /> : null}
		</figure>
	);
}
