import { forwardRef } from 'react';
import {
	Button as RACButton,
	composeRenderProps,
	type ButtonProps as RACButtonProps,
} from 'react-aria-components';
import { cn } from '../../lib/cn';
import {
	buttonStyles,
	type ButtonSize,
	type ButtonVariant,
} from './buttonStyles';

export interface ButtonProps extends RACButtonProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

/** Starts an action. To go to another page, use Link. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	function Button({ variant, size, className, ...props }, ref) {
		return (
			<RACButton
				ref={ref}
				className={composeRenderProps(className, (className) =>
					cn(buttonStyles({ variant, size }), className)
				)}
				{...props}
			/>
		);
	}
);
