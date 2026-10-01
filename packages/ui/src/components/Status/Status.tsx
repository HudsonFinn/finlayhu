import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';
import { stateFill, stateLabels, stateText, type State } from '../../lib/state';

export interface StatusProps extends ComponentPropsWithoutRef<'span'> {
	state: State;
	/** Announce changes to screen readers. Use when the state updates while the page is open. */
	live?: boolean;
}

/** The state of a thing: an API, a feed, a sync. A lamp plus a label. For categories, use Tag. */
export const Status = forwardRef<HTMLSpanElement, StatusProps>(function Status(
	{ state, live = false, className, children, ...props },
	ref
) {
	return (
		<span
			ref={ref}
			role={live ? 'status' : undefined}
			data-state={state}
			className={cn(
				'inline-flex items-center gap-2 rounded-full border border-current px-2.5 py-1 font-data text-label uppercase leading-none tracking-wider',
				stateText[state],
				className
			)}
			{...props}
		>
			<span
				aria-hidden="true"
				className={cn(
					'size-2 shrink-0 rounded-full',
					stateFill[state],
					state === 'fault' &&
						'animate-pulse motion-reduce:animate-none'
				)}
			/>
			{children ?? stateLabels[state]}
		</span>
	);
});
