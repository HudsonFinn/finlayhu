import { Frame } from '../../kit/Frame';
import { Label, Node, Sheet } from '../../kit/Sheet';
import { BEAT, STEP, drawOn, progress, settle } from '../../kit/time';
import { useClock } from '../../kit/useClock';
import { meta } from './meta';

const FEEDERS = [200, 360, 520];
const FEEDER_START = 4400;
const ink = { stroke: 'var(--sl-ink)', fill: 'none', strokeWidth: 1.5 };

export default function Figure() {
	const clock = useClock(meta.duration);
	const t = clock.time;
	const appear = (start: number) => settle(progress(t, start, BEAT));

	return (
		<Frame meta={meta} clock={clock}>
			<Sheet width={720} height={300} label={meta.alt}>
				<path d="M360 20V52" {...ink} {...drawOn(progress(t, 0))} />
				<Label x={372} y={30} opacity={appear(STEP)}>
					132 kV
				</Label>

				<Node x={360} y={62} {...drawOn(progress(t, STEP))} />
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
			</Sheet>
		</Frame>
	);
}
