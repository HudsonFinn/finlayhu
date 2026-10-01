import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

export interface BlockquoteProps
	extends ComponentPropsWithoutRef<'blockquote'> {
	/** Who said it, shown below the quote. */
	attribution?: ReactNode;
}

/** A quotation, with optional attribution. */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
	function Blockquote({ attribution, className, ...props }, ref) {
		const quote = (
			<blockquote
				ref={ref}
				className={cn(
					'border-l-[3px] border-verdigris pl-4 text-lead text-balance',
					className
				)}
				{...props}
			/>
		);
		if (!attribution) return quote;
		return (
			<figure className="flex flex-col gap-3">
				{quote}
				<figcaption className="pl-[calc(1rem+3px)] font-data text-label uppercase tracking-widest text-ink-muted">
					{attribution}
				</figcaption>
			</figure>
		);
	}
);
