import { cn } from '../../lib/cn';

/** Shared by TextField and TextArea: one field layout, label above and error below. */
export const fieldClasses = 'flex min-w-0 flex-col gap-2';
export const labelClasses = 'text-ui font-semibold text-ink';
export const descriptionClasses = '-mt-1 text-small text-ink-muted';
export const errorClasses = 'text-small text-fault';

/** The box itself, for an Input or a TextArea. */
export function controlClasses(className?: string) {
	return cn(
		'w-full border-[1.5px] border-ink bg-sheet px-3 py-2 font-body text-body text-ink outline-hidden transition-colors placeholder:text-ink-muted',
		'data-hovered:border-verdigris',
		'data-focus-visible:outline-solid data-focus-visible:outline-[1.5px] data-focus-visible:outline-offset-2 data-focus-visible:outline-verdigris',
		'data-invalid:border-fault data-disabled:cursor-not-allowed data-disabled:opacity-45',
		className
	);
}
