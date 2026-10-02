import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { stateText, type State } from '../../lib/state';
import { Sparkline } from '../Chart/Sparkline';

export interface StatProps extends ComponentPropsWithoutRef<'div'> {
	label: ReactNode;
	/** null shows a dash: there is no reading. */
	value: number | string | null;
	unit?: ReactNode;
	note?: ReactNode;
	/** Colours the value. */
	state?: State;
	/** Recent values, drawn as a sparkline under the reading. */
	trend?: (number | null)[];
}

/** One number with its label: a reading from an instrument. */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
	{ label, value, unit, note, state, trend, className, ...props },
	ref
) {
	const missing = value === null;
	return (
		<div
			ref={ref}
			className={cn(
				'flex min-w-0 flex-col gap-2 border border-hairline bg-paper p-3',
				className
			)}
			{...props}
		>
			<span className="font-data text-label uppercase tracking-widest text-ink-muted">
				{label}
			</span>
			<span className="flex items-baseline gap-1.5">
				<span
					className={cn(
						'font-display text-h2 leading-none tabular-nums',
						missing
							? 'text-ink-muted'
							: state
								? stateText[state]
								: 'text-ink'
					)}
				>
					{missing ? '–' : value}
				</span>
				{/* Tight line height, so the unit appearing doesn't make the reading taller */}
				{unit && !missing && (
					<span className="font-data text-small leading-none text-ink-muted">
						{unit}
					</span>
				)}
			</span>
			{note && (
				<span className="font-data text-label text-ink-muted">
					{note}
				</span>
			)}
			{/* An empty trend still reserves the sparkline's row, so it can arrive later without a jump */}
			{trend &&
				(trend.length > 1 ? (
					<Sparkline
						values={trend}
						label={
							typeof label === 'string'
								? `${label} trend`
								: 'Trend'
						}
					/>
				) : (
					<div aria-hidden="true" className="h-7" />
				))}
		</div>
	);
});
