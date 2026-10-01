import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { NodeMark } from '../NodeMark';

export interface EmptyStateProps
	extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
	title: ReactNode;
	description?: ReactNode;
	/** A Button or Link that helps the reader move on. */
	action?: ReactNode;
}

/** What to show when there is nothing to show. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
	function EmptyState(
		{ title, description, action, className, ...props },
		ref
	) {
		return (
			<div
				ref={ref}
				className={cn(
					'flex flex-col items-start gap-3 border border-dashed border-hairline px-5 py-6',
					className
				)}
				{...props}
			>
				<NodeMark className="h-3 w-8 opacity-70" />
				<p className="text-ui font-semibold text-ink">{title}</p>
				{description && (
					<p className="max-w-[52ch] text-small text-ink-muted">
						{description}
					</p>
				)}
				{action}
			</div>
		);
	}
);
