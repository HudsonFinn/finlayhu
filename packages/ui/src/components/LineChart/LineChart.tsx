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
	showArea?: boolean;
	formatValue?: (value: number) => string;
}

const WIDTH = 600;
const PAD = { top: 12, right: 12, bottom: 28, left: 36 };
const MAX_LABELS = 8;

/** A line over time, with gaps where data is missing. */
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
		const tableId = useId();
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
		const innerW = WIDTH - PAD.left - PAD.right;
		const innerH = height - PAD.top - PAD.bottom;
		const base = PAD.top + innerH;
		const x = (i: number) =>
			PAD.left +
			(data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
		const y = (v: number) => PAD.top + ((yMax - v) / span) * innerH;
		const ticks = [yMin, yMin + span / 2, yMax];
		const labelEvery = Math.ceil(data.length / MAX_LABELS);

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
					{ticks.map((t) => (
						<g key={t}>
							<line
								x1={PAD.left}
								x2={WIDTH - PAD.right}
								y1={y(t)}
								y2={y(t)}
								stroke="var(--sl-hairline)"
								strokeWidth="1"
							/>
							<text
								x={PAD.left - 8}
								y={y(t) + 3.5}
								textAnchor="end"
								fill="var(--sl-ink-muted)"
								style={{ font: '10px var(--sl-font-data)' }}
							>
								{formatValue(t)}
							</text>
						</g>
					))}
					{showArea &&
						runs
							.filter((r) => r.length > 1)
							.map((r) => (
								<path
									key={`area-${String(r[0])}`}
									d={`${path(r)} L${String(x(r[r.length - 1]))} ${String(base)} L${String(x(r[0]))} ${String(base)} Z`}
									fill="var(--sl-verdigris)"
									opacity="0.12"
								/>
							))}
					{runs.map((r) => (
						<path
							key={`line-${String(r[0])}`}
							d={path(r)}
							fill="none"
							stroke="var(--sl-verdigris)"
							strokeWidth="2.25"
							strokeLinejoin="round"
							strokeLinecap="round"
						/>
					))}
					{data.map((d, i) => (
						<g key={`${d.label}-${String(i)}`}>
							{d.value === null ? (
								<line
									x1={x(i)}
									x2={x(i)}
									y1={base - 7}
									y2={base}
									stroke="var(--sl-ink-muted)"
									strokeWidth="1.5"
								/>
							) : (
								<circle
									cx={x(i)}
									cy={y(d.value)}
									r={i === lastIndex ? 4.5 : 3.5}
									fill={
										i === lastIndex
											? 'var(--sl-verdigris)'
											: 'var(--sl-sheet)'
									}
									stroke="var(--sl-verdigris)"
									strokeWidth="2"
								/>
							)}
							{(i % labelEvery === 0 ||
								i === data.length - 1) && (
								<text
									x={x(i)}
									y={height - 8}
									textAnchor="middle"
									fill="var(--sl-ink-muted)"
									style={{ font: '10px var(--sl-font-data)' }}
								>
									{d.label}
								</text>
							)}
						</g>
					))}
				</svg>
				<figcaption className="sr-only">
					{label}. Values are in the table{' '}
					<span id={tableId}>below</span>.
				</figcaption>
				<table className="sr-only" aria-describedby={tableId}>
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
