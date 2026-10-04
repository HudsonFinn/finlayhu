import { lazy, Suspense, type ReactNode } from 'react';
import { Button, Text, TitleBlock } from '@fhudson/ui';
import {
	BEAT,
	HOLD,
	STEP,
	drawOn,
	progress,
	settle,
	useClock,
} from './figures/kit';

const Substation3D = lazy(() => import('./figures/Substation3D'));

/*
 * Phase 1 of docs/plans/figures.md: the look of Boundary Node figures, for review.
 * Every figure sits on a sheet with a title block strip: drawing number, source, date, and
 * where the interactive version lives.
 */

function FigureFrame({
	number,
	source,
	date,
	controls,
	children,
}: {
	number: string;
	source: string;
	date: string;
	controls: ReactNode;
	children: ReactNode;
}) {
	return (
		<figure className="flex w-full max-w-[728px] flex-col gap-3">
			<div className="flex flex-col border-[1.5px] border-ink bg-paper">
				<div className="drawing-grid">{children}</div>
				<TitleBlock
					className="border-0 border-t-[1.5px]"
					fields={[
						{ label: 'Drawing', value: number },
						{ label: 'Source', value: source },
						{ label: 'Date', value: date },
						{
							label: 'Interactive',
							value: `fhudson.com/f/${number.toLowerCase()}`,
						},
					]}
				/>
			</div>
			<div className="flex flex-wrap items-center gap-3">{controls}</div>
		</figure>
	);
}

function Controls({
	clock,
	duration,
}: {
	clock: ReturnType<typeof useClock>;
	duration?: number;
}) {
	return (
		<>
			<Button variant="ghost" size="sm" onPress={clock.toggle}>
				{clock.playing ? 'Pause' : 'Play'}
			</Button>
			{duration ? (
				<label className="flex items-center gap-3 font-data text-label uppercase tracking-widest text-ink-muted">
					Time
					<input
						type="range"
						min={0}
						max={duration}
						step={BEAT / 10}
						value={clock.time}
						onChange={(event) => {
							if (clock.playing) clock.toggle();
							clock.setTime(Number(event.target.value));
						}}
						className="w-40 accent-[var(--sl-verdigris)]"
					/>
					<span className="w-12 tabular-nums text-ink">
						{(clock.time / 1000).toFixed(1)} s
					</span>
				</label>
			) : null}
		</>
	);
}

/* ---- BN-00-F1 · the plotter: a substation drawn one mark at a time ---- */

const FEEDERS = [200, 360, 520];
const FEEDER_START = 4400;
const BUILD_END = FEEDER_START + 2 * BEAT + 3 * BEAT + BEAT;
const PLOT_DURATION = BUILD_END + HOLD;

function Label({
	x,
	y,
	anchor = 'start',
	opacity,
	children,
}: {
	x: number;
	y: number;
	anchor?: 'start' | 'middle' | 'end';
	opacity: number;
	children: ReactNode;
}) {
	return (
		<text
			x={x}
			y={y}
			textAnchor={anchor}
			opacity={opacity}
			fill="var(--sl-ink-muted)"
			style={{
				font: '11px var(--sl-font-data)',
				letterSpacing: '0.08em',
			}}
		>
			{children}
		</text>
	);
}

