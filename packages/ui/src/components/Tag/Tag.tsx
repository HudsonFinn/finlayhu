import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type TagProps = ComponentPropsWithoutRef<'span'>;

/** Labels a thing with a category or topic. For state, use Status. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
	{ className, ...props },
	ref
) {
	return (
		<span
			ref={ref}
			className={cn(
				'inline-flex items-center border border-hairline px-2 py-1 font-data text-label uppercase leading-none tracking-wider text-ink-muted',
				className
			)}
			{...props}
		/>
	);
});
