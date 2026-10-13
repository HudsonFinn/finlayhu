import { forwardRef, type ReactNode } from 'react';
import {
	FieldError,
	Input,
	Label,
	Text,
	TextField as RACTextField,
	composeRenderProps,
	type TextFieldProps as RACTextFieldProps,
	type ValidationResult,
} from 'react-aria-components';
import { cn } from '../../lib/cn';
import {
	controlClasses,
	descriptionClasses,
	errorClasses,
	fieldClasses,
	labelClasses,
} from './fieldStyles';

export interface TextFieldProps extends Omit<RACTextFieldProps, 'children'> {
	/** Every field has a visible label. */
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
	placeholder?: string;
}

/** A single line of text. */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
	function TextField(
		{ label, description, errorMessage, placeholder, className, ...props },
		ref
	) {
		return (
			<RACTextField
				ref={ref}
				className={composeRenderProps(className, (className) =>
					cn(fieldClasses, className)
				)}
				{...props}
			>
				<Label className={labelClasses}>{label}</Label>
				{description && (
					<Text slot="description" className={descriptionClasses}>
						{description}
					</Text>
				)}
				<Input placeholder={placeholder} className={controlClasses()} />
				<FieldError className={errorClasses}>{errorMessage}</FieldError>
			</RACTextField>
		);
	}
);