function PlotterFigure() {
	const clock = useClock(PLOT_DURATION);
	const t = clock.time;
	const ink = { stroke: 'var(--sl-ink)', fill: 'none', strokeWidth: 1.5 };
	const appear = (start: number) => settle(progress(t, start, BEAT));

	return (
		<FigureFrame
			number="BN-00-F1"
			source="Illustrative"
			date="04.10.26"
			controls={<Controls clock={clock} duration={PLOT_DURATION} />}
		>
			<svg
				viewBox="0 0 720 300"
				className="block w-full"
				role="img"
				aria-label="A substation drawn one mark at a time: a 132 kV circuit arrives at a boundary node, steps down through a transformer to a 33 kV busbar, and leaves on three feeders."
			>
				<path d="M360 20V52" {...ink} {...drawOn(progress(t, 0))} />
				<Label x={372} y={30} opacity={appear(STEP)}>
					132 kV
				</Label>

				<circle
					cx={360}
					cy={62}
					r={10}
					fill="var(--sl-paper)"
					stroke="var(--sl-verdigris)"
					strokeWidth={3}
					{...drawOn(progress(t, STEP))}
				/>
				<Label x={380} y={66} opacity={appear(2 * STEP)}>
					BOUNDARY NODE
				</Label>

				<path
					d="M360 72V92"
					{...ink}
					{...drawOn(progress(t, 2 * STEP, BEAT))}
				/>
				<circle
					cx={360}
					cy={108}
					r={16}
					{...ink}
					{...drawOn(progress(t, 2 * STEP + BEAT))}
				/>
				<circle
					cx={360}
					cy={130}
					r={16}
					{...ink}
					{...drawOn(progress(t, 2 * STEP + 2 * BEAT))}
				/>
				<path
					d="M360 146V170"
					{...ink}
					{...drawOn(progress(t, 4 * STEP, BEAT))}
				/>

				<path
					d="M104 170H616"
					stroke="var(--sl-ink)"
					strokeWidth={3}
					{...drawOn(progress(t, 4 * STEP + BEAT))}
				/>
				<Label x={104} y={160} opacity={appear(FEEDER_START)}>
					33 kV
				</Label>

				{FEEDERS.map((x, i) => {
					const start = FEEDER_START + i * BEAT;
					return (
						<g key={x}>
							<path
								d={`M${String(x)} 170V196`}
								{...ink}
								{...drawOn(progress(t, start, BEAT))}
							/>
							<rect
								x={x - 8}
								y={196}
								width={16}
								height={16}
								stroke="var(--sl-ink)"
								strokeWidth={1.5}
								fill="var(--sl-ink)"
								fillOpacity={appear(start + 3 * BEAT)}
								{...drawOn(progress(t, start + BEAT, BEAT))}
							/>
							<path
								d={`M${String(x)} 212V262`}
								{...ink}
								{...drawOn(progress(t, start + 2 * BEAT, BEAT))}
							/>
							<Label
								x={x}
								y={282}
								anchor="middle"
								opacity={appear(start + 3 * BEAT)}
							>
								{`F${String(i + 1)}`}
							</Label>
						</g>
					);
				})}
			</svg>
		</FigureFrame>
	);
}

/* ---- BN-00-F2 · flow: power moving through a boundary node, speed by MW ---- */

const ROWS = [70, 150, 230];
const SOURCES = [
	{ name: 'Wind', mw: 1240 },
	{ name: 'Nuclear', mw: 860 },
	{ name: 'Interconnector', mw: 400 },
];
const LOADS = [
	{ name: 'Feeder A', mw: 1100 },
	{ name: 'Feeder B', mw: 900 },
	{ name: 'Feeder C', mw: 500 },
];
const TOTAL = SOURCES.reduce((sum, s) => sum + s.mw, 0);
/** px per second per MW. Constant along a line; faster means more power. */
const SPEED = 1 / 40;
const DASH = 16;
const mw = (n: number) => `${n.toLocaleString('en-GB')} MW`;

function Flow({ d, power, time }: { d: string; power: number; time: number }) {
	const offset = -(((time / 1000) * power * SPEED) % DASH);
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
				strokeDasharray="6 10"
				strokeDashoffset={offset}
			/>
		</>
	);
}

