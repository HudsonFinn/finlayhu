import { Frame } from '../../kit/Frame';
import { Label, Node, Sheet } from '../../kit/Sheet';
import { flowOffset } from '../../kit/time';
import { useClock } from '../../kit/useClock';
import { LOADS, SOURCES, TOTAL, meta, mw } from './meta';

/** px per second per MW. Constant along a line; faster means more power. */
const SPEED = 1 / 40;
const DASH = '6 10';
const PERIOD = 16;

function Flow({ d, power, time }: { d: string; power: number; time: number }) {
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
				strokeDashoffset={flowOffset(time, power * SPEED, PERIOD)}
			/>
		</>
	);
}

const bus = (d: string) => (
	<path d={d} stroke="var(--sl-ink)" strokeWidth={3} fill="none" />
);

/** Left to right: sources, a busbar, the node, a busbar, feeders. */
function Wide({ t }: { t: number }) {
	const rows = [70, 150, 230];
	return (
		<Sheet width={720} height={300} label={meta.alt}>
			{SOURCES.map((s, i) => (
				<g key={s.name}>
					<Flow
						d={`M24 ${String(rows[i])}H250`}
						power={s.mw}
						time={t}
					/>
					<Label x={24} y={rows[i] - 10}>
						{`${s.name.toUpperCase()} ${mw(s.mw)}`}
					</Label>
				</g>
			))}
			{bus('M250 50V250')}
			<Flow d="M250 150H350" power={TOTAL} time={t} />
			<Flow d="M370 150H470" power={TOTAL} time={t} />
			<Node x={360} y={150} />
			<Label x={360} y={130} anchor="middle">
				{mw(TOTAL)}
			</Label>
			{bus('M470 50V250')}
			{LOADS.map((l, i) => (
				<g key={l.name}>
					<Flow
						d={`M470 ${String(rows[i])}H696`}
						power={l.mw}
						time={t}
					/>
					<Label x={696} y={rows[i] - 10} anchor="end">
						{`${l.name.toUpperCase()} ${mw(l.mw)}`}
					</Label>
				</g>
			))}
		</Sheet>
	);
}

/** Top to bottom, for phones: the same circuit turned through 90°. */
function Compact({ t }: { t: number }) {
	const cols = [60, 180, 300];
	return (
		<Sheet width={360} height={470} label={meta.alt}>
			{SOURCES.map((s, i) => (
				<g key={s.name}>
					<Label x={cols[i]} y={18} anchor="middle">
						{s.name.toUpperCase()}
					</Label>
					<Label x={cols[i]} y={34} anchor="middle" tone="ink">
						{mw(s.mw)}
					</Label>
					<Flow
						d={`M${String(cols[i])} 46V150`}
						power={s.mw}
						time={t}
					/>
				</g>
			))}
			{bus('M30 150H330')}
			<Flow d="M180 150V218" power={TOTAL} time={t} />
			<Flow d="M180 238V306" power={TOTAL} time={t} />
			<Node x={180} y={228} />
			<Label x={198} y={232}>
				{mw(TOTAL)}
			</Label>
			{bus('M30 306H330')}
			{LOADS.map((l, i) => (
				<g key={l.name}>
					<Flow
						d={`M${String(cols[i])} 306V410`}
						power={l.mw}
						time={t}
					/>
					<Label x={cols[i]} y={430} anchor="middle">
						{l.name.toUpperCase()}
					</Label>
					<Label x={cols[i]} y={446} anchor="middle" tone="ink">
						{mw(l.mw)}
					</Label>
				</g>
			))}
		</Sheet>
	);
}

export default function Figure() {
	const clock = useClock();
	return (
		<Frame meta={meta} clock={clock}>
			{({ compact }) =>
				compact ? <Compact t={clock.time} /> : <Wide t={clock.time} />
			}
		</Frame>
	);
}
