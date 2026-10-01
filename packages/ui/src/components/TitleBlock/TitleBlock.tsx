import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

export interface TitleBlockField {
	label: string;
	value: ReactNode;
}

export interface TitleBlockProps extends ComponentPropsWithoutRef<'dl'> {
	fields: TitleBlockField[];
}

/**
 * Page or post metadata, set out like an engineering drawing's title block. The first field
 * (usually the title) gets a double-width column.
 */
export const TitleBlock = forwardRef<HTMLDListElement, TitleBlockProps>(
	function TitleBlock({ fields, className, ...props }, ref) {
		return (
			<dl
				ref={ref}
				className={cn(
					'grid grid-cols-2 border-[1.5px] border-ink font-data text-label sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none',
					className
				)}
				{...props}
			>
				{fields.map((field) => (
					<div
						key={field.label}
						className="flex min-w-0 flex-col gap-1 border-hairline px-3 py-2 first:col-span-2 max-sm:border-b max-sm:even:border-r sm:not-last:border-r"
					>
						<dt className="uppercase tracking-widest text-ink-muted">
							{field.label}
						</dt>
						<dd className="wrap-anywhere text-ink">
							{field.value}
						</dd>
					</div>
				))}
			</dl>
		);
	}
);
