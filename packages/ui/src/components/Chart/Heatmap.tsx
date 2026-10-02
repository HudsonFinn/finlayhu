import { type PointerEvent } from 'react';
import { ChartFrame, PlotArea } from './ChartFrame';
import { ChartTooltip } from './ChartTooltip';
import { INK, LABEL_FONT, MUTED, SEQUENTIAL } from './colors';
import { finite, labelStride, px } from './scale';
import { defaultFormat } from './series';
import { useChartFocus } from './useChartFocus';
import { useChartWidth } from './useChartWidth';

export interface HeatmapProps {
	label: string;
	rows: string[];
	columns: string[];
	/** Header for the row labels in the data table. */
	rowLabel?: string;
	/** values[row][column]. null is a missing reading. */
	values: (number | null)[][];
	/** Defaults to the data's range. */
	domain?: [number, number];
	cellHeight?: number;
	formatValue?: (value: number) => string;
	className?: string;
}

const GAP = 2;

/** A grid of values shaded by magnitude: one hue, light to dark. Each cell is a hover target. */
export function Heatmap({
	label,
	rows,
	columns,
	values,
	rowLabel = 'Row',
	domain,
	cellHeight = 18,
	formatValue = defaultFormat,
	className,
}: HeatmapProps) {
	const [ref, width] = useChartWidth<HTMLDivElement>();
	const { active, fromKeyboard, point, focusProps } = useChartFocus({
		count: columns.length,
		rows: rows.length,
	});
	const all = finite(values.flat());
	// Span the data's own range, so the shades use the whole ramp
	const [d0, d1] = domain ?? [Math.min(...all), Math.max(...all)];
	const step = (v: number) => {
		const t = (v - d0) / (d1 - d0 || 1);
		return (
			SEQUENTIAL[
				Math.min(
					SEQUENTIAL.length - 1,
					Math.max(0, Math.floor(t * SEQUENTIAL.length))
				)
			] ?? SEQUENTIAL[0]
		);
	};

	const longest = Math.max(...rows.map((r) => r.length), 1);
	const pad = {
		top: 4,
		right: 4,
		bottom: 24,
		left: Math.min(140, Math.max(40, longest * 6.4 + 12)),
	};
	const cellW = Math.max(
		3,
		(width - pad.left - pad.right) / Math.max(1, columns.length)
	);
	const height = pad.top + rows.length * cellHeight + pad.bottom;
	const cx = (c: number) => pad.left + c * cellW;
	const cy = (r: number) => pad.top + r * cellHeight;

	const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const c = Math.floor((e.clientX - rect.left - pad.left) / cellW);
		const r = Math.floor((e.clientY - rect.top - pad.top) / cellHeight);
		point(
			c >= 0 && c < columns.length && r >= 0 && r < rows.length
				? c
				: null,
			r
		);
	};

	const a = active;
	const activeValue = a ? values[a.row]?.[a.index] : undefined;
	const title = a ? `${rows[a.row] ?? ''} · ${columns[a.index] ?? ''}` : '';
	const valueText =
		activeValue === null || activeValue === undefined
			? 'No data'
			: formatValue(activeValue);
	const liveText = fromKeyboard && a ? `${title}: ${valueText}` : '';
	const table = {
		columns: [rowLabel, ...columns],
		rows: rows.map((r, ri) => ({
			key: `${r}-${String(ri)}`,
			cells: [
				r,
				...columns.map((_, ci) => {
					const v = values[ri]?.[ci];
					return v === null ? 'No data' : formatValue(v);
				}),
			],
		})),
	};
	const stride = labelStride(
		columns.length,
		Math.max(2, Math.floor((width - pad.left) / 56))
	);

	return (
		<ChartFrame
			label={label}
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
					{rows.map((r, ri) => (
						<g key={`${r}-${String(ri)}`}>
							<text
								x={px(pad.left - 8)}
								y={px(cy(ri) + cellHeight / 2 + 3.5)}
								textAnchor="end"
								fill={INK}
								style={LABEL_FONT}
							>
								{r}
							</text>
							{columns.map((_, ci) => {
								const v = values[ri]?.[ci];
								const x = cx(ci),
									y = cy(ri);
								return v === null ? (
									<line
										key={ci}
										x1={px(x + cellW / 2 - 2)}
										x2={px(x + cellW / 2 + 2)}
										y1={px(y + cellHeight / 2)}
										y2={px(y + cellHeight / 2)}
										stroke={MUTED}
										strokeWidth="1"
									/>
								) : (
									<rect
										key={ci}
										x={px(x)}
										y={px(y)}
										width={px(Math.max(1, cellW - GAP))}
										height={px(cellHeight - GAP)}
										fill={step(v)}
									/>
								);
							})}
						</g>
					))}
					{columns.map((c, ci) =>
						ci % stride === 0 ? (
							<text
								key={`${c}-${String(ci)}`}
								x={px(cx(ci))}
								y={px(height - 8)}
								fill={MUTED}
								style={LABEL_FONT}
							>
								{c}
							</text>
						) : null
					)}
					{a && (
						<rect
							x={px(cx(a.index) - 1)}
							y={px(cy(a.row) - 1)}
							width={px(cellW - GAP + 2)}
							height={px(cellHeight - GAP + 2)}
							fill="none"
							stroke={INK}
							strokeWidth="1.5"
						/>
					)}
				</svg>
				{a && (
					<ChartTooltip
						x={cx(a.index) + cellW / 2}
						y={cy(a.row) + cellHeight}
						width={width}
						title={title}
						rows={[{ label: 'Value', value: valueText }]}
					/>
				)}
			</PlotArea>
			{/* Scale legend */}
			<div
				className="flex items-center gap-2 font-data text-label text-ink-muted"
				aria-hidden="true"
			>
				<span className="tabular-nums">{formatValue(d0)}</span>
				<span className="flex">
					{SEQUENTIAL.map((color) => (
						<span
							key={color}
							className="h-2.5 w-6"
							style={{ background: color }}
						/>
					))}
				</span>
				<span className="tabular-nums">{formatValue(d1)}</span>
			</div>
		</ChartFrame>
	);
}
