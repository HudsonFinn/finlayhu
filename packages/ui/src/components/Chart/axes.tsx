import { HAIRLINE, INK, LABEL_FONT, MUTED } from './colors';
import { px } from './scale';

/** Horizontal gridlines at each value tick, with tick marks and labels on the left axis. */
export function ValueAxis({
	ticks,
	y,
	left,
	right,
	format,
	base,
}: {
	ticks: number[];
	y: (v: number) => number;
	left: number;
	right: number;
	format: (v: number) => string;
	/** The baseline value; it gets the ink axis instead of a gridline. */
	base: number;
}) {
	return (
		<g>
			{ticks.map((t) => (
				<g key={t}>
					{t !== base && (
						<line
							x1={px(left)}
							x2={px(right)}
							y1={px(y(t))}
							y2={px(y(t))}
							stroke={HAIRLINE}
							strokeWidth="1"
						/>
					)}
					<line
						x1={px(left - 5)}
						x2={px(left)}
						y1={px(y(t))}
						y2={px(y(t))}
						stroke={INK}
						strokeWidth="1"
					/>
					<text
						x={px(left - 8)}
						y={px(y(t) + 3.5)}
						textAnchor="end"
						fill={MUTED}
						style={LABEL_FONT}
					>
						{format(t)}
					</text>
				</g>
			))}
		</g>
	);
}

/** Tick marks and labels along a category or time axis. */
export function CategoryAxis({
	labels,
	x,
	base,
	stride,
	height,
}: {
	labels: string[];
	x: (i: number) => number;
	base: number;
	stride: number;
	height: number;
}) {
	return (
		<g>
			{labels.map((label, i) => {
				const labelled = i % stride === 0 || i === labels.length - 1;
				// Dense axes only tick where they're labelled
				if (labels.length > 32 && !labelled) return null;
				return (
					<g key={`${label}-${String(i)}`}>
						<line
							x1={px(x(i))}
							x2={px(x(i))}
							y1={px(base)}
							y2={px(base + 5)}
							stroke={INK}
							strokeWidth="1"
						/>
						{labelled && (
							<text
								x={px(x(i))}
								y={px(height - 6)}
								textAnchor="middle"
								fill={MUTED}
								style={LABEL_FONT}
							>
								{label}
							</text>
						)}
					</g>
				);
			})}
		</g>
	);
}

/** The L-shaped ink frame: the value axis and the baseline. */
export function AxisFrame({
	left,
	top,
	right,
	base,
}: {
	left: number;
	top: number;
	right: number;
	base: number;
}) {
	return (
		<polyline
			points={`${px(left)},${px(top)} ${px(left)},${px(base)} ${px(right)},${px(base)}`}
			fill="none"
			stroke={INK}
			strokeWidth="1"
		/>
	);
}
