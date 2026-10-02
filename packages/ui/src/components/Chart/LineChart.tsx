import { type PointerEvent } from 'react';
import { cn } from '../../lib/cn';
import { AxisFrame, CategoryAxis, ValueAxis } from './axes';
import { ChartFrame, PlotArea } from './ChartFrame';
import { ChartPlaceholder } from './ChartPlaceholder';
import { ChartTooltip } from './ChartTooltip';
import { INK, LABEL_FONT, MUTED, PAPER, seriesColor } from './colors';
import { Marker } from './Marker';
import { finite, labelStride, linear, niceTicks, px, runs } from './scale';
import {
	defaultFormat,
	normaliseSeries,
	type ChartPoint,
	type ChartSeries,
} from './series';
import { useChartFocus } from './useChartFocus';
import { useChartWidth } from './useChartWidth';

export type LineChartPoint = ChartPoint;

export interface LineChartProps {
	/** Accessible name, e.g. "Readiness, last 8 days". Also the single series' name. */
	label: string;
	/** One series, as label/value pairs. */
	data?: ChartPoint[];
	/** Several series sharing these category labels. Up to six; past that, fold into "Other". */
	categories?: string[];
	series?: ChartSeries[];
	/** 'step' holds each value until the next, for prices and settlement periods. */
	curve?: 'linear' | 'step';
	/** A light wash under a single series. */
	showArea?: boolean;
	/** Markers on every point. Defaults to on when there are 16 points or fewer. */
	showPoints?: boolean;
	yDomain?: [number, number];
	height?: number;
	formatValue?: (value: number) => string;
	/** Header for the category column of the data table. */
	categoryLabel?: string;
	/** Draws the frame at its full size, with a placeholder plot, while data loads. */
	loading?: boolean;
	className?: string;
}

const PAD = { top: 14, bottom: 30, left: 44 };
const INSET = 14;

/**
 * A line over time, drawn like an instrument trace: ink axes with ticks, thin lines,
 * square markers, crosses for missing readings, and a crosshair that reads every series.
 */
