import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface LineChartPoint {
	label: string;
	/** null leaves a gap: no reading for this point. */
	value: number | null;
}

export interface LineChartProps
	extends Omit<ComponentPropsWithoutRef<'figure'>, 'children'> {
	data: LineChartPoint[];
	/** Accessible name, e.g. "Readiness, last 8 days". */
	label: string;
	/** Defaults to the data's range, rounded out to tens. */
	yDomain?: [number, number];
	height?: number;
	/** Hatches the area under the line, as on an engineering drawing. */
	showArea?: boolean;
	formatValue?: (value: number) => string;
}

const WIDTH = 600;
const PAD = { top: 12, right: 16, bottom: 30, left: 40 };
const MAX_LABELS = 8;
/** Keeps the first and last points off the axes. */
const INSET = 14;

const INK = 'var(--sl-ink)';
const MUTED = 'var(--sl-ink-muted)';
const SIGNAL = 'var(--sl-verdigris)';
const LABEL_FONT = { font: '10px var(--sl-font-data)' };

/**
 * A line over time, drawn like an instrument trace: ink axes with ticks, a thin signal line,
 * square points, and a cross on the axis where a reading is missing.
 */
export const LineChart = forwardRef<HTMLElement, LineChartProps>(
	function LineChart(
		{
			data,
			label,
			yDomain,
			height = 180,
			showArea = false,
			formatValue = String,
			className,
			...props
		},
		ref
	) {
		const id = useId();
		const values = data
			.map((d) => d.value)
			.filter((v): v is number => v !== null);

		if (values.length === 0) {
			return (
				<figure
					ref={ref}
					className={cn('flex flex-col', className)}
					{...props}
				>
					<div
						className="flex items-center justify-center border border-dashed border-hairline font-data text-label uppercase tracking-widest text-ink-muted"
						style={{ height }}
					>
						No data
					</div>
					<figcaption className="sr-only">
						{label}: no data
					</figcaption>
				</figure>
			);
		}

		const [yMin, yMax] = yDomain ?? [
			Math.floor(Math.min(...values) / 10) * 10,
			Math.ceil(Math.max(...values) / 10) * 10 || 10,
		];
		const span = yMax - yMin || 1;
		const innerW = WIDTH - PAD.left - PAD.right - INSET * 2;
		const innerH = height - PAD.top - PAD.bottom;
		const base = PAD.top + innerH;
		const x = (i: number) =>
			PAD.left +
			INSET +
			(data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
		const y = (v: number) => PAD.top + ((yMax - v) / span) * innerH;
		const ticks = [yMin, yMin + span / 2, yMax];
		const labelEvery = Math.ceil(data.length / MAX_LABELS);
		const hatchId = `${id}-hatch`;

		// Split into runs of consecutive readings, so the line breaks at gaps
		const runs: number[][] = [];
		let run: number[] = [];
		data.forEach((d, i) => {
			if (d.value === null) {
				if (run.length) runs.push(run);
				run = [];
			} else run.push(i);
		});
		if (run.length) runs.push(run);

		const lastIndex = data.reduce(
			(last, d, i) => (d.value === null ? last : i),
			-1
		);
		const path = (r: number[]) =>
			r
				.map(
					(i, k) =>
						`${k ? 'L' : 'M'}${String(x(i))} ${String(y(data[i].value ?? 0))}`
				)
				.join(' ');

		return (
			<figure
				ref={ref}
				className={cn('flex min-w-0 flex-col', className)}
				{...props}
			>
				<svg
					viewBox={`0 0 ${String(WIDTH)} ${String(height)}`}
					className="block h-auto w-full overflow-visible"
					aria-hidden="true"
				>
					<defs>
						<pattern
							id={hatchId}
							width="6"
							height="6"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(45)"
						>
							<line
								x1="0"
								y1="0"
								x2="0"
								y2="6"
								stroke={SIGNAL}
								strokeWidth="1"
								opacity="0.45"
							/>
						</pattern>
					</defs>

					{/* Value axis: ticks, labels and dashed grid lines */}
					{ticks.map((t) => (
						<g key={t}>
							{t !== yMin && (
								<line
									x1={PAD.left}
									x2={WIDTH - PAD.right}
									y1={y(t)}
									y2={y(t)}
									stroke="var(--sl-hairline)"
									strokeWidth="1"
									strokeDasharray="2 4"
								/>
							)}
							<line
								x1={PAD.left - 5}
								x2={PAD.left}
								y1={y(t)}
								y2={y(t)}
								stroke={INK}
								strokeWidth="1.5"
							/>
							<text
								x={PAD.left - 9}
								y={y(t) + 3.5}
								textAnchor="end"
								fill={MUTED}
								style={LABEL_FONT}
							>
								{formatValue(t)}
							</text>
						</g>
					))}

					<polyline
						points={`${String(PAD.left)},${String(PAD.top)} ${String(PAD.left)},${String(base)} ${String(WIDTH - PAD.right)},${String(base)}`}
						fill="none"
						stroke={INK}
						strokeWidth="1.5"
					/>

					{showArea &&
						runs
							.filter((r) => r.length > 1)
							.map((r) => (
								<path
									key={`area-${String(r[0])}`}
									d={`${path(r)} L${String(x(r[r.length - 1]))} ${String(base)} L${String(x(r[0]))} ${String(base)} Z`}
									fill={`url(#${hatchId})`}
								/>
							))}

					{runs.map((r) => (
						<path
							key={`line-${String(r[0])}`}
							d={path(r)}
							fill="none"
							stroke={SIGNAL}
							strokeWidth="1.5"
							strokeLinejoin="miter"
						/>
					))}

					{data.map((d, i) => {
						const isLast = i === lastIndex;
						const size = isLast ? 9 : 7;
						return (
							<g key={`${d.label}-${String(i)}`}>
								<line
									x1={x(i)}
									x2={x(i)}
									y1={base}
									y2={base + 5}
									stroke={INK}
									strokeWidth="1.5"
								/>
								{d.value === null ? (
									// No reading: a small cross on the axis
									<path
										d={`M${String(x(i) - 3.5)} ${String(base - 10)} l7 7 M${String(x(i) + 3.5)} ${String(base - 10)} l-7 7`}
										stroke={MUTED}
										strokeWidth="1.5"
									/>
								) : (
									<rect
										x={x(i) - size / 2}
										y={y(d.value) - size / 2}
										width={size}
										height={size}
										fill={
											isLast ? SIGNAL : 'var(--sl-paper)'
										}
										stroke={SIGNAL}
										strokeWidth="1.5"
									/>
								)}
								{(i % labelEvery === 0 ||
									i === data.length - 1) && (
									<text
										x={x(i)}
										y={height - 6}
										textAnchor="middle"
										fill={MUTED}
										style={LABEL_FONT}
									>
										{d.label}
									</text>
								)}
							</g>
						);
					})}
				</svg>
				<figcaption className="sr-only">
					{label}. Values are in the table{' '}
					<span id={`${id}-table`}>below</span>.
				</figcaption>
				<table className="sr-only" aria-describedby={`${id}-table`}>
					<caption>{label}</caption>
					<tbody>
						{data.map((d, i) => (
							<tr key={`${d.label}-row-${String(i)}`}>
								<th scope="row">{d.label}</th>
								<td>
									{d.value === null
										? 'No data'
										: formatValue(d.value)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</figure>
		);
	}
);
