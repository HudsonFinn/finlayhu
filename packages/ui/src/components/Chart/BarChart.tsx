import { type PointerEvent } from 'react';
import { ChartFrame, PlotArea } from './ChartFrame';
import { ChartPlaceholder } from './ChartPlaceholder';
import { ChartTooltip } from './ChartTooltip';
import { HAIRLINE, INK, LABEL_FONT, MUTED, seriesColor } from './colors';
import { linear, niceTicks, px } from './scale';
import {
	defaultFormat,
	normaliseSeries,
	type ChartPoint,
	type ChartSeries,
} from './series';
import { useChartFocus } from './useChartFocus';
import { useChartWidth } from './useChartWidth';

export interface BarChartProps {
	label: string;
	/** One series, as label/value pairs. */
	data?: ChartPoint[];
	categories?: string[];
	series?: ChartSeries[];
	/** 'horizontal' suits many categories or long names. */
	orientation?: 'vertical' | 'horizontal';
	/** For several series: side by side, or stacked into one bar. */
	layout?: 'grouped' | 'stacked';
	/** Values at the bar tips. Defaults on for one series with twelve bars or fewer. */
	showValues?: boolean;
	height?: number;
	formatValue?: (value: number) => string;
	categoryLabel?: string;
	/** Draws the frame at its full size, with a placeholder plot, while data loads. */
	loading?: boolean;
	className?: string;
}

const MAX_BAR = 24;
const GAP = 2;

