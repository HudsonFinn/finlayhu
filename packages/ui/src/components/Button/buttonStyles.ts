import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'ghost' | 'quiet';
export type ButtonSize = 'sm' | 'md';

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		'border-verdigris bg-verdigris text-on-verdigris data-hovered:border-ink data-hovered:bg-ink data-hovered:text-paper',
	ghost: 'border-ink bg-transparent text-ink data-hovered:bg-sheet data-pressed:bg-hairline',
	quiet: 'border-transparent bg-transparent text-ink underline-offset-4 data-hovered:text-verdigris data-hovered:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'px-3 py-2',
	md: 'px-4 py-3',
};

/** Classes for anything that looks like a button. Shared by Button and Link's button variant. */
export function buttonStyles({
	variant = 'primary',
	size = 'md',
}: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
	return cn(
		'inline-flex cursor-pointer items-center justify-center gap-2 border-[1.5px] font-display text-label uppercase leading-none tracking-wide transition-colors',
		'data-pressed:translate-y-px data-disabled:cursor-not-allowed data-disabled:opacity-45',
		variantClasses[variant],
		sizeClasses[size]
	);
}
