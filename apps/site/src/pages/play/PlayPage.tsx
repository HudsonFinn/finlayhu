import { GridProvider, useGrid } from '@fhudson/grid';
import {
	Button,
	Checkbox,
	Heading,
	Link,
	Meter,
	Slider,
	Stat,
	Status,
	Text,
	cn,
	useTheme,
	type State,
} from '@fhudson/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { eventImpact, eventTone } from './events';
import { GameMap } from './GameMap';
import { FrequencyDial, FrequencyTrace } from './Instruments';
import {
	MAX_SCORE,
	SHIFT,
	STANDARD_BASE,
	UNITS,
	driverAt,
	generationOf,
	gradeFor,
	initialState,
	liveBase,
	loadOf,
	setTarget,
	step,
	type Base,
	type FixedSource,
	type GridState,
	type UnitId,
} from './simulation';

/** Physics step, seconds. Small enough that a trip can't jump straight past the limits. */
const STEP = 0.05;
/** How often the screen redraws, seconds. The model runs faster than this. */
const DRAW = 0.1;
/** One trace point every half second, keeping the last minute. */
const SAMPLE = 0.5;
const TRACE_POINTS = 120;

const mw = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const gw = (value: number) => (value / 1000).toFixed(1);
const hhmm = (d: Date) => d.toISOString().slice(11, 16);

/** Within ±0.2 Hz is normal operation; ±0.5 Hz is the statutory limit. */
function frequencyState(hz: number): State {
	const off = Math.abs(hz - 50);
	if (off <= 0.2) return 'in-service';
	if (off <= 0.5) return 'isolated';
	return 'fault';
}

const stateText: Record<State, string> = {
	'in-service': 'text-verdigris',
	isolated: 'text-amber',
	fault: 'text-fault',
	unknown: 'text-ink-muted',
};

const FIXED: { id: FixedSource; label: string }[] = [
	{ id: 'nuclear', label: 'Nuclear' },
	{ id: 'wind', label: 'Wind' },
	{ id: 'solar', label: 'Solar' },
	{ id: 'imports', label: 'Imports' },
	{ id: 'other', label: 'Biomass and other' },
];

/** Keyboard controls: raise, lower, and how far each press moves the target. */
const KEYS: Record<UnitId, { up: string; down: string; step: number }> = {
	battery: { up: 'q', down: 'a', step: 250 },
	hydro: { up: 'w', down: 's', step: 100 },
	gas: { up: 'e', down: 'd', step: 500 },
};

type Phase = 'ready' | 'running' | 'paused' | 'over';

/** Hold 50 Hz, full screen: its own shell, outside the site's page layout. */
function PlayPage() {
	useTheme('dark');
	return (
		<GridProvider>
			<Game />
		</GridProvider>
	);
}

