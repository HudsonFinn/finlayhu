import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4';

export interface HeadingProps extends ComponentPropsWithoutRef<'h2'> {
	level: Level;
	/** Appearance, when it should differ from the level. Defaults from the level. */
	size?: HeadingSize;
}

const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

const sizeFromLevel: Record<Level, HeadingSize> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h4',
	6: 'h4',
};

const sizeClasses: Record<HeadingSize, string> = {
	// Michroma at 40px fits about 9 characters per word on a phone, so h1 steps down
	h1: 'font-display text-h2 uppercase tracking-wide sm:text-h1',
	h2: 'font-display text-h2 uppercase tracking-wide',
	h3: 'font-body text-h3 font-semibold',
	h4: 'font-body text-h4 font-semibold',
};

/** Titles for pages and sections. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
	function Heading({ level, size, className, ...props }, ref) {
		const Tag = tags[level - 1];
		return (
			<Tag
				ref={ref}
				className={cn(
					'text-balance text-ink',
					sizeClasses[size ?? sizeFromLevel[level]],
					className
				)}
				{...props}
			/>
		);
	}
);
