import {
	ToggleButton,
	ToggleButtonGroup,
	composeRenderProps,
	type ToggleButtonGroupProps,
	type ToggleButtonProps,
} from 'react-aria-components';
import { cn } from '../../lib/cn';

export type ChipGroupProps = ToggleButtonGroupProps;

/**
 * A row of toggleable chips, for filtering a list. Multiple selection by default; an empty
 * selection usually means "show everything".
 */
export function ChipGroup({
	className,
	selectionMode = 'multiple',
	...props
}: ChipGroupProps) {
	return (
		<ToggleButtonGroup
			selectionMode={selectionMode}
			className={composeRenderProps(className, (className) =>
				cn('flex flex-wrap gap-2', className)
			)}
			{...props}
		/>
	);
}

export type ChipProps = ToggleButtonProps;

/** One filter option. Looks like a Tag; fills with verdigris when selected. */
export function Chip({ className, ...props }: ChipProps) {
	return (
		<ToggleButton
			className={composeRenderProps(className, (className) =>
				cn(
					'cursor-pointer border border-hairline px-2 py-1 font-data text-label uppercase leading-none tracking-wider text-ink-muted outline-none transition-colors',
					'data-focus-visible:outline-[1.5px] data-focus-visible:outline-offset-2 data-focus-visible:outline-verdigris',
					'data-hovered:border-ink data-hovered:text-ink',
					'data-selected:border-verdigris data-selected:bg-verdigris data-selected:text-on-verdigris',
					className
				)
			)}
			{...props}
		/>
	);
}