function Game() {
	const { demand, mix } = useGrid();
	const [useLive, setUseLive] = useState(true);
	const liveDemand = demand.data?.at(-1);
	const live =
		liveDemand && mix.data ? { demand: liveDemand, mix: mix.data } : null;
	const base: Base =
		useLive && live
			? liveBase(live.demand.value, live.mix.mix)
			: STANDARD_BASE;

	const [game, setGame] = useState(() => initialState(base));
	const [trace, setTrace] = useState<number[]>([]);
	const [phase, setPhase] = useState<Phase>('ready');
	const gameRef = useRef(game);
	const traceRef = useRef(trace);

	useEffect(() => {
		document.title = 'Hold 50 Hz · Finlay Hudson';
	}, []);

	// Before the first start, the board shows whichever starting point is selected
	const ready = phase === 'ready';
	const baseKey = JSON.stringify(base);
	useEffect(() => {
		if (!ready) return;
		const fresh = initialState(JSON.parse(baseKey) as Base);
		gameRef.current = fresh;
		setGame(fresh);
	}, [ready, baseKey]);

	useEffect(() => {
		if (phase !== 'running') return;
		let frame = 0;
		let last = performance.now();
		let pending = 0;
		let sinceDraw = 0;
		let sinceSample = 0;

		const tick = (now: number) => {
			// Cap the gap, so a backgrounded tab doesn't come back to a blackout
			const dt = Math.min(0.25, (now - last) / 1000);
			last = now;
			pending += dt;
			sinceDraw += dt;
			let s = gameRef.current;
			while (pending >= STEP && s.outcome.kind === 'running') {
				s = step(s, STEP);
				pending -= STEP;
				sinceSample += STEP;
				if (sinceSample >= SAMPLE) {
					sinceSample = 0;
					traceRef.current = [...traceRef.current, s.f].slice(
						-TRACE_POINTS
					);
				}
			}
			gameRef.current = s;
			const over = s.outcome.kind !== 'running';
			if (sinceDraw >= DRAW || over) {
				sinceDraw = 0;
				setGame(s);
				setTrace(traceRef.current);
			}
			if (over) setPhase('over');
			else frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [phase]);

	const start = () => {
		const fresh = initialState(base);
		gameRef.current = fresh;
		traceRef.current = [];
		setGame(fresh);
		setTrace([]);
		setPhase('running');
	};

	const dispatch = (id: UnitId, target: number) => {
		gameRef.current = setTarget(gameRef.current, id, target);
		setGame(gameRef.current);
	};

	// Keyboard play: letters nudge targets, space pauses
	const phaseRef = useRef(phase);
	phaseRef.current = phase;
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const key = e.key.toLowerCase();
			if (key === ' ') {
				// Leave space alone on controls that use it themselves
				const target = e.target as HTMLElement;
				if (target.closest('button, input, a, [role="button"]')) return;
				if (phaseRef.current === 'running') setPhase('paused');
				else if (phaseRef.current === 'paused') setPhase('running');
				else return;
				e.preventDefault();
				return;
			}
			if (phaseRef.current !== 'running') return;
			for (const spec of UNITS) {
				const k = KEYS[spec.id];
				const sign = key === k.up ? 1 : key === k.down ? -1 : 0;
				if (sign === 0) continue;
				e.preventDefault();
				dispatch(
					spec.id,
					gameRef.current.units[spec.id].target + sign * k.step
				);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('keydown', onKey);
		};
	}, []);

	const generation = generationOf(game);
	const load = loadOf(game);
	const imbalance = generation - load;
	const fState = frequencyState(game.f);
	const inBandShare = game.t > 0 ? game.inBand / game.t : 1;
	const playing = phase === 'running';

	return (
		<div className="flex min-h-dvh flex-col bg-paper text-ink lg:h-dvh lg:overflow-hidden">
			{/* The whole screen flashes red while frequency is outside statutory limits */}
			{playing && fState === 'fault' && (
				<div
					aria-hidden="true"
					className="pointer-events-none fixed inset-0 z-30 animate-pulse ring-8 ring-fault ring-inset motion-reduce:animate-none"
				/>
			)}

			<header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-hairline bg-sheet px-4 py-2.5">
				<Link
					href="/"
					className="font-data text-label uppercase tracking-widest"
				>
					← fhudson.com
				</Link>
				<h1 className="font-display text-ui uppercase tracking-wide">
					Hold 50 Hz
				</h1>
				<div className="ml-auto flex items-center gap-5 font-data text-label uppercase tracking-widest text-ink-muted">
					<Readout label="Shift">
						T+{String(Math.floor(game.t)).padStart(3, '0')}
						<span className="text-ink-muted"> / {SHIFT}</span>
					</Readout>
					<Readout label="Score">{Math.round(game.score)}</Readout>
					<Readout label="In band" className="max-sm:hidden">
						{Math.round(inBandShare * 100)}%
					</Readout>
					{(phase === 'running' || phase === 'paused') && (
						<Button
							size="sm"
							variant="ghost"
							onPress={() => {
								setPhase(playing ? 'paused' : 'running');
							}}
						>
							{playing ? 'Pause' : 'Resume'}
						</Button>
					)}
				</div>
			</header>

			<div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[17rem_minmax(0,1fr)_19rem]">
				{/* Instruments */}
				{/* On phones, the dial sits beside the reading to leave room for the map */}
				<aside className="flex flex-col gap-4 border-hairline p-4 max-lg:grid max-lg:grid-cols-[7.5rem_minmax(0,1fr)] max-lg:items-center max-lg:gap-x-4 max-lg:border-b max-lg:py-3 lg:border-r">
					<div className="max-lg:hidden">
						<Label>System frequency</Label>
					</div>
					<div className="mx-auto w-full max-w-64">
						<FrequencyDial hz={game.f} />
					</div>
					<div className="flex flex-col gap-4 max-lg:gap-2">
						<div className="flex items-baseline gap-2 lg:justify-center">
							<span
								className={cn(
									'font-display text-h1 leading-none tabular-nums max-lg:text-h2',
									stateText[fState]
								)}
							>
								{game.f.toFixed(3)}
							</span>
							<span className="font-data text-small text-ink-muted">
								Hz
							</span>
						</div>
						<div className="flex items-center justify-between gap-2 font-data text-small">
							<Status
								state={
									phase === 'ready'
										? 'unknown'
										: game.outcome.kind === 'tripped'
											? 'fault'
											: fState
								}
								live
							>
								{phase === 'ready'
									? 'Standby'
									: game.outcome.kind === 'tripped'
										? 'Tripped'
										: fState === 'in-service'
											? 'In band'
											: 'Excursion'}
							</Status>
							<span className="tabular-nums text-ink-muted">
								{game.rocof >= 0 ? '+' : '−'}
								{Math.abs(game.rocof).toFixed(3)} Hz/s
							</span>
						</div>
					</div>
					<div className="flex flex-col gap-2 max-lg:hidden">
						<Label>Last minute</Label>
						<FrequencyTrace values={trace} points={TRACE_POINTS} />
					</div>
					<dl className="mt-auto flex flex-col font-data text-small max-lg:hidden">
						<Row label="Demand" value={`${gw(load)} GW`} strong />
						<Row
							label="Generation"
							value={`${gw(generation)} GW`}
							strong
						/>
						<Row
							label="Imbalance"
							value={`${imbalance >= 0 ? '+' : '−'}${mw.format(Math.abs(imbalance))} MW`}
							strong
							tone={imbalance < -100 ? 'text-fault' : undefined}
						/>
					</dl>
				</aside>

				{/* The map */}
				<main
					id="main"
					className="drawing-grid relative flex min-h-0 flex-col max-lg:h-[62svh]"
				>
					<GameMap game={game} className="m-4 flex-1" />
				</main>

				{/* Supply and the control log */}
				<aside className="flex min-h-0 flex-col gap-4 border-hairline p-4 max-lg:order-last max-lg:border-t lg:border-l">
					<Label>Supply you can’t control</Label>
					<dl className="flex flex-col font-data text-small">
						{FIXED.map((source) => (
							<Row
								key={source.id}
								label={source.label}
								value={`${gw(driverAt(game.base, source.id, game.t, game.events))} GW`}
							/>
						))}
						<Row
							label="Demand"
							value={`${gw(load)} GW`}
							strong
							className="lg:hidden"
						/>
					</dl>
					<Label>Control log</Label>
					<ol
						role="log"
						className="flex min-h-0 flex-1 flex-col overflow-y-auto"
					>
						{game.log.length === 0 && (
							<li className="py-2 text-small text-ink-muted">
								{phase === 'ready'
									? 'Shift not started.'
									: 'Quiet so far.'}
							</li>
						)}
						{[...game.log].reverse().map((event) => (
							<li
								key={event.at}
								className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2 border-b border-hairline py-2 text-small last:border-b-0"
							>
								<span className="font-data text-ink-muted tabular-nums">
									T+{event.at}
								</span>
								<span>{event.message}</span>
								<span
									className={cn(
										'col-start-2 font-data text-label',
										eventTone(event)
									)}
								>
									{eventImpact(event)}
								</span>
							</li>
						))}
					</ol>
				</aside>
			</div>

			{/* The desk: one fader per unit */}
			<section
				aria-label="Dispatch"
				className="grid grid-cols-1 gap-px border-t border-hairline bg-hairline max-lg:sticky max-lg:bottom-0 max-lg:z-10 md:grid-cols-3"
			>
				{UNITS.map((spec) => {
					const unit = game.units[spec.id];
					const keys = KEYS[spec.id];
					return (
						<div
							key={spec.id}
							className="flex flex-col gap-2.5 bg-sheet px-4 py-3 max-md:gap-1 max-md:py-2"
						>
							<Slider
								label={spec.label}
								unit="MW"
								minValue={spec.min}
								maxValue={spec.max}
								step={keys.step / 5}
								origin={spec.min < 0 ? 0 : undefined}
								value={unit.target}
								onChange={(v) => {
									dispatch(spec.id, v);
								}}
								isDisabled={!playing}
							/>
							<div className="flex items-baseline justify-between gap-3 text-small">
								<span className="text-ink-muted">
									Output{' '}
									<span className="font-data text-ink tabular-nums">
										{mw.format(unit.output)} MW
									</span>
									{spec.energy !== undefined && (
										<span className="md:hidden">
											{' '}
											·{' '}
											{Math.round(
												(unit.stored / spec.energy) *
													100
											)}
											% stored
										</span>
									)}
								</span>
								<span className="flex items-center gap-1 font-data text-label text-ink-muted max-md:hidden">
									<Kbd>{keys.up}</Kbd>
									<Kbd>{keys.down}</Kbd>
								</span>
							</div>
							{spec.energy !== undefined ? (
								<Meter
									className="max-md:hidden"
									label="Stored"
									value={unit.stored}
									max={spec.energy}
									unit="MWh"
									formatValue={(v) => v.toFixed(1)}
									state={
										unit.stored < spec.energy * 0.15
											? 'isolated'
											: 'in-service'
									}
								/>
							) : (
								<Text
									variant="small"
									tone="muted"
									className="max-md:hidden"
								>
									{spec.note} · ramps {spec.ramp} MW/s
								</Text>
							)}
						</div>
					);
				})}
			</section>

			{phase === 'ready' && (
				<Overlay>
					<Briefing
						useLive={useLive}
						setUseLive={setUseLive}
						liveNote={
							useLive && live
								? `Demand ${gw(live.demand.value)} GW at ${hhmm(live.demand.time)} UTC, with this half hour’s generation mix.`
								: useLive
									? 'Waiting for live data. Until it arrives, you start from a standard evening.'
									: 'A standard evening: 30 GW of demand, 9 GW of wind.'
						}
						onStart={start}
					/>
				</Overlay>
			)}
			{phase === 'paused' && (
				<Overlay>
					<Label>Shift paused · T+{Math.floor(game.t)}</Label>
					<Heading level={2}>Paused</Heading>
					<Text tone="muted">
						The grid waits for you. It won’t in real life.
					</Text>
					<div className="flex flex-wrap gap-3">
						<Button
							autoFocus
							onPress={() => {
								setPhase('running');
							}}
						>
							Resume
						</Button>
						<Button variant="ghost" onPress={start}>
							Restart
						</Button>
					</div>
				</Overlay>
			)}
			{phase === 'over' && (
				<Overlay>
					<ShiftReport game={game} onAgain={start} />
				</Overlay>
			)}
		</div>
	);
}