function FlowFigure() {
	const clock = useClock();
	const t = clock.time;

	return (
		<FigureFrame
			number="BN-00-F2"
			source="Illustrative"
			date="04.10.26"
			controls={<Controls clock={clock} />}
		>
			<svg
				viewBox="0 0 720 300"
				className="block w-full"
				role="img"
				aria-label={`Power flowing through a boundary node: wind ${mw(1240)}, nuclear ${mw(860)} and an interconnector ${mw(400)} combine to ${mw(TOTAL)}, which leaves on feeders A, B and C at ${mw(1100)}, ${mw(900)} and ${mw(500)}. Faster dashes mean more power.`}
			>
				{SOURCES.map((s, i) => (
					<g key={s.name}>
						<Flow
							d={`M24 ${String(ROWS[i])}H250`}
							power={s.mw}
							time={t}
						/>
						<Label x={24} y={ROWS[i] - 10} opacity={1}>
							{`${s.name.toUpperCase()} ${mw(s.mw)}`}
						</Label>
					</g>
				))}
				<path d="M250 50V250" stroke="var(--sl-ink)" strokeWidth={3} />

				<Flow d="M250 150H350" power={TOTAL} time={t} />
				<Flow d="M370 150H470" power={TOTAL} time={t} />
				<circle
					cx={360}
					cy={150}
					r={10}
					fill="var(--sl-paper)"
					stroke="var(--sl-verdigris)"
					strokeWidth={3}
				/>
				<Label x={360} y={130} anchor="middle" opacity={1}>
					{mw(TOTAL)}
				</Label>

				<path d="M470 50V250" stroke="var(--sl-ink)" strokeWidth={3} />
				{LOADS.map((l, i) => (
					<g key={l.name}>
						<Flow
							d={`M470 ${String(ROWS[i])}H696`}
							power={l.mw}
							time={t}
						/>
						<Label
							x={696}
							y={ROWS[i] - 10}
							anchor="end"
							opacity={1}
						>
							{`${l.name.toUpperCase()} ${mw(l.mw)}`}
						</Label>
					</g>
				))}
			</svg>
		</FigureFrame>
	);
}

/* ---- BN-00-F3 · 3D: a substation as an iso drawing, turning slowly ---- */

/** One turn every 40 seconds: slow enough to read, constant so it never swoops. */
const TURN = (2 * Math.PI) / 40000;

function SubstationFigure() {
	const clock = useClock();

	return (
		<FigureFrame
			number="BN-00-F3"
			source="Illustrative"
			date="04.10.26"
			controls={<Controls clock={clock} />}
		>
			<div
				role="img"
				aria-label="A three-dimensional line drawing of a 33/11 kV substation, turning slowly: a transformer feeds a busbar between two posts, and three bays each run through a breaker to a cable."
				className="aspect-[3/2] w-full"
			>
				<Suspense fallback={null}>
					<Substation3D angle={Math.PI / 12 + clock.time * TURN} />
				</Suspense>
			</div>
		</FigureFrame>
	);
}

const rules = [
	[
		'Drawn, not rendered',
		'Line work on paper. No gradients, shadows, lighting or perspective.',
	],
	[
		'Lines draw on',
		'Strokes appear in the order you would draw them by hand; nodes arrive as rings.',
	],
	[
		'Flow is moving dashes',
		'Verdigris dashes at constant speed along a line. Faster means more.',
	],
	[
		'Beats of 400 ms',
		'A build step is 800 ms, a hold 1600 ms. Linear for drawing, ease-out to settle.',
	],
	[
		'3D is orthographic',
		'Isometric camera, paper faces, ink edges. Fixed, or one slow constant turn.',
	],
	[
		'Reduced motion',
		'Shows the finished drawing, with play and a time scrubber to step through.',
	],
];

export function Figures() {
	return (
		<div className="flex flex-col gap-10">
			<dl className="grid gap-x-8 gap-y-3 md:grid-cols-2">
				{rules.map(([rule, detail]) => (
					<div
						key={rule}
						className="flex flex-col gap-1 border-b border-hairline pb-3"
					>
						<dt className="font-data text-small text-ink">
							{rule}
						</dt>
						<dd className="text-small text-ink-muted">{detail}</dd>
					</div>
				))}
			</dl>
			<div className="flex flex-col gap-3">
				<Text variant="label">The plotter · draw-on</Text>
				<PlotterFigure />
			</div>
			<div className="flex flex-col gap-3">
				<Text variant="label">Flow · speed by power</Text>
				<FlowFigure />
			</div>
			<div className="flex flex-col gap-3">
				<Text variant="label">3D · iso line drawing</Text>
				<SubstationFigure />
			</div>
		</div>
	);
}
