import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type TextVariant = 'body' | 'lead' | 'ui' | 'small' | 'label';

export interface TextProps extends ComponentPropsWithoutRef<'p'> {
	as?: 'p' | 'span' | 'div';
	variant?: TextVariant;
	/** Defaults to muted for lead and label, inherited otherwise. */
	tone?: 'default' | 'muted';
}

const variantClasses: Record<TextVariant, string> = {
	body: 'text-body',
	lead: 'text-lead',
	ui: 'text-ui',
	small: 'text-small',
	label: 'font-data text-label uppercase tracking-widest',
};

/** Body copy and its variants. */
export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(
	{ as: Tag = 'p', variant = 'body', tone, className, ...props },
	ref
) {
	const muted =
		(tone ??
			(variant === 'lead' || variant === 'label'
				? 'muted'
				: 'default')) === 'muted';
	return (
		<Tag
			ref={ref}
			className={cn(
				variantClasses[variant],
				muted && 'text-ink-muted',
				className
			)}
			{...props}
		/>
	);
});
