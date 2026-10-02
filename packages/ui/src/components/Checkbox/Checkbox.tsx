import { forwardRef, type ReactNode } from 'react';
import {
	CheckboxButton,
	CheckboxField,
	CheckboxGroup as RACCheckboxGroup,
	FieldError,
	Label,
	Text,
	composeRenderProps,
	type CheckboxFieldProps,
	type CheckboxGroupProps as RACCheckboxGroupProps,
} from 'react-aria-components';
import { cn } from '../../lib/cn';

export interface CheckboxProps extends Omit<CheckboxFieldProps, 'children'> {
	/** The label. Omit only for table row selection, where React Aria supplies one. */
	children?: ReactNode;
}

/** One yes/no choice. Built on React Aria's CheckboxField and CheckboxButton. */
export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(
	function Checkbox({ className, children, ...props }, ref) {
		return (
			<CheckboxField
				ref={ref}
				className={composeRenderProps(className, (className) =>
					cn('inline-flex', className)
				)}
				{...props}
			>
				<CheckboxButton className="group inline-flex cursor-pointer items-center gap-2.5 text-ui text-ink data-disabled:cursor-not-allowed data-disabled:opacity-45">
					{({ isSelected, isIndeterminate }) => (
						<>
							<span
								aria-hidden="true"
								className={cn(
									'flex size-4 shrink-0 items-center justify-center border-[1.5px] border-ink bg-sheet text-on-verdigris transition-colors',
									'group-data-focus-visible:outline-solid group-data-focus-visible:outline-[1.5px] group-data-focus-visible:outline-offset-2 group-data-focus-visible:outline-verdigris',
									'group-data-invalid:border-fault',
									(isSelected || isIndeterminate) &&
										'border-verdigris bg-verdigris'
								)}
							>
								{isIndeterminate ? (
									<svg
										viewBox="0 0 12 12"
										className="size-2.5"
									>
										<path
											d="M2 6h8"
											stroke="currentColor"
											strokeWidth="2"
											fill="none"
										/>
									</svg>
								) : isSelected ? (
									<svg
										viewBox="0 0 12 12"
										className="size-2.5"
									>
										<path
											d="M2 6.5 4.75 9 10 3"
											stroke="currentColor"
											strokeWidth="2"
											fill="none"
										/>
									</svg>
								) : null}
							</span>
							{children}
						</>
					)}
				</CheckboxButton>
			</CheckboxField>
		);
	}
);

export interface CheckboxGroupProps
	extends Omit<RACCheckboxGroupProps, 'children'> {
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode;
	children: ReactNode;
}

/** A group of independent choices with one label. */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
	function CheckboxGroup(
		{ label, description, errorMessage, className, children, ...props },
		ref
	) {
		return (
			<RACCheckboxGroup
				ref={ref}
				className={composeRenderProps(className, (className) =>
					cn('flex flex-col gap-3', className)
				)}
				{...props}
			>
				<Label className="text-ui font-semibold text-ink">
					{label}
				</Label>
				{description && (
					<Text
						slot="description"
						className="-mt-2 text-small text-ink-muted"
					>
						{description}
					</Text>
				)}
				<div className="flex flex-col gap-2">{children}</div>
				<FieldError className="text-small text-fault">
					{errorMessage}
				</FieldError>
			</RACCheckboxGroup>
		);
	}
);
