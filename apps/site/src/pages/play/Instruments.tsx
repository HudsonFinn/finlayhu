import { cn } from '@fhudson/ui';

/** The dial and trace both read 48.5 to 51.5 Hz: past the 48.8 Hz trip, with room above. */
const LOW = 48.5;
const HIGH = 51.5;

const BANDS = [
	{ from: 48.5, to: 49.5, className: 'stroke-fault' },
	{ from: 49.5, to: 49.8, className: 'stroke-amber' },
	{ from: 49.8, to: 50.2, className: 'stroke-verdigris' },
	{ from: 50.2, to: 50.5, className: 'stroke-amber' },
	{ from: 50.5, to: 51.5, className: 'stroke-fault' },
];

const CX = 110;
const CY = 112;
const R = 92;

/** A point on the dial's arc: LOW at the left, HIGH at the right, over the top. */
function point(hz: number, r = R) {
	const share = (Math.min(HIGH, Math.max(LOW, hz)) - LOW) / (HIGH - LOW);
	const angle = Math.PI * (1 - share);
	return { x: CX + r * Math.cos(angle), y: CY - r * Math.sin(angle) };
}

function arc(from: number, to: number) {
	const a = point(from);
	const b = point(to);
	return `M${String(a.x)} ${String(a.y)}A${String(R)} ${String(R)} 0 0 1 ${String(b.x)} ${String(b.y)}`;
}

/** An analogue frequency meter, like the one on a control room wall. */
export function FrequencyDial({ hz }: { hz: number }) {
	const tip = point(hz, R - 14);
	const ticks = Array.from({ length: 13 }, (_, i) => LOW + i * 0.25);
	return (
		<svg viewBox="0 0 220 128" className="w-full" aria-hidden="true">
			{BANDS.map((band) => (
				<path
					key={band.from}
					d={arc(band.from, band.to)}
					className={cn(band.className, 'fill-none')}
					strokeWidth={8}
				/>
			))}
			{ticks.map((t) => {
				const major = Number.isInteger(t * 2);
				const a = point(t, R - 7);
				const b = point(t, R - (major ? 16 : 11));
				return (
					<line
						key={t}
						x1={a.x}
						y1={a.y}
						x2={b.x}
						y2={b.y}
						className="stroke-ink-muted"
						strokeWidth={major ? 1.5 : 1}
					/>
				);
			})}
			{[49, 50, 51].map((t) => {
				const p = point(t, R - 28);
				return (
					<text
						key={t}
						x={p.x}
						y={p.y + 4}
						textAnchor="middle"
						className="fill-ink-muted font-data text-[10px]"
					>
						{t}
					</text>
				);
			})}
			<line
				x1={CX}
				y1={CY}
				x2={tip.x}
				y2={tip.y}
				className="stroke-ink"
				strokeWidth={2.5}
				strokeLinecap="round"
			/>
			<circle cx={CX} cy={CY} r={5} className="fill-ink" />
		</svg>
	);
}

/** Frequency over the last minute, with the normal band shaded. */
export function FrequencyTrace({
	values,
	points,
}: {
	values: number[];
	/** How many values fill the width. */
	points: number;
}) {
	const y = (hz: number) =>
		((HIGH - Math.min(HIGH, Math.max(LOW, hz))) / (HIGH - LOW)) * 100;
	const line = values
		.map((v, i) => `${String((i / (points - 1)) * 300)},${String(y(v))}`)
		.join(' ');
	return (
		<svg
			viewBox="0 0 300 100"
			preserveAspectRatio="none"
			className="h-20 w-full border border-hairline bg-paper"
			aria-hidden="true"
		>
			<rect
				x={0}
				y={y(50.2)}
				width={300}
				height={y(49.8) - y(50.2)}
				className="fill-verdigris/15"
			/>
			<line
				x1={0}
				x2={300}
				y1={y(50)}
				y2={y(50)}
				className="stroke-ink-muted"
				strokeDasharray="3 3"
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={0}
				x2={300}
				y1={y(48.8)}
				y2={y(48.8)}
				className="stroke-fault"
				strokeDasharray="2 4"
				vectorEffect="non-scaling-stroke"
			/>
			<polyline
				points={line}
				className="fill-none stroke-ink"
				strokeWidth={1.5}
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}
