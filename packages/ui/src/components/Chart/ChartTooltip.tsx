import { SeriesKey, type MarkerShape } from './Marker';

export interface TooltipRow {
	label: string;
	value: string;
	color?: string;
	kind?: 'line' | MarkerShape;
}

/**
 * The hover and focus readout. Values lead and series names follow, because the reader
 * already knows the series and wants the number.
 */
export function ChartTooltip({
	x,
	y,
	width,
	title,
	rows,
}: {
	x: number;
	y: number;
	/** The chart's width, so the tooltip flips to the left near the right edge. */
	width: number;
	title: string;
	rows: TooltipRow[];
}) {
	const flip = x > width - 190;
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute z-10 flex min-w-36 flex-col gap-1.5 border border-ink bg-paper px-3 py-2 shadow-[3px_3px_0_var(--sl-hairline)]"
			style={{
				left: x,
				top: Math.max(0, y),
				transform: flip
					? 'translateX(calc(-100% - 14px))'
					: 'translateX(14px)',
			}}
		>
			<span className="font-data text-label uppercase tracking-widest text-ink-muted">
				{title}
			</span>
			{rows.map((row) => (
				<span
					key={row.label}
					className="flex items-center gap-2 whitespace-nowrap"
				>
					{row.color && (
						<SeriesKey
							color={row.color}
							kind={row.kind ?? 'line'}
						/>
					)}
					<span className="font-data text-small font-semibold tabular-nums text-ink">
						{row.value}
					</span>
					<span className="text-small text-ink-muted">
						{row.label}
					</span>
				</span>
			))}
		</div>
	);
}
