import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * tailwind-merge only knows Tailwind's default scales. Teach it Single Line's, or it treats
 * `text-ink` (a colour) and `text-h1` (a size) as the same kind of class and drops one.
 */
const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			color: [
				'paper',
				'sheet',
				'ink',
				'ink-muted',
				'hairline',
				'verdigris',
				'on-verdigris',
				'amber',
				'fault',
			],
			font: ['display', 'body', 'data'],
			text: [
				'label',
				'small',
				'ui',
				'body',
				'lead',
				'h4',
				'h3',
				'h2',
				'h1',
			],
		},
	},
});

/** Joins class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
