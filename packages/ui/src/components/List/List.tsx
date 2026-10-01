import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type ListVariant = 'bullet' | 'number' | 'bare';

export interface ListProps extends ComponentPropsWithoutRef<'ul'> {
	/** 'number' renders an ordered list. */
	variant?: ListVariant;
}

const variantClasses: Record<ListVariant, string> = {
	bullet: 'list-[square] pl-5 marker:text-verdigris',
	number: 'list-decimal pl-6 marker:font-data marker:text-small marker:text-ink-muted',
	bare: 'list-none',
};

/** Bulleted, numbered or bare lists. */
export const List = forwardRef<HTMLUListElement, ListProps>(function List(
	{ variant = 'bullet', className, ...props },
	ref
) {
	const Tag = variant === 'number' ? 'ol' : 'ul';
	return (
		<Tag
			ref={ref as never}
			className={cn(
				'flex flex-col gap-1.5',
				variantClasses[variant],
				className
			)}
			{...props}
		/>
	);
});

export type ListItemProps = ComponentPropsWithoutRef<'li'>;

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
	function ListItem({ className, ...props }, ref) {
		return <li ref={ref} className={cn('pl-1', className)} {...props} />;
	}
);
