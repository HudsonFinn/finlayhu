import { forwardRef } from 'react';
import { ProgressBar, type ProgressBarProps } from 'react-aria-components';
import { cn } from '../../lib/cn';

export interface SpinnerProps
	extends Omit<ProgressBarProps, 'isIndeterminate' | 'children'> {
	/** Announced to screen readers. */
	label?: string;
	className?: string;
}

/** Shows that something is loading. A node travelling along a short busbar. */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
	function Spinner({ label = 'Loading', className, ...props }, ref) {
		return (
			<ProgressBar
				ref={ref}
				isIndeterminate
				aria-label={label}
				className={cn(
					'relative inline-block h-3 w-10 shrink-0',
					className
				)}
				{...props}
			>
				<span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-ink" />
				<span className="absolute top-0 left-0 size-3 animate-node-travel rounded-full border-[1.5px] border-verdigris bg-paper motion-reduce:animate-none" />
			</ProgressBar>
		);
	}
);
