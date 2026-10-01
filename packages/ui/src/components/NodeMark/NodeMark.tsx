import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface NodeMarkProps extends ComponentPropsWithoutRef<'svg'> {
	/** Accessible name. Omit when the mark is decorative. */
	label?: string;
}

/** The Boundary Node mark: two lines meeting at a hollow node. */
export const NodeMark = forwardRef<SVGSVGElement, NodeMarkProps>(
	function NodeMark({ label, className, ...props }, ref) {
		return (
			<svg
				ref={ref}
				viewBox="0 0 48 20"
				className={cn('h-5 w-12 shrink-0', className)}
				{...(label
					? { role: 'img', 'aria-label': label }
					: { 'aria-hidden': true })}
				{...props}
			>
				<path
					d="M2 10H17M31 10H46"
					stroke="var(--sl-ink)"
					strokeWidth="3"
					fill="none"
				/>
				<circle
					cx="24"
					cy="10"
					r="6"
					fill="var(--sl-paper)"
					stroke="var(--sl-verdigris)"
					strokeWidth="3"
				/>
			</svg>
		);
	}
);
