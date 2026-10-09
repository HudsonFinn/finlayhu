import { cn } from '@fhudson/ui';
import {
	GB_PATH,
	MAP_HEIGHT,
	MAP_WIDTH,
	NEIGHBOURS_PATH,
	project,
} from './gbMap';
import { eventImpact, eventTone } from './events';
import {
	UNITS,
	type GridEvent,
	type GridState,
	type UnitId,
} from './simulation';

/** How long an event's callout stays open, in seconds. After that it shrinks to a pin. */
const CALLOUT = 10;

type Kind = UnitId | 'nuclear' | 'wind';

interface Site {
	name: string;
	kind: Kind;
	lon: number;
	lat: number;
}

/** Real sites, standing in for each fleet. */
const SITES: Site[] = [
	{ name: 'Pillswood', kind: 'battery', lon: -0.4, lat: 53.77 },
	{ name: 'Minety', kind: 'battery', lon: -1.97, lat: 51.6 },
	{ name: 'Blackhillock', kind: 'battery', lon: -2.98, lat: 57.53 },
	{ name: 'Dinorwig', kind: 'hydro', lon: -4.11, lat: 53.12 },
	{ name: 'Cruachan', kind: 'hydro', lon: -5.11, lat: 56.4 },
	{ name: 'Pembroke', kind: 'gas', lon: -4.99, lat: 51.68 },
	{ name: 'Grain', kind: 'gas', lon: 0.7, lat: 51.44 },
	{ name: 'Keadby', kind: 'gas', lon: -0.75, lat: 53.59 },
	{ name: 'Peterhead', kind: 'gas', lon: -1.79, lat: 57.48 },
	{ name: 'Heysham', kind: 'nuclear', lon: -2.92, lat: 54.03 },
	{ name: 'Torness', kind: 'nuclear', lon: -2.41, lat: 55.97 },
	{ name: 'Hartlepool', kind: 'nuclear', lon: -1.18, lat: 54.64 },
	{ name: 'Sizewell B', kind: 'nuclear', lon: 1.62, lat: 52.21 },
	{ name: 'Dogger Bank', kind: 'wind', lon: 1.9, lat: 54.75 },
	{ name: 'Hornsea', kind: 'wind', lon: 1.8, lat: 53.9 },
	{ name: 'Moray East', kind: 'wind', lon: -2.7, lat: 58.1 },
	{ name: 'Seagreen', kind: 'wind', lon: -1.8, lat: 56.6 },
	{ name: 'Walney', kind: 'wind', lon: -3.5, lat: 54.05 },
	{ name: 'Whitelee', kind: 'wind', lon: -4.3, lat: 55.68 },
];

/** Cables to the continent, drawn from the landing point out to sea. */
const LINKS = [
	{ name: 'IFA', from: [0.98, 51.11], to: [1.85, 50.92] },
	{ name: 'BritNed', from: [0.7, 51.44], to: [2.8, 51.85] },
	{ name: 'NSL', from: [-1.5, 55.14], to: [2.8, 56.6] },
] as const;

/** Map coordinates as percentages, for placing HTML over the drawing. */
const at = (lon: number, lat: number) => {
	const { x, y } = project(lon, lat);
	return {
		left: `${String((x / MAP_WIDTH) * 100)}%`,
		top: `${String((y / MAP_HEIGHT) * 100)}%`,
	};
};