function Overlay({ children }: { children: ReactNode }) {
	return (
		<div className="fixed inset-0 z-20 grid place-items-center overflow-y-auto bg-paper/70 p-4 backdrop-blur-sm">
			<div
				role="dialog"
				aria-modal="true"
				className="flex w-full max-w-lg flex-col gap-4 border-[1.5px] border-ink bg-sheet p-6 shadow-2xl"
			>
				{children}
			</div>
		</div>
	);
}

function Briefing({
	useLive,
	setUseLive,
	liveNote,
	onStart,
}: {
	useLive: boolean;
	setUseLive: (live: boolean) => void;
	liveNote: string;
	onStart: () => void;
}) {
	return (
		<>
			<Label>Shift briefing · FH-CTL-050</Label>
			<Heading level={2}>Hold 50 Hz</Heading>
			<Text>
				You’re the control engineer for a two-minute evening shift.
				Every second, generation has to match demand. When it doesn’t,
				every machine on the grid speeds up or slows down, and frequency
				moves.
			</Text>
			<ul className="flex flex-col gap-1.5 text-small">
				<li>
					<span className="text-verdigris">49.8–50.2 Hz</span> · 10
					points a second
				</li>
				<li>
					<span className="text-amber">49.5–50.5 Hz</span> · 2 points
					a second
				</li>
				<li>
					<span className="text-fault">Beyond</span> · lose 5 a
					second. Below 48.8 Hz, demand is disconnected and the shift
					ends.
				</li>
			</ul>
			<div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5 text-small">
				{UNITS.map((spec) => (
					<div key={spec.id} className="contents">
						<span className="flex gap-1">
							<Kbd>{KEYS[spec.id].up}</Kbd>
							<Kbd>{KEYS[spec.id].down}</Kbd>
						</span>
						<span>
							{spec.label}
							<span className="text-ink-muted">
								{' '}
								· {spec.note}
							</span>
						</span>
					</div>
				))}
				<span className="flex gap-1">
					<Kbd>Space</Kbd>
				</span>
				<span>Pause</span>
			</div>
			<div className="flex flex-col gap-1.5">
				<Checkbox isSelected={useLive} onChange={setUseLive}>
					Start from the live GB grid
				</Checkbox>
				<Text variant="small" tone="muted">
					{liveNote}
				</Text>
			</div>
			<Button autoFocus onPress={onStart} className="self-start">
				Start shift
			</Button>
		</>
	);
}