export function LineChart({
	label,
	data,
	categories: categoriesProp,
	series: seriesProp,
	curve = 'linear',
	showArea = false,
	showPoints,
	yDomain,
	height = 200,
	formatValue = defaultFormat,
	categoryLabel = 'Label',
	loading = false,
	className,
}: LineChartProps) {
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
								kind: 'line' as const,
							}))
						: undefined
				}
				table={{ columns: [], rows: [] }}
				loading
				className={className}
			>
				<ChartPlaceholder height={height} label={label} />
			</ChartFrame>
		);
	}
	const values = finite(series.flatMap((s) => s.values));
	const multi = series.length > 1;

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
		kind: 'line' as const,
	}));

	if (values.length === 0) {
		return (
			<ChartFrame label={label} table={table} className={className}>
				<div
					className="flex items-center justify-center border border-dashed border-hairline font-data text-label uppercase tracking-widest text-ink-muted"
					style={{ height }}
				>
					No data
				</div>
			</ChartFrame>
		);
	}

	const ticks = yDomain
		? niceTicks(yDomain[0], yDomain[1])
		: niceTicks(Math.min(...values), Math.max(...values));
	const [d0, d1] = yDomain ?? [ticks[0], ticks[ticks.length - 1]];
	const visibleTicks = ticks.filter((t) => t >= d0 && t <= d1);

	// End labels for up to four series, dropped if any two would collide
	const ends =
		multi && series.length <= 4
			? series.map((s, i) => {
					const last = s.values.reduce<number>(
						(acc, v, j) => (v === null ? acc : j),
						-1
					);
					return {
						i,
						last,
						value: last >= 0 ? (s.values[last] ?? 0) : null,
					};
				})
			: [];
	const right = ends.length ? 96 : 16;
	const base = height - PAD.bottom;
	const y = linear(d0, d1, base, PAD.top);
	const innerW = Math.max(40, width - PAD.left - right - INSET * 2);
	const x = (i: number) =>
		PAD.left +
		INSET +
		(categories.length === 1
			? innerW / 2
			: (i * innerW) / (categories.length - 1));
	const endYs = ends
		.filter((e) => e.value !== null)
		.map((e) => y(e.value ?? 0))
		.sort((a, b) => a - b);
	const endLabels = endYs.every(
		(v, k) => k === 0 || v - (endYs[k - 1] ?? 0) >= 13
	)
		? ends
		: [];

	const path = (values: (number | null)[], run: number[]) =>
		run
			.map((i, k) => {
				const v = values[i] ?? 0;
				if (k === 0) return `M${px(x(i))} ${px(y(v))}`;
				return curve === 'step'
					? `H${px(x(i))} V${px(y(v))}`
					: `L${px(x(i))} ${px(y(v))}`;
			})
			.join(' ');

	const markers = showPoints ?? categories.length <= 16;
	const lastIndex =
		series[0]?.values.reduce<number>(
			(acc, v, j) => (v === null ? acc : j),
			-1
		) ?? -1;

	const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const step =
			categories.length > 1 ? innerW / (categories.length - 1) : innerW;
		const index = Math.round(
			(e.clientX - rect.left - PAD.left - INSET) / step
		);
		point(Math.min(categories.length - 1, Math.max(0, index)));
	};

	const activeIndex = active?.index ?? null;
	const rows =
		activeIndex === null
			? []
			: series.map((s, i) => ({
					label: s.label,
					value:
						s.values[activeIndex] === null
							? 'No data'
							: formatValue(s.values[activeIndex] ?? 0),
					color: seriesColor(i),
				}));
	const liveText =
		fromKeyboard && activeIndex !== null
			? `${categories[activeIndex] ?? ''}: ${rows.map((r) => (multi ? `${r.label} ${r.value}` : r.value)).join(', ')}`
			: '';

	return (
		<ChartFrame
			label={label}
			legend={multi ? legend : undefined}
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
					className={cn('block max-w-full overflow-visible')}
					aria-hidden="true"
					onPointerMove={onPointerMove}
				>
					<ValueAxis
						ticks={visibleTicks}
						y={y}
						left={PAD.left}
						right={width - right}
						format={formatValue}
						base={d0}
					/>
					<AxisFrame
						left={PAD.left}
						top={PAD.top}
						right={width - right}
						base={base}
					/>
					<CategoryAxis
						labels={categories}
						x={x}
						base={base}
						height={height}
						stride={labelStride(
							categories.length,
							Math.max(2, Math.floor(innerW / 64))
						)}
					/>

					{showArea &&
						!multi &&
						runs(series[0]?.values ?? [])
							.filter((r) => r.length > 1)
							.map((r) => (
								<path
									key={`area-${String(r[0])}`}
									d={`${path(series[0]?.values ?? [], r)} L${px(x(r[r.length - 1] ?? 0))} ${px(base)} L${px(x(r[0] ?? 0))} ${px(base)} Z`}
									fill={seriesColor(0)}
									opacity="0.1"
								/>
							))}

					{series.map((s, si) =>
						runs(s.values).map((r) => (
							<path
								key={`${s.id}-${String(r[0])}`}
								d={path(s.values, r)}
								fill="none"
								stroke={seriesColor(si)}
								strokeWidth="1.5"
								strokeLinejoin="miter"
							/>
						))
					)}

					{categories.map((c, i) =>
						series.every((s) => s.values[i] === null) ? (
							<path
								key={`gap-${c}-${String(i)}`}
								d={`M${px(x(i) - 3.5)} ${px(base - 10)} l7 7 M${px(x(i) + 3.5)} ${px(base - 10)} l-7 7`}
								stroke={MUTED}
								strokeWidth="1.5"
							/>
						) : null
					)}

					{markers &&
						series.map((s, si) =>
							s.values.map((v, i) =>
								v === null ? null : multi ? (
									<Marker
										key={`${s.id}-pt-${String(i)}`}
										x={x(i)}
										y={y(v)}
										size={7}
										fill={seriesColor(si)}
									/>
								) : (
									<Marker
										key={`${s.id}-pt-${String(i)}`}
										x={x(i)}
										y={y(v)}
										size={i === lastIndex ? 9 : 7}
										fill={
											i === lastIndex
												? seriesColor(0)
												: PAPER
										}
										stroke={seriesColor(0)}
									/>
								)
							)
						)}

					{/* End labels with a dotted leader: never in the series colour, so the leader can't read as data */}
					{endLabels.map((e) =>
						e.value === null ? null : (
							<g key={`end-${String(e.i)}`}>
								<line
									x1={px(x(e.last) + 7)}
									x2={px(width - right + 10)}
									y1={px(y(e.value))}
									y2={px(y(e.value))}
									stroke={MUTED}
									strokeWidth="1"
									strokeDasharray="1 3"
								/>
								<text
									x={px(width - right + 14)}
									y={px(y(e.value) + 3.5)}
									fill={INK}
									style={LABEL_FONT}
								>
									{series[e.i]?.label}
								</text>
							</g>
						)
					)}

					{activeIndex !== null && (
						<g>
							<line
								x1={px(x(activeIndex))}
								x2={px(x(activeIndex))}
								y1={px(PAD.top)}
								y2={px(base)}
								stroke={MUTED}
								strokeWidth="1"
							/>
							{series.map((s, si) => {
								const v = s.values[activeIndex];
								return v === null ? null : (
									<Marker
										key={`${s.id}-active`}
										x={x(activeIndex)}
										y={y(v)}
										size={10}
										fill={seriesColor(si)}
									/>
								);
							})}
						</g>
					)}
				</svg>
				{activeIndex !== null && (
					<ChartTooltip
						x={x(activeIndex)}
						y={PAD.top}
						width={width}
						title={categories[activeIndex] ?? ''}
						rows={rows}
					/>
				)}
			</PlotArea>
		</ChartFrame>
	);
}
