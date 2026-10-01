import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type ProseProps = ComponentPropsWithoutRef<'div'>;

/**
 * Styles a block of rendered Markdown. It styles child elements directly (see prose.css),
 * so the Markdown renderer needs no component mapping.
 */
export const Prose = forwardRef<HTMLDivElement, ProseProps>(function Prose(
	{ className, ...props },
	ref
) {
	return <div ref={ref} className={cn('sl-prose', className)} {...props} />;
});