function ShiftReport({
	game,
	onAgain,
}: {
	game: GridState;
	onAgain: () => void;
}) {
	const intensity = game.energy > 0 ? (game.tonnes * 1000) / game.energy : 0;
	return (
		<>
			<Label>
				Shift report ·{' '}
				{game.outcome.kind === 'tripped' ? 'Fault' : 'Complete'}
			</Label>
			<Heading level={2}>{gradeFor(game)}</Heading>
			{game.outcome.kind === 'tripped' && (
				<Text className="text-fault">{game.outcome.reason}</Text>
			)}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Stat
					label="Score"
					value={Math.round(game.score)}
					note={`Out of ${String(MAX_SCORE)}`}
				/>
				<Stat
					label="In band"
					value={Math.round(game.inBand)}
					unit="s"
					note={`Of ${String(Math.round(game.t))} s`}
				/>
				<Stat
					label="Carbon"
					value={Math.round(intensity)}
					unit="g/kWh"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<Button autoFocus onPress={onAgain}>
					Run another shift
				</Button>
				<Link href="/">Back to the site</Link>
			</div>
		</>
	);
}

function Label({ children }: { children: ReactNode }) {
	return (
		<p className="font-data text-label uppercase tracking-widest text-ink-muted">
			{children}
		</p>
	);
}

function Readout({
	label,
	children,
	className,
}: {
	label: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<span className={cn('flex items-baseline gap-2', className)}>
			{label}
			<span className="text-small text-ink tabular-nums">{children}</span>
		</span>
	);
}

function Kbd({ children }: { children: ReactNode }) {
	return (
		<kbd className="inline-flex min-w-5 justify-center border border-hairline bg-paper px-1 font-data text-label uppercase text-ink">
			{children}
		</kbd>
	);
}

function Row({
	label,
	value,
	strong = false,
	tone = 'text-ink',
	className,
}: {
	label: string;
	value: string;
	strong?: boolean;
	/** Text colour for the value. */
	tone?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex justify-between gap-4 border-b border-hairline py-1.5 last:border-b-0',
				className
			)}
		>
			<dt className={strong ? 'text-ink' : 'text-ink-muted'}>{label}</dt>
			<dd className={cn('tabular-nums', tone)}>{value}</dd>
		</div>
	);
}

export default PlayPage;
