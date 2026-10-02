import {
	forwardRef,
	useId,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { stateText, type State } from '../../lib/state';

export interface MeterProps
	extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
	label: ReactNode;
	value: number;
	min?: number;
	max?: number;
	/** Shown after the value, e.g. "MVA". */
	unit?: string;
	/** Colours the fill. Defaults to in service. */
	state?: State;
	formatValue?: (value: number) => string;
}

/** A single value against a limit: loading against a rating, progress against a target. */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
	{
		label,
		value,
		min = 0,
		max = 100,
		unit,
		state = 'in-service',
		formatValue = String,
		className,
		...props
	},
	ref
) {
	const labelId = useId();
	const pct = Math.min(
		100,
		Math.max(0, ((value - min) / (max - min || 1)) * 100)
	);
	const text = `${formatValue(value)}${unit ? ` ${unit}` : ''} of ${formatValue(max)}${unit ? ` ${unit}` : ''}`;
	return (
		<div
			ref={ref}
			role="meter"
			aria-labelledby={labelId}
			aria-valuenow={value}
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuetext={text}
			className={cn('flex min-w-0 flex-col gap-2', className)}
			{...props}
		>
			<div className="flex items-baseline justify-between gap-4">
				<span
					id={labelId}
					className="font-data text-label uppercase tracking-widest text-ink-muted"
				>
					{label}
				</span>
				<span className="font-data text-small text-ink">
					{formatValue(value)}
					<span className="text-ink-muted">
						{' '}
						/ {formatValue(max)}
						{unit ? ` ${unit}` : ''}
					</span>
				</span>
			</div>
			<div
				className={cn('relative h-2', stateText[state])}
				aria-hidden="true"
			>
				{/* Track: a lighter step of the fill's own colour */}
				<div className="absolute inset-0 bg-current opacity-20" />
				<div
					className="absolute inset-y-0 left-0 bg-current"
					style={{ width: `${String(pct)}%` }}
				/>
				{[25, 50, 75].map((t) => (
					<span
						key={t}
						className="absolute -bottom-1.5 h-1 w-px bg-ink-muted"
						style={{ left: `${String(t)}%` }}
					/>
				))}
			</div>
		</div>
	);
});