/** Great Britain with the operator's units, the fixed plant, and each event where it happens. */
export function GameMap({
	game,
	className,
}: {
	game: GridState;
	className?: string;
}) {
	const tripped = new Set(
		game.log.filter((e) => e.over === 0).map((e) => e.place.name)
	);
	const linkTripped = game.log.some((e) => e.driver === 'imports');

	return (
		// Sized from its container, so the drawing and the HTML over it always line up
		<div
			className={cn('relative min-h-0', className)}
			style={{ containerType: 'size' }}
		>
			<div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				style={{
					width: `min(100cqw, calc(100cqh * ${String(MAP_WIDTH / MAP_HEIGHT)}))`,
					aspectRatio: `${String(MAP_WIDTH)} / ${String(MAP_HEIGHT)}`,
				}}
			>
				<svg
					viewBox={`0 0 ${String(MAP_WIDTH)} ${String(MAP_HEIGHT)}`}
					className="absolute inset-0 size-full"
					role="img"
					aria-label="Map of Great Britain showing your units and the shift’s events"
				>
					<path d={NEIGHBOURS_PATH} className="fill-hairline/40" />
					<path
						d={GB_PATH}
						className="fill-sheet stroke-ink"
						strokeWidth={1.5}
						vectorEffect="non-scaling-stroke"
						strokeLinejoin="round"
					/>
					{LINKS.map((link) => {
						const a = project(link.from[0], link.from[1]);
						const b = project(link.to[0], link.to[1]);
						const down = link.name === 'IFA' && linkTripped;
						return (
							<line
								key={link.name}
								x1={a.x}
								y1={a.y}
								x2={b.x}
								y2={b.y}
								className={
									down ? 'stroke-fault' : 'stroke-ink-muted'
								}
								strokeWidth={1.5}
								strokeDasharray="4 4"
								vectorEffect="non-scaling-stroke"
							/>
						);
					})}
				</svg>

				{SITES.map((site) => (
					<SiteMarker
						key={site.name}
						site={site}
						game={game}
						tripped={tripped.has(site.name)}
					/>
				))}

				{game.log.map((event) => (
					<EventMarker
						key={event.at}
						event={event}
						open={game.t - event.at < CALLOUT}
					/>
				))}
			</div>
		</div>
	);
}

function SiteMarker({
	site,
	game,
	tripped,
}: {
	site: Site;
	game: GridState;
	tripped: boolean;
}) {
	const style = at(site.lon, site.lat);

	if (site.kind === 'nuclear' || site.kind === 'wind') {
		return (
			<span
				title={`${site.name} · ${site.kind}`}
				className={cn(
					'absolute -translate-x-1/2 -translate-y-1/2',
					site.kind === 'nuclear'
						? 'size-2.5 rounded-full border-[1.5px]'
						: 'size-1.5 rotate-45 bg-current',
					tripped
						? 'border-fault text-fault'
						: 'border-ink-muted text-ink-muted'
				)}
				style={style}
			/>
		);
	}

	// The operator's units light up with their output: verdigris generating, cobalt charging
	const spec = UNITS.find((u) => u.id === site.kind);
	const output = game.units[site.kind].output;
	const strength = spec
		? Math.abs(output) / Math.max(spec.max, -spec.min)
		: 0;
	const charging = output < -1;
	const on = Math.abs(output) > 1;
	return (
		<span
			title={`${site.name} · ${spec?.label ?? ''}`}
			className={cn(
				'absolute size-2.5 -translate-x-1/2 -translate-y-1/2 border-[1.5px]',
				on ? 'border-current bg-current' : 'border-ink-muted bg-sheet',
				charging
					? 'text-[var(--sl-series-2)]'
					: on
						? 'text-verdigris'
						: 'text-ink-muted'
			)}
			style={{
				...style,
				boxShadow: on
					? `0 0 ${String(4 + strength * 18)}px ${String(1 + strength * 5)}px currentColor`
					: undefined,
			}}
		/>
	);
}

function EventMarker({ event, open }: { event: GridEvent; open: boolean }) {
	const { x } = project(event.place.lon, event.place.lat);
	// Callouts open towards the middle of the map, so they stay on it
	const leftward = x / MAP_WIDTH > 0.55;
	return (
		<div
			className={cn('absolute', eventTone(event), open ? 'z-10' : 'z-0')}
			style={at(event.place.lon, event.place.lat)}
		>
			<span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
			{open && (
				<>
					<span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-current motion-reduce:hidden" />
					<div
						className={cn(
							'absolute top-0 flex w-max max-w-[17rem] -translate-y-1/2 flex-col gap-0.5 border-[1.5px] border-current bg-sheet px-3 py-2 shadow-lg',
							leftward ? 'right-4' : 'left-4'
						)}
					>
						<span className="font-data text-label uppercase tracking-widest">
							{event.title} · T+{event.at}
						</span>
						<span className="text-small text-ink">
							{event.place.name}
						</span>
						<span className="font-data text-small text-ink-muted">
							{eventImpact(event)}
							{event.over > 0
								? ` over ${String(event.over)} s`
								: ', instantly'}
						</span>
					</div>
				</>
			)}
		</div>
	);
}
