import { type PointerEvent } from 'react';
import { AxisFrame, CategoryAxis, ValueAxis } from './axes';
import { ChartFrame, PlotArea } from './ChartFrame';
import { ChartPlaceholder } from './ChartPlaceholder';
import { ChartTooltip } from './ChartTooltip';
import { MUTED, PAPER, seriesColor } from './colors';
import { labelStride, linear, niceTicks, px, runs } from './scale';
import { defaultFormat, type ChartSeries } from './series';
import { useChartFocus } from './useChartFocus';
import { useChartWidth } from './useChartWidth';

export interface AreaChartProps {
	label: string;
	categories: string[];
	/** Stacked bottom to top, in this order. Up to six. */
	series: ChartSeries[];
	height?: number;
	formatValue?: (value: number) => string;
	categoryLabel?: string;
	/** Draws the frame at its full size, with a placeholder plot, while data loads. */
	loading?: boolean;
	className?: string;
}

const PAD = { top: 14, right: 16, bottom: 30, left: 48 };

/**
 * Stacked areas: how a total splits into parts over time, such as generation by fuel.
 * A thin gap in the surface colour separates each band.
 */
export function AreaChart({
	label,
	categories,
	series,
	height = 220,
	formatValue = defaultFormat,
	categoryLabel = 'Label',
	loading = false,
	className,
}: AreaChartProps) {
	const [ref, width] = useChartWidth();
	const { active, fromKeyboard, point, focusProps } = useChartFocus({
		count: categories.length,
	});

	// While loading, keep the chart's final footprint so the page doesn't move when data arrives
	if (loading) {
		return (
			<ChartFrame
				label={label}
				legend={series.map((s, i) => ({
					label: s.label,
					color: seriesColor(i),
					kind: 'square' as const,
				}))}
				table={{ columns: [], rows: [] }}
				loading
				className={className}
			>
				<ChartPlaceholder height={height} label={label} />
			</ChartFrame>
		);
	}

	// Cumulative tops per series; a category where every series is missing is a gap
	const totals = categories.map((_, i) =>
		series.every((s) => s.values[i] === null)
			? null
			: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0)
	);
	const tops = series.map((_, si) =>
		categories.map((_, i) =>
			totals[i] === null
				? null
				: series
						.slice(0, si + 1)
						.reduce((sum, s) => sum + (s.values[i] ?? 0), 0)
		)
	);
	const max = Math.max(0, ...totals.map((t) => t ?? 0));
	const ticks = niceTicks(0, max || 1);
	const d1 = ticks[ticks.length - 1] ?? 1;
	const base = height - PAD.bottom;
	const y = linear(0, d1, base, PAD.top);
	const innerW = Math.max(40, width - PAD.left - PAD.right);
	const x = (i: number) =>
		PAD.left +
		(categories.length === 1
			? innerW / 2
			: (i * innerW) / (categories.length - 1));

	const band = (si: number, run: number[]) => {
		const top = tops[si] ?? [];
		const bottom = si === 0 ? null : tops[si - 1];
		const upper = run
			.map((i, k) => `${k ? 'L' : 'M'}${px(x(i))} ${px(y(top[i] ?? 0))}`)
			.join(' ');
		const lower = [...run]
			.reverse()
			.map((i) => `L${px(x(i))} ${px(y(bottom ? (bottom[i] ?? 0) : 0))}`)
			.join(' ');
		return `${upper} ${lower} Z`;
	};
	const edge = (si: number, run: number[]) =>
		run
			.map(
				(i, k) =>
					`${k ? 'L' : 'M'}${px(x(i))} ${px(y(tops[si]?.[i] ?? 0))}`
			)
			.join(' ');

	const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const step =
			categories.length > 1 ? innerW / (categories.length - 1) : innerW;
		point(
			Math.min(
				categories.length - 1,
				Math.max(
					0,
					Math.round((e.clientX - rect.left - PAD.left) / step)
				)
			)
		);
	};

	const activeIndex = active?.index ?? null;
	const totalValue = activeIndex === null ? null : totals[activeIndex];
	const rows =
		activeIndex === null
			? []
			: [
					...[...series]
						.map((s, si) => ({
							label: s.label,
							value:
								s.values[activeIndex] === null
									? 'No data'
									: formatValue(s.values[activeIndex] ?? 0),
							color: seriesColor(si),
							kind: 'square' as const,
						}))
						.reverse(),
					{
						label: 'Total',
						value:
							totalValue === null
								? 'No data'
								: formatValue(totalValue),
					},
				];
	const liveText =
		fromKeyboard && activeIndex !== null
			? `${categories[activeIndex] ?? ''}: ${rows.map((r) => `${r.label} ${r.value}`).join(', ')}`
			: '';

	const table = {
		columns: [categoryLabel, ...series.map((s) => s.label), 'Total'],
		rows: categories.map((c, i) => ({
			key: `${c}-${String(i)}`,
			cells: [
				c,
				...series.map((s) =>
					s.values[i] === null
						? 'No data'
						: formatValue(s.values[i] ?? 0)
				),
				totals[i] === null ? 'No data' : formatValue(totals[i] ?? 0),
			],
		})),
	};
	const legend = series.map((s, i) => ({
		label: s.label,
		color: seriesColor(i),
		kind: 'square' as const,
	}));
	const totalRuns = runs(totals);

	return (
		<ChartFrame
			label={label}
			legend={legend}
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
					<ValueAxis
						ticks={ticks}
						y={y}
						left={PAD.left}
						right={width - PAD.right}
						format={formatValue}
						base={0}
					/>
					{series.map((s, si) =>
						totalRuns.map((r) => (
							<path
								key={`${s.id}-fill-${String(r[0])}`}
								d={band(si, r)}
								fill={seriesColor(si)}
								opacity="0.8"
							/>
						))
					)}
					{series.map((s, si) =>
						totalRuns.map((r) => (
							<g key={`${s.id}-edge-${String(r[0])}`}>
								<path
									d={edge(si, r)}
									fill="none"
									stroke={PAPER}
									strokeWidth="2"
								/>
								<path
									d={edge(si, r)}
									fill="none"
									stroke={seriesColor(si)}
									strokeWidth="1.5"
								/>
							</g>
						))
					)}
					<AxisFrame
						left={PAD.left}
						top={PAD.top}
						right={width - PAD.right}
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
					{activeIndex !== null && (
						<line
							x1={px(x(activeIndex))}
							x2={px(x(activeIndex))}
							y1={px(PAD.top)}
							y2={px(base)}
							stroke={MUTED}
							strokeWidth="1"
						/>
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
