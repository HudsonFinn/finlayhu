import { Frame } from '../../kit/Frame';
import { Label, Node, Sheet } from '../../kit/Sheet';
import { flowOffset, loopSpeed } from '../../kit/time';
import { useClock } from '../../kit/useClock';
import { HOUR_MS, MERGES, TSOS, WINDOW, meta } from './meta';

const DASH = '6 10';
const PERIOD = 16;
const SPEED = loopSpeed(40, meta.loop ?? 9600, PERIOD);

/** 0 → 1 → 0 across [from, to] hours, with quarter-hour ramps so lines wake and settle. */
const windowOf = (hour: number, from: number, to: number) =>
	Math.max(0, Math.min(1, (hour - from) / 0.25, (to - hour) / 0.25));

const activity = (hour: number, offset: 0 | 1) =>
	Math.max(
		...MERGES.map((m) =>
			offset === 0
				? windowOf(hour, m - WINDOW, m)
				: windowOf(hour, m, m + WINDOW)
		)
	);

const clockText = (hour: number) => {
	const h = Math.floor(hour) % 24;
	const m = Math.floor(((hour % 1) * 60) / 15) * 15;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} CET`;
};

/** A line that carries data while `active`: hairline at rest, verdigris dashes when busy. */
function Wire({ d, active, t }: { d: string; active: number; t: number }) {
	return (
		<>
			<path
				d={d}
				stroke="var(--sl-hairline)"
				strokeWidth={1.5}
				fill="none"
			/>
			<path
				d={d}
				stroke="var(--sl-verdigris)"
				strokeWidth={1.5}
				fill="none"
				strokeDasharray={DASH}
				strokeDashoffset={flowOffset(t, SPEED, PERIOD)}
				opacity={active}
			/>
		</>
	);
}

interface Layout {
	width: number;
	height: number;
	sources: { box: [number, number]; d: string }[];
	node: [number, number];
	out: string;
	model: { x: number; y: number; w: number; h: number };
	axis: { y: number; x0: number; x1: number; ticks: number[] };
	heading: [number, number];
	clock: [number, number];
}

const box = 16;

const WIDE: Layout = (() => {
	const ys = Array.from({ length: TSOS }, (_, i) => 52 + i * 40);
	return {
		width: 720,
		height: 330,
		sources: ys.map((y, i) => ({
			box: [24, y - 6],
			d: `M${String(24 + box + 4)} ${String(y)}H${String(200 + i * 14)}V152H${String(350)}`,
		})),
		node: [360, 152],
		out: 'M370 152H512',
		model: { x: 512, y: 128, w: 184, h: 48 },
		axis: { y: 296, x0: 44, x1: 676, ticks: [0, 4, 8, 12, 16, 20, 24] },
		heading: [24, 26],
		clock: [696, 26],
	};
})();

const COMPACT: Layout = (() => {
	const xs = Array.from({ length: TSOS }, (_, i) => 36 + i * 57.6);
	return {
		width: 360,
		height: 392,
		sources: xs.map((x, i) => ({
			box: [x - box / 2, 40],
			d: `M${String(x)} ${String(40 + 12 + 4)}V${String(110 + i * 8)}H180V178`,
		})),
		node: [180, 188],
		out: 'M180 198V246',
		model: { x: 80, y: 246, w: 200, h: 48 },
		axis: { y: 350, x0: 36, x1: 324, ticks: [0, 8, 16, 24] },
		heading: [16, 22],
		clock: [344, 22],
	};
})();

function Day({ l, t }: { l: Layout; t: number }) {
	const hour = (t / HOUR_MS) % 24;
	const inflow = activity(hour, 0);
	const outflow = activity(hour, 1);
	const x = (h: number) => l.axis.x0 + (h / 24) * (l.axis.x1 - l.axis.x0);
	const merging = Math.max(
		...MERGES.map((m) => windowOf(hour, m - 0.25, m + 0.25))
	);

	return (
		<Sheet width={l.width} height={l.height} label={meta.alt}>
			<Label x={l.heading[0]} y={l.heading[1]}>
				TSO MODELS
			</Label>
			<Label x={l.clock[0]} y={l.clock[1]} anchor="end" tone="ink">
				{clockText(hour)}
			</Label>

			{l.sources.map((s, i) => (
				<g key={i}>
					<rect
						x={s.box[0]}
						y={s.box[1]}
						width={box}
						height={12}
						fill="var(--sl-paper)"
						stroke="var(--sl-ink)"
						strokeWidth={1.5}
					/>
					<Wire d={s.d} active={inflow} t={t} />
				</g>
			))}

			<Node x={l.node[0]} y={l.node[1]} r={10 + 3 * merging} />
			<Wire d={l.out} active={outflow} t={t} />
			<rect
				x={l.model.x}
				y={l.model.y}
				width={l.model.w}
				height={l.model.h}
				fill="var(--sl-paper)"
				stroke="var(--sl-ink)"
				strokeWidth={3}
			/>
			<Label
				x={l.model.x + l.model.w / 2}
				y={l.model.y + l.model.h / 2 + 4}
				anchor="middle"
				tone="ink"
			>
				COMMON GRID MODEL
			</Label>

			<path
				d={`M${String(l.axis.x0)} ${String(l.axis.y)}H${String(l.axis.x1)}`}
				stroke="var(--sl-ink)"
				strokeWidth={1.5}
			/>
			{l.axis.ticks.map((h) => (
				<g key={h}>
					<path
						d={`M${String(x(h))} ${String(l.axis.y)}v5`}
						stroke="var(--sl-ink)"
						strokeWidth={1.5}
					/>
					<Label
						x={x(h)}
						y={l.axis.y + 20}
						anchor="middle"
						tone={MERGES.includes(h) ? 'ink' : 'muted'}
					>
						{`${String(h).padStart(2, '0')}:00`}
					</Label>
				</g>
			))}
			{MERGES.map((m) => (
				<g key={m}>
					<path
						d={`M${String(x(m - WINDOW))} ${String(l.axis.y - 10)}H${String(x(m + WINDOW))}`}
						stroke="var(--sl-hairline)"
						strokeWidth={3}
					/>
					<Label x={x(m)} y={l.axis.y - 18} anchor="middle">
						MERGE
					</Label>
				</g>
			))}
			<path
				d={`M${String(x(hour))} ${String(l.axis.y - 14)}V${String(l.axis.y + 4)}`}
				stroke="var(--sl-verdigris)"
				strokeWidth={3}
			/>
		</Sheet>
	);
}

export default function Figure() {
	const clock = useClock();
	return (
		<Frame meta={meta} clock={clock}>
			{({ compact }) => (
				<Day l={compact ? COMPACT : WIDE} t={clock.time} />
			)}
		</Frame>
	);
}