/** Bars that grow from one baseline. Square ends, thin bars, a 2px gap between neighbours. */
export function BarChart({
	label,
	data,
	categories: categoriesProp,
	series: seriesProp,
	orientation = 'vertical',
	layout = 'grouped',
	showValues,
	height: heightProp,
	formatValue = defaultFormat,
	categoryLabel = 'Label',
	loading = false,
	className,
}: BarChartProps) {
	const { categories, series } = normaliseSeries({
		data,
		categories: categoriesProp,
		series: seriesProp,
		label,
	});
	const [ref, width] = useChartWidth();
	const { active, fromKeyboard, point, focusProps } = useChartFocus({
		count: categories.length,
	});

	// While loading, keep the chart's final footprint so the page doesn't move when data arrives
	if (loading) {
		return (
			<ChartFrame
				label={label}
				legend={
					series.length > 1
						? series.map((s, i) => ({
								label: s.label,
								color: seriesColor(i),
								kind: 'square' as const,
							}))
						: undefined
				}
				table={{ columns: [], rows: [] }}
				loading
				className={className}
			>
				<ChartPlaceholder height={heightProp ?? 220} label={label} />
			</ChartFrame>
		);
	}
	const horizontal = orientation === 'horizontal';
	const stacked = layout === 'stacked' && series.length > 1;
	const n = categories.length;
	const k = series.length;
	const labelsOn = showValues ?? (k === 1 && n <= 12);

	// Value domain: stacks sum positives; grouped bars may go below zero
	const sums = categories.map((_, i) =>
		series.reduce((sum, s) => sum + Math.max(0, s.values[i] ?? 0), 0)
	);
	const all = series.flatMap((s) => s.values.map((v) => v ?? 0));
	const lo = stacked ? 0 : Math.min(0, ...all);
	const hi = stacked ? Math.max(0, ...sums) : Math.max(0, ...all);
	// Counts get whole-number ticks
	const integer = all.every((v) => Number.isInteger(v));
	const ticks = niceTicks(lo, hi || 1, 4, integer);
	const v0 = ticks[0] ?? 0;
	const v1 = ticks[ticks.length - 1] ?? 1;

	const longest = Math.max(...categories.map((c) => c.length), 1);
	const pad = horizontal
		? {
				top: 8,
				right: labelsOn ? 56 : 20,
				bottom: 28,
				left: Math.min(160, Math.max(56, longest * 6.4 + 14)),
			}
		: { top: labelsOn ? 22 : 14, right: 16, bottom: 30, left: 48 };
	const height =
		heightProp ??
		(horizontal
			? pad.top +
				pad.bottom +
				n * Math.max(28, k * (MAX_BAR / 2 + GAP) + 12)
			: 220);
	const plotW = Math.max(40, width - pad.left - pad.right);
	const plotH = height - pad.top - pad.bottom;
	const bandSize = (horizontal ? plotH : plotW) / Math.max(1, n);
	const value = horizontal
		? linear(v0, v1, pad.left, pad.left + plotW)
		: linear(v0, v1, pad.top + plotH, pad.top);
	const zero = value(0);
	const barSize =
		stacked || k === 1
			? Math.min(MAX_BAR, bandSize * 0.6)
			: Math.min(MAX_BAR, (bandSize * 0.75 - GAP * (k - 1)) / k);
	const bandStart = (i: number) =>
		(horizontal ? pad.top : pad.left) + i * bandSize;
	const groupWidth =
		stacked || k === 1 ? barSize : k * barSize + (k - 1) * GAP;

	// Every bar segment as a rectangle in pixel space
	const bars = categories
		.flatMap((_, i) => {
			let running = 0;
			return series.map((s, si) => {
				const v = s.values[i];
				if (v === null) return null;
				const offset =
					(bandSize - groupWidth) / 2 +
					(stacked || k === 1 ? 0 : si * (barSize + GAP));
				const from = stacked ? value(running) : zero;
				const to = stacked ? value(running + Math.max(0, v)) : value(v);
				if (stacked) running += Math.max(0, v);
				// Leave a 2px surface gap between stacked segments
				const gap = stacked && si > 0 ? GAP : 0;
				const a = Math.min(from, to),
					b = Math.max(from, to);
				const along = horizontal
					? { x: a + gap, w: Math.max(0, b - a - gap) }
					: { y: a, h: Math.max(0, b - a - gap) };
				const across = bandStart(i) + offset;
				return horizontal
					? {
							key: `${s.id}-${String(i)}`,
							si,
							i,
							v,
							x: along.x ?? 0,
							y: across,
							w: along.w ?? 0,
							h: barSize,
						}
					: {
							key: `${s.id}-${String(i)}`,
							si,
							i,
							v,
							x: across,
							y: along.y ?? 0,
							w: barSize,
							h: along.h ?? 0,
						};
			});
		})
		.filter((b): b is NonNullable<typeof b> => b !== null);

	const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const pos = horizontal
			? e.clientY - rect.top - pad.top
			: e.clientX - rect.left - pad.left;
		const i = Math.floor(pos / bandSize);
		point(i >= 0 && i < n ? i : null);
	};

	const activeIndex = active?.index ?? null;
	const rows =
		activeIndex === null
			? []
			: series.map((s, si) => ({
					label: s.label,
					value:
						s.values[activeIndex] === null
							? 'No data'
							: formatValue(s.values[activeIndex] ?? 0),
					color: seriesColor(si),
					kind: 'square' as const,
				}));
	if (stacked && activeIndex !== null)
		rows.push({
			label: 'Total',
			value: formatValue(sums[activeIndex] ?? 0),
			color: '',
			kind: 'square',
		});
	const liveText =
		fromKeyboard && activeIndex !== null
			? `${categories[activeIndex] ?? ''}: ${rows.map((r) => (k > 1 ? `${r.label} ${r.value}` : r.value)).join(', ')}`
			: '';

	const table = {
		columns: [categoryLabel, ...series.map((s) => s.label)],
		rows: categories.map((c, i) => ({
			key: `${c}-${String(i)}`,
			cells: [
				c,
				...series.map((s) =>
					s.values[i] === null
						? 'No data'
						: formatValue(s.values[i] ?? 0)
				),
			],
		})),
	};
	const legend = series.map((s, i) => ({
		label: s.label,
		color: seriesColor(i),
		kind: 'square' as const,
	}));
	// Vertical category labels must fit their band; shorten them rather than let them collide.
	// The full name stays in the tooltip and the table.
	const fit = (text: string) => {
		const room = Math.floor((bandSize - 6) / 6.2);
		return horizontal || text.length <= room
			? text
			: `${text.slice(0, Math.max(2, room - 1))}…`;
	};
	const tooltipAt =
		activeIndex === null ? 0 : bandStart(activeIndex) + bandSize / 2;

	return (
		<ChartFrame
			label={label}
			legend={k > 1 ? legend : undefined}
			table={table}
			liveText={liveText}
			className={className}
		>
			<PlotArea
				label={label}
				focusProps={focusProps}
				plotRef={ref}
				onPointerLeave={() => {
					point(null);
				}}
			>
				<svg
					width={width}
					height={height}
					viewBox={`0 0 ${String(width)} ${String(height)}`}
					className="block max-w-full overflow-visible"
					aria-hidden="true"
					onPointerMove={onPointerMove}
				>
					{activeIndex !== null && (
						<rect
							{...(horizontal
								? {
										x: pad.left,
										y: bandStart(activeIndex),
										width: plotW,
										height: bandSize,
									}
								: {
										x: bandStart(activeIndex),
										y: pad.top,
										width: bandSize,
										height: plotH,
									})}
							fill="var(--sl-sheet)"
						/>
					)}
					{/* Value gridlines and labels */}
					{ticks.map((t) => {
						const p = value(t);
						return (
							<g key={t}>
								{t !== 0 &&
									(horizontal ? (
										<line
											x1={px(p)}
											x2={px(p)}
											y1={px(pad.top)}
											y2={px(pad.top + plotH)}
											stroke={HAIRLINE}
											strokeWidth="1"
										/>
									) : (
										<line
											x1={px(pad.left)}
											x2={px(pad.left + plotW)}
											y1={px(p)}
											y2={px(p)}
											stroke={HAIRLINE}
											strokeWidth="1"
										/>
									))}
								{horizontal ? (
									<text
										x={px(p)}
										y={px(height - 8)}
										textAnchor="middle"
										fill={MUTED}
										style={LABEL_FONT}
									>
										{formatValue(t)}
									</text>
								) : (
									<text
										x={px(pad.left - 8)}
										y={px(p + 3.5)}
										textAnchor="end"
										fill={MUTED}
										style={LABEL_FONT}
									>
										{formatValue(t)}
									</text>
								)}
							</g>
						);
					})}
					{bars.map((b) => (
						<rect
							key={b.key}
							x={px(b.x)}
							y={px(b.y)}
							width={px(b.w)}
							height={px(b.h)}
							fill={seriesColor(b.si)}
						/>
					))}
					{/* Baseline at zero */}
					{horizontal ? (
						<line
							x1={px(zero)}
							x2={px(zero)}
							y1={px(pad.top)}
							y2={px(pad.top + plotH)}
							stroke={INK}
							strokeWidth="1"
						/>
					) : (
						<line
							x1={px(pad.left)}
							x2={px(pad.left + plotW)}
							y1={px(zero)}
							y2={px(zero)}
							stroke={INK}
							strokeWidth="1"
						/>
					)}
					{/* Category labels */}
					{categories.map((c, i) => {
						const mid = bandStart(i) + bandSize / 2;
						return horizontal ? (
							<text
								key={`${c}-${String(i)}`}
								x={px(pad.left - 8)}
								y={px(mid + 3.5)}
								textAnchor="end"
								fill={INK}
								style={LABEL_FONT}
							>
								{c}
							</text>
						) : (
							<text
								key={`${c}-${String(i)}`}
								x={px(mid)}
								y={px(height - 8)}
								textAnchor="middle"
								fill={MUTED}
								style={LABEL_FONT}
							>
								{fit(c)}
							</text>
						);
					})}
					{labelsOn &&
						bars.map((b) => {
							const negative = b.v < 0;
							return horizontal ? (
								<text
									key={`${b.key}-v`}
									x={px(negative ? b.x - 6 : b.x + b.w + 6)}
									y={px(b.y + b.h / 2 + 3.5)}
									textAnchor={negative ? 'end' : 'start'}
									fill={MUTED}
									style={LABEL_FONT}
								>
									{formatValue(b.v)}
								</text>
							) : (
								<text
									key={`${b.key}-v`}
									x={px(b.x + b.w / 2)}
									y={px(negative ? b.y + b.h + 13 : b.y - 6)}
									textAnchor="middle"
									fill={MUTED}
									style={LABEL_FONT}
								>
									{formatValue(b.v)}
								</text>
							);
						})}
				</svg>
				{activeIndex !== null && (
					<ChartTooltip
						x={horizontal ? pad.left + plotW / 2 : tooltipAt}
						y={horizontal ? tooltipAt - 16 : pad.top}
						width={width}
						title={categories[activeIndex] ?? ''}
						rows={rows.map((r) =>
							r.color ? r : { label: r.label, value: r.value }
						)}
					/>
				)}
			</PlotArea>
		</ChartFrame>
	);
}
