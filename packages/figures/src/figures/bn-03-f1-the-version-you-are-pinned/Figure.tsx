import { Frame } from '../../kit/Frame';
import { Label, Sheet } from '../../kit/Sheet';
import { BEAT, STEP, drawOn, progress, settle } from '../../kit/time';
import { useClock } from '../../kit/useClock';
import {
	FIRST_YEAR,
	LANES,
	NOW,
	SWEEP_END,
	SWEEP_START,
	YEAR_MS,
	meta,
	type Span,
} from './meta';

/** Where everything sits, for the wide and compact layouts. */
interface Grid {
	width: number;
	height: number;
	x0: number;
	x1: number;
	/** Lane names in a left column (wide) or above their bars (compact). */
	namesLeft: boolean;
	/** Each lane's bar rows; ENTSO-E has two. */
	rows: number[][];
	nameY: number[];
	axisY: number;
	tickEvery: number;
}

const WIDE: Grid = {
	width: 720,
	height: 284,
	x0: 156,
	x1: 690,
	namesLeft: true,
	rows: [[84], [128, 162], [218]],
	nameY: [84, 145, 218],
	axisY: 250,
	tickEvery: 2,
};

const COMPACT: Grid = {
	width: 360,
	height: 318,
	x0: 30,
	x1: 330,
	namesLeft: false,
	rows: [[76], [140, 174], [250]],
	nameY: [44, 108, 218],
	axisY: 284,
	tickEvery: 4,
};

const LAST_YEAR = 2027;
const MONO_EM = 0.68;

function Timeline({ g, t, scale }: { g: Grid; t: number; scale: number }) {
	const x = (year: number) =>
		g.x0 + ((year - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR)) * (g.x1 - g.x0);
	const head = Math.min(
		NOW,
		FIRST_YEAR + Math.max(0, t - SWEEP_START) / YEAR_MS
	);
	const sweeping = t >= SWEEP_START;
	const appear = (start: number) => settle(progress(t, start, BEAT));
	/** A label's width in viewBox units: 11px mono, letter-spaced, on screen. */
	const textWidth = (text: string) => (text.length * 11 * MONO_EM) / scale;

	const bar = (span: Span, y: number) => {
		const start = SWEEP_START + (span.from - FIRST_YEAR) * YEAR_MS;
		const end = Math.min(span.to, head);
		if (!sweeping || head <= span.from) return null;
		const fitsAfter = x(span.from) + textWidth(span.version) <= g.x1;
		return (
			<g key={span.version}>
				{/* A joint where the version changes, like a joint on a busbar */}
				<path
					d={`M${String(x(span.from))} ${String(y - 6)}v12`}
					stroke={
						span.current ? 'var(--sl-verdigris)' : 'var(--sl-ink)'
					}
					strokeWidth={1.5}
				/>
				<path
					d={`M${String(x(span.from))} ${String(y)}H${String(x(end))}`}
					stroke={
						span.current ? 'var(--sl-verdigris)' : 'var(--sl-ink)'
					}
					strokeWidth={span.mandated ? 1.5 : 3}
					strokeDasharray={span.mandated ? '4 4' : undefined}
				/>
				<Label
					x={fitsAfter ? x(span.from) + 2 : x(span.to)}
					// "Mandated" sits under its dashed line, out of the next version's way
					y={span.mandated ? y + 18 : y - 8}
					anchor={fitsAfter ? 'start' : 'end'}
					tone={span.mandated ? 'muted' : 'ink'}
					opacity={appear(start)}
				>
					{span.version}
				</Label>
			</g>
		);
	};

	const years = Array.from(
		{ length: Math.floor((LAST_YEAR - FIRST_YEAR - 1) / g.tickEvery) + 1 },
		(_, i) => FIRST_YEAR + i * g.tickEvery
	);

	return (
		<Sheet width={g.width} height={g.height} label={meta.alt}>
			<path
				d={`M${String(g.x0)} ${String(g.axisY)}H${String(g.x1)}`}
				stroke="var(--sl-ink)"
				strokeWidth={1.5}
				{...drawOn(progress(t, 0, STEP))}
			/>
			{years.map((year, i) => (
				<g key={year} opacity={appear(STEP + i * (BEAT / 4))}>
					<path
						d={`M${String(x(year))} ${String(g.axisY)}v5`}
						stroke="var(--sl-ink)"
						strokeWidth={1.5}
					/>
					<Label x={x(year)} y={g.axisY + 20} anchor="middle">
						{String(year)}
					</Label>
				</g>
			))}

			{LANES.map((lane, i) => (
				<g key={lane.name} opacity={appear(i * BEAT)}>
					{g.namesLeft ? (
						<>
							<Label x={24} y={g.nameY[i] - 2} tone="ink">
								{lane.name}
							</Label>
							<Label x={24} y={g.nameY[i] + 13}>
								{lane.what.toUpperCase()}
							</Label>
						</>
					) : (
						<Label x={g.x0} y={g.nameY[i]} tone="ink">
							{`${lane.name} · ${lane.what.toUpperCase()}`}
						</Label>
					)}
				</g>
			))}

			{LANES.flatMap((lane, i) =>
				lane.spans.map((span, j) =>
					bar(span, g.rows[i][Math.min(j, g.rows[i].length - 1)])
				)
			)}

			{sweeping ? (
				<g>
					{/* The playhead bows out once it reaches today, leaving the drawing clear */}
					<path
						opacity={1 - settle(progress(t, SWEEP_END, BEAT))}
						d={`M${String(x(head))} ${String(g.rows[0][0] - 30)}V${String(g.axisY)}`}
						stroke="var(--sl-ink-muted)"
						strokeWidth={1}
					/>
					<Label
						x={g.x1}
						y={g.namesLeft ? 26 : 18}
						anchor="end"
						tone="ink"
					>
						{head >= NOW
							? 'NOW · OCT 2026'
							: String(Math.floor(head))}
					</Label>
				</g>
			) : null}
		</Sheet>
	);
}

export default function Figure() {
	const clock = useClock(meta.duration);
	return (
		<Frame meta={meta} clock={clock}>
			{({ compact, width }) => {
				const g = compact ? COMPACT : WIDE;
				return (
					<Timeline
						g={g}
						t={clock.time}
						scale={width > 0 ? width / g.width : 1}
					/>
				);
			}}
		</Frame>
	);
}
