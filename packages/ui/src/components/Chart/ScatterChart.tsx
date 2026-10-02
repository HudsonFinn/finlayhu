import { type PointerEvent } from 'react';
import { AxisFrame, ValueAxis } from './axes';
import { ChartFrame, PlotArea } from './ChartFrame';
import { ChartTooltip } from './ChartTooltip';
import {
	HAIRLINE,
	INK,
	LABEL_FONT,
	MUTED,
	SHAPES,
	seriesColor,
} from './colors';
import { Marker } from './Marker';
import { linear, niceTicks, px } from './scale';
import { defaultFormat } from './series';
import { useChartFocus } from './useChartFocus';
import { useChartWidth } from './useChartWidth';

export interface ScatterPoint {
	x: number;
	y: number;
	/** Names the point in the tooltip and table. */
	label?: string;
}

export interface ScatterSeries {
	id: string;
	label: string;
	points: ScatterPoint[];
}

export interface ScatterChartProps {
	label: string;
	/** Up to three series: any two can sit side by side, so more can't be told apart. */
	series: ScatterSeries[];
	xLabel: string;
	yLabel: string;
	height?: number;
	formatX?: (value: number) => string;
	formatY?: (value: number) => string;
	className?: string;
}

const PAD = { top: 14, right: 16, bottom: 44, left: 52 };
const HIT_RADIUS = 24;

/** Two measures plotted against each other. Each series has its own marker shape. */
export function ScatterChart({
	label,
	series,
	xLabel,
	yLabel,
	height = 260,
	formatX = defaultFormat,
	formatY = defaultFormat,
	className,
}: ScatterChartProps) {
	const [ref, width] = useChartWidth();
	// Keyboard order: every point, left to right
	const flat = series
		.slice(0, 3)
		.flatMap((s, si) => s.points.map((p) => ({ ...p, si })))
		.sort((a, b) => a.x - b.x);
	const { active, fromKeyboard, point, focusProps } = useChartFocus({
		count: flat.length,
	});

	const xs = flat.map((p) => p.x),
		ys = flat.map((p) => p.y);
	// Fit the data: a scatter plot has no baseline that must be zero
	const xTicks = niceTicks(Math.min(...xs), Math.max(...xs), 5);
	const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
	const base = height - PAD.bottom;
	const x = linear(
		xTicks[0] ?? 0,
		xTicks[xTicks.length - 1] ?? 1,
		PAD.left,
		width - PAD.right
	);
	const y = linear(
		yTicks[0] ?? 0,
		yTicks[yTicks.length - 1] ?? 1,
		base,
		PAD.top
	);

	const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const mx = e.clientX - rect.left,
			my = e.clientY - rect.top;
		let best = -1,
			bestD = HIT_RADIUS;
		flat.forEach((p, i) => {
			const d = Math.hypot(x(p.x) - mx, y(p.y) - my);
			if (d <= bestD) {
				bestD = d;
				best = i;
			}
		});
		point(best >= 0 ? best : null);
	};

	const a = active ? flat[active.index] : undefined;
	const title = a ? (a.label ?? series[a.si].label) : '';
	const rows = a
		? [
				{
					label: xLabel,
					value: formatX(a.x),
					color: seriesColor(a.si),
					kind: SHAPES[a.si],
				},
				{ label: yLabel, value: formatY(a.y) },
			]
		: [];
	const liveText =
		fromKeyboard && a
			? `${title}${series.length > 1 ? `, ${series[a.si]?.label ?? ''}` : ''}: ${xLabel} ${formatX(a.x)}, ${yLabel} ${formatY(a.y)}`
			: '';
	const table = {
		columns: ['Point', 'Series', xLabel, yLabel],
		rows: flat.map((p, i) => ({
			key: String(i),
			cells: [
				p.label ?? String(i + 1),
				series[p.si]?.label ?? '',
				formatX(p.x),
				formatY(p.y),
			],
		})),
	};
	const legend = series.slice(0, 3).map((s, i) => ({
		label: s.label,
		color: seriesColor(i),
		kind: SHAPES[i],
	}));

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
						ticks={yTicks}
						y={y}
						left={PAD.left}
						right={width - PAD.right}
						format={formatY}
						base={yTicks[0] ?? 0}
					/>
					{xTicks.map((t) => (
						<g key={t}>
							{t !== xTicks[0] && (
								<line
									x1={px(x(t))}
									x2={px(x(t))}
									y1={px(PAD.top)}
									y2={px(base)}
									stroke={HAIRLINE}
									strokeWidth="1"
								/>
							)}
							<line
								x1={px(x(t))}
								x2={px(x(t))}
								y1={px(base)}
								y2={px(base + 5)}
								stroke={INK}
								strokeWidth="1"
							/>
							<text
								x={px(x(t))}
								y={px(base + 17)}
								textAnchor="middle"
								fill={MUTED}
								style={LABEL_FONT}
							>
								{formatX(t)}
							</text>
						</g>
					))}
					<AxisFrame
						left={PAD.left}
						top={PAD.top}
						right={width - PAD.right}
						base={base}
					/>
					<text
						x={px(width - PAD.right)}
						y={px(height - 6)}
						textAnchor="end"
						fill={INK}
						style={LABEL_FONT}
					>
						{xLabel}
					</text>
					<text
						x={px(PAD.left)}
						y={px(PAD.top - 4)}
						fill={INK}
						style={LABEL_FONT}
					>
						{yLabel}
					</text>
					{flat.map((p, i) => (
						<Marker
							key={i}
							shape={SHAPES[p.si]}
							x={x(p.x)}
							y={y(p.y)}
							size={active?.index === i ? 11 : 8}
							fill={seriesColor(p.si)}
						/>
					))}
				</svg>
				{a && (
					<ChartTooltip
						x={x(a.x)}
						y={y(a.y) - 10}
						width={width}
						title={title}
						rows={rows}
					/>
				)}
			</PlotArea>
		</ChartFrame>
	);
}
