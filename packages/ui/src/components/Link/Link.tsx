import { forwardRef } from 'react';
import {
	Link as RACLink,
	composeRenderProps,
	type LinkProps as RACLinkProps,
} from 'react-aria-components';
import { cn } from '../../lib/cn';
import {
	buttonStyles,
	type ButtonSize,
	type ButtonVariant,
} from '../Button/buttonStyles';

export type LinkVariant = 'inline' | 'standalone' | 'button';

export interface LinkProps extends RACLinkProps {
	variant?: LinkVariant;
	/** Appearance when variant is 'button'. */
	buttonVariant?: ButtonVariant;
	buttonSize?: ButtonSize;
	/** The arrow after external links. Turn off for block-shaped links that place their own. */
	externalIcon?: boolean;
}

const variantClasses: Record<Exclude<LinkVariant, 'button'>, string> = {
	inline: 'text-verdigris underline decoration-[1.5px] underline-offset-[3px] data-hovered:decoration-[3px]',
	standalone:
		'inline-flex items-center gap-1 font-data text-label uppercase tracking-widest text-ink data-hovered:text-verdigris',
};

const isExternal = (href: string | undefined) =>
	!!href && /^https?:\/\//.test(href);

/** Goes somewhere. Internal links navigate through the router passed to RouterProvider. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
	{
		variant = 'inline',
		buttonVariant,
		buttonSize,
		externalIcon = true,
		className,
		children,
		rel,
		...props
	},
	ref
) {
	const external = isExternal(props.href);
	return (
		<RACLink
			ref={ref}
			rel={rel ?? (external ? 'noopener' : undefined)}
			className={composeRenderProps(className, (className) =>
				cn(
					'cursor-pointer transition-colors',
					variant === 'button'
						? buttonStyles({
								variant: buttonVariant,
								size: buttonSize,
							})
						: variantClasses[variant],
					className
				)
			)}
			{...props}
		>
			{composeRenderProps(children, (children) => (
				<>
					{children}
					{external && externalIcon && (
						<span
							aria-hidden="true"
							className="ml-0.5 inline-block no-underline"
						>
							↗
						</span>
					)}
				</>
			))}
		</RACLink>
	);
});
