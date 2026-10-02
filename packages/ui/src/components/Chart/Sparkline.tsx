import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';
import { MUTED } from './colors';
import { Marker } from './Marker';
import { finite, px, runs } from './scale';
import { defaultFormat } from './series';
import { useChartWidth } from './useChartWidth';

export interface SparklineProps
	extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
	values: (number | null)[];
	/** Accessible name; the first, last, lowest and highest values are added to it. */
	label: string;
	height?: number;
	formatValue?: (value: number) => string;
}

/**
 * A small trend with no axes, for Stat and tables. The line is muted and the latest value is
 * marked in verdigris. Not interactive: the numbers live in its accessible name.
 */
export function Sparkline({
	values,
	label,
	height = 28,
	formatValue = defaultFormat,
	className,
	...props
}: SparklineProps) {
	const [ref, width] = useChartWidth(120);
	const nums = finite(values);
	const lo = Math.min(...nums),
		hi = Math.max(...nums);
	const pad = 5;
	const x = (i: number) =>
		pad +
		(values.length <= 1
			? 0
			: (i * (width - pad * 2)) / (values.length - 1));
	const y = (v: number) =>
		pad + (1 - (v - lo) / (hi - lo || 1)) * (height - pad * 2);
	const last = values.reduce<number>(
		(acc, v, i) => (v === null ? acc : i),
		-1
	);
	const first = values.findIndex((v) => v !== null);
	const summary = nums.length
		? `${label}: from ${formatValue(values[first] ?? 0)} to ${formatValue(values[last] ?? 0)}, low ${formatValue(lo)}, high ${formatValue(hi)}`
		: `${label}: no data`;

	return (
		<div
			ref={ref}
			role="img"
			aria-label={summary}
			className={cn('w-full min-w-0', className)}
			{...props}
		>
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${String(width)} ${String(height)}`}
				className="block max-w-full"
				aria-hidden="true"
			>
				{runs(values).map((r) => (
					<path
						key={r[0]}
						d={r
							.map(
								(i, k) =>
									`${k ? 'L' : 'M'}${px(x(i))} ${px(y(values[i] ?? 0))}`
							)
							.join(' ')}
						fill="none"
						stroke={MUTED}
						strokeWidth="1.5"
					/>
				))}
				{last >= 0 && (
					<Marker
						x={x(last)}
						y={y(values[last] ?? 0)}
						size={6}
						fill="var(--sl-verdigris)"
					/>
				)}
			</svg>
		</div>
	);
}
