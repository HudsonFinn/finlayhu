import { forwardRef, type ReactNode } from 'react';
import {
	FieldError,
	Label,
	Text,
	TextArea as RACTextArea,
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
} from '../TextField/fieldStyles';

/** A stretch of the value to highlight, as character offsets. */
export interface TextAreaHighlight {
	start: number;
	end: number;
	/** Set on the highlight as data-highlight, so callers can scroll to it. */
	id?: string;
	/** Colours the highlight, e.g. 'bg-fault/20'. */
	className?: string;
}

export interface TextAreaProps extends Omit<RACTextFieldProps, 'children'> {
	/** Every field has a visible label. */
	label: ReactNode;
	description?: ReactNode;
	errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
	placeholder?: string;
	rows?: number;
	/** Classes for the text box itself, e.g. to make it fill its container. */
	textAreaClassName?: string;
	/**
	 * Ranges to highlight behind the text, like spelling marks. Needs a controlled `value`.
	 * With highlights the box grows to fit its text instead of scrolling, so the highlights
	 * stay lined up.
	 */
	highlights?: TextAreaHighlight[];
}

/** The value cut into plain text and highlights, in order. Overlapping highlights are skipped. */
function pieces(value: string, highlights: TextAreaHighlight[]) {
	const sorted = [...highlights].sort((a, b) => a.start - b.start);
	const out: ReactNode[] = [];
	let at = 0;
	for (const h of sorted) {
		if (h.start < at || h.end <= h.start) continue;
		out.push(value.slice(at, h.start));
		out.push(
			<mark
				key={`${String(h.start)}-${String(h.end)}`}
				data-highlight={h.id}
				className={cn('rounded-[1px] text-transparent', h.className)}
			>
				{value.slice(h.start, h.end)}
			</mark>
		);
		at = h.end;
	}
	out.push(value.slice(at));
	return out;
}

/** Several lines of text. */
export const TextArea = forwardRef<HTMLDivElement, TextAreaProps>(
	function TextArea(
		{
			label,
			description,
			errorMessage,
			placeholder,
			rows = 4,
			className,
			textAreaClassName,
			highlights,
			...props
		},
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
				{highlights ? (
					// A copy of the text sits behind a see-through box and sizes it. The copy's
					// text is invisible; only its highlights show through.
					<div className="relative">
						<div
							aria-hidden="true"
							className={controlClasses(
								cn(
									'whitespace-pre-wrap break-words border-transparent text-transparent',
									textAreaClassName
								)
							)}
						>
							{pieces(props.value ?? '', highlights)}
							{/* Keeps a trailing empty line as tall as it is in the box */}
							{'\n​'}
						</div>
						<RACTextArea
							placeholder={placeholder}
							className={controlClasses(
								cn(
									'absolute inset-0 size-full resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent',
									textAreaClassName
								)
							)}
						/>
					</div>
				) : (
					<RACTextArea
						rows={rows}
						placeholder={placeholder}
						className={controlClasses(
							cn('resize-y', textAreaClassName)
						)}
					/>
				)}
				<FieldError className={errorClasses}>{errorMessage}</FieldError>
			</RACTextField>
		);
	}
);
