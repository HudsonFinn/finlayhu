import { useContext, type ReactNode, type SVGProps } from 'react';
import { FigureWidthContext, SheetScaleContext } from './context';

/**
 * An SVG drawing inside a Frame. Draw in viewBox units (720 wide fills Substack's column at
 * 1:1); the drawing scales to fit, and Labels stay at their true size.
 */
export function Sheet({
	width,
	height,
	label,
	children,
}: {
	width: number;
	height: number;
	/** The figure's alt text. */
	label: string;
	children: ReactNode;
}) {
	const frameWidth = useContext(FigureWidthContext);
	const scale = frameWidth > 0 ? frameWidth / width : 1;
	return (
		<svg
			viewBox={`0 0 ${String(width)} ${String(height)}`}
			className="block w-full"
			role="img"
			aria-label={label}
		>
			<SheetScaleContext.Provider value={scale}>
				{children}
			</SheetScaleContext.Provider>
		</svg>
	);
}

/** A mono label, 11px on screen whatever the drawing's scale. */
export function Label({
	x,
	y,
	anchor = 'start',
	opacity = 1,
	tone = 'muted',
	children,
}: {
	x: number;
	y: number;
	anchor?: 'start' | 'middle' | 'end';
	opacity?: number;
	tone?: 'muted' | 'ink';
	children: ReactNode;
}) {
	const scale = useContext(SheetScaleContext);
	return (
		<text
			x={x}
			y={y}
			textAnchor={anchor}
			opacity={opacity}
			fill={tone === 'ink' ? 'var(--sl-ink)' : 'var(--sl-ink-muted)'}
			style={{
				fontFamily: 'var(--sl-font-data)',
				fontSize: 11 / scale,
				letterSpacing: '0.08em',
			}}
		>
			{children}
		</text>
	);
}

/** Two networks meeting: the hollow verdigris node, as in the Boundary Node mark. */
export function Node({
	x,
	y,
	r = 10,
	...props
}: { x: number; y: number; r?: number } & SVGProps<SVGCircleElement>) {
	return (
		<circle
			cx={x}
			cy={y}
			r={r}
			fill="var(--sl-paper)"
			stroke="var(--sl-verdigris)"
			strokeWidth={3}
			{...props}
		/>
	);
}
