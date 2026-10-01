import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';
import { stateLabels, type State } from '../../lib/state';

export interface SymbolProps extends ComponentPropsWithoutRef<'svg'> {
	/** Accessible name. Omit when the symbol is decorative. */
	label?: string;
	/** Colours the symbol. Defaults to ink. */
	state?: State;
}

const stateStroke: Record<State, string> = {
	'in-service': 'var(--sl-verdigris)',
	isolated: 'var(--sl-amber)',
	fault: 'var(--sl-fault)',
	unknown: 'var(--sl-ink-muted)',
};

function a11y(label: string | undefined, state: State | undefined) {
	if (!label) return { 'aria-hidden': true } as const;
	return {
		role: 'img',
		'aria-label': state
			? `${label}, ${stateLabels[state].toLowerCase()}`
			: label,
	} as const;
}

const strokeFor = (state: State | undefined) =>
	state ? stateStroke[state] : 'var(--sl-ink)';

export interface BusbarProps extends SymbolProps {
	orientation?: 'horizontal' | 'vertical';
}

/** A busbar: the thick line equipment connects to. Stretches to fill its box. */
export const Busbar = forwardRef<SVGSVGElement, BusbarProps>(function Busbar(
	{ orientation = 'horizontal', label, state, className, ...props },
	ref
) {
	const horizontal = orientation === 'horizontal';
	return (
		<svg
			ref={ref}
			viewBox={horizontal ? '0 0 100 6' : '0 0 6 100'}
			preserveAspectRatio="none"
			className={cn(
				horizontal ? 'h-1.5 w-full' : 'h-full w-1.5',
				'block',
				className
			)}
			{...a11y(label, state)}
			{...props}
		>
			<line
				x1={horizontal ? 0 : 3}
				y1={horizontal ? 3 : 0}
				x2={horizontal ? 100 : 3}
				y2={horizontal ? 3 : 100}
				stroke={strokeFor(state)}
				strokeWidth="3"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
});

export interface BreakerProps extends SymbolProps {
	/** Closed (conducting) draws a filled square; open draws a hollow one. */
	closed: boolean;
}

/** A circuit breaker on a vertical line. */
export const Breaker = forwardRef<SVGSVGElement, BreakerProps>(function Breaker(
	{ closed, label, state, className, ...props },
	ref
) {
	const stroke = strokeFor(state);
	return (
		<svg
			ref={ref}
			viewBox="0 0 20 44"
			data-closed={closed}
			className={cn('block h-11 w-5 shrink-0', className)}
			{...a11y(
				label ? `${label}, ${closed ? 'closed' : 'open'}` : undefined,
				state
			)}
			{...props}
		>
			<line
				x1="10"
				y1="0"
				x2="10"
				y2="14"
				stroke={stroke}
				strokeWidth="2"
			/>
			<rect
				x="3"
				y="15"
				width="14"
				height="14"
				fill={closed ? stroke : 'var(--sl-paper)'}
				stroke={stroke}
				strokeWidth="2"
			/>
			<line
				x1="10"
				y1="30"
				x2="10"
				y2="44"
				stroke={stroke}
				strokeWidth="2"
				strokeDasharray={closed ? undefined : '3 3'}
			/>
		</svg>
	);
});

export interface TransformerProps extends SymbolProps {
	/** Drawn beside the windings, e.g. "33/11 kV". */
	ratio?: string;
}

/** A two-winding transformer on a vertical line. */
export const Transformer = forwardRef<SVGSVGElement, TransformerProps>(
	function Transformer({ ratio, label, state, className, ...props }, ref) {
		const stroke = strokeFor(state);
		return (
			<svg
				ref={ref}
				viewBox={ratio ? '0 0 96 76' : '0 0 40 76'}
				className={cn(
					'block h-[76px] shrink-0',
					ratio ? 'w-24' : 'w-10',
					className
				)}
				{...a11y(label, state)}
				{...props}
			>
				<line
					x1="20"
					y1="0"
					x2="20"
					y2="13"
					stroke={stroke}
					strokeWidth="2"
				/>
				<circle
					cx="20"
					cy="27"
					r="14"
					fill="none"
					stroke={stroke}
					strokeWidth="2"
				/>
				<circle
					cx="20"
					cy="49"
					r="14"
					fill="none"
					stroke={stroke}
					strokeWidth="2"
				/>
				<line
					x1="20"
					y1="63"
					x2="20"
					y2="76"
					stroke={stroke}
					strokeWidth="2"
				/>
				{ratio && (
					<text
						x="42"
						y="42"
						fill="var(--sl-ink-muted)"
						style={{ font: '10px var(--sl-font-data)' }}
					>
						{ratio}
					</text>
				)}
			</svg>
		);
	}
);
