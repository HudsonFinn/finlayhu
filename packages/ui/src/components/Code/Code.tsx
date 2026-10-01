import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type CodeProps = ComponentPropsWithoutRef<'code'>;

/** Inline code. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
	{ className, ...props },
	ref
) {
	return (
		<code
			ref={ref}
			className={cn(
				'border border-hairline bg-sheet px-1 py-px font-data text-[0.88em]',
				className
			)}
			{...props}
		/>
	);
});

export interface CodeBlockProps extends ComponentPropsWithoutRef<'pre'> {
	/** Shown as a label above the code. */
	language?: string;
}

/** A block of code or preformatted text. Scrolls sideways inside its own box. */
export const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
	function CodeBlock({ language, className, children, ...props }, ref) {
		return (
			<div className="border border-hairline bg-sheet">
				{language && (
					<div className="border-b border-hairline px-4 py-2 font-data text-label uppercase tracking-widest text-ink-muted">
						{language}
					</div>
				)}
				<pre
					ref={ref}
					className={cn(
						'overflow-x-auto px-4 py-3 font-data text-small leading-relaxed',
						className
					)}
					{...props}
				>
					<code>{children}</code>
				</pre>
			</div>
		);
	}
);
