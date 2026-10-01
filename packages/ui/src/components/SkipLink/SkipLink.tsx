import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type SkipLinkProps = ComponentPropsWithoutRef<'a'>;

/** Lets keyboard users jump past the header. Hidden until focused. */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
	function SkipLink(
		{ href = '#main', className, children = 'Skip to content', ...props },
		ref
	) {
		return (
			<a
				ref={ref}
				href={href}
				className={cn(
					'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:font-data focus:text-label focus:uppercase focus:tracking-widest focus:text-paper',
					className
				)}
				{...props}
			>
				{children}
			</a>
		);
	}
);
