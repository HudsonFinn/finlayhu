import { PAPER } from './colors';
import { px } from './scale';

export type MarkerShape = 'square' | 'diamond' | 'triangle';

/**
 * A data marker with a 2px ring in the surface colour, so it stays legible where it crosses
 * a line or another marker.
 */
export function Marker({
	shape = 'square',
	x,
	y,
	size = 8,
	fill,
	stroke,
	ring = true,
}: {
	shape?: MarkerShape;
	x: number;
	y: number;
	size?: number;
	fill: string;
	stroke?: string;
	ring?: boolean;
}) {
	const h = size / 2;
	const d =
		shape === 'diamond'
			? `M${px(x)} ${px(y - h - 1)} L${px(x + h + 1)} ${px(y)} L${px(x)} ${px(y + h + 1)} L${px(x - h - 1)} ${px(y)} Z`
			: shape === 'triangle'
				? `M${px(x)} ${px(y - h - 1)} L${px(x + h + 1)} ${px(y + h)} L${px(x - h - 1)} ${px(y + h)} Z`
				: `M${px(x - h)} ${px(y - h)} h${px(size)} v${px(size)} h${px(-size)} Z`;
	return (
		<>
			{ring && (
				<path
					d={d}
					fill="none"
					stroke={PAPER}
					strokeWidth="4"
					strokeLinejoin="miter"
				/>
			)}
			<path
				d={d}
				fill={fill}
				stroke={stroke ?? fill}
				strokeWidth="1.5"
				strokeLinejoin="miter"
			/>
		</>
	);
}

/** The small key drawn beside a series name in legends and tooltips. */
export function SeriesKey({
	color,
	kind,
}: {
	color: string;
	kind: 'line' | MarkerShape;
}) {
	return (
		<svg
			viewBox="0 0 14 10"
			className="h-2.5 w-3.5 shrink-0"
			aria-hidden="true"
		>
			{kind === 'line' ? (
				<line
					x1="0"
					y1="5"
					x2="14"
					y2="5"
					stroke={color}
					strokeWidth="2"
				/>
			) : (
				<Marker
					shape={kind}
					x={7}
					y={5}
					size={7}
					fill={color}
					ring={false}
				/>
			)}
		</svg>
	);
}
