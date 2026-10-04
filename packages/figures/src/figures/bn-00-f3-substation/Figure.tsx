import { Frame } from '../../kit/Frame';
import { box, segments, type Point } from '../../kit/geometry';
import { IsoCanvas } from '../../kit/three';
import { useClock } from '../../kit/useClock';
import { meta } from './meta';

/* A 33/11 kV substation: single-line symbols, extruded. */

const BAYS = [-3, 0, 3];
const BUS_Y = 3;
/** One turn per loop (40 s): slow enough to read, constant so it never swoops. */
const TURN = (2 * Math.PI) / (meta.loop ?? 40000);

const wires = segments([
	// Busbar down to each bay's breaker, and the cable out
	...BAYS.flatMap((x): Point[][] => [
		[
			[x, BUS_Y, 0],
			[x, BUS_Y, 1.6],
			[x, 0.8, 1.6],
		],
		[
			[x, 0.45, 1.95],
			[x, 0.45, 5.5],
		],
	]),
	// Transformer up to the busbar
	[
		[0, 1.75, -2.6],
		[0, BUS_Y, -2.6],
		[0, BUS_Y, 0],
	],
	// The incoming 33 kV circuit
	[
		[0, 2.2, -6],
		[0, 2.2, -3.6],
		[0, 1.2, -3.2],
	],
]);

const busbar = box(10.4, 0.14, 0.14);
const post = box(0.16, BUS_Y, 0.16);

export default function Figure() {
	const clock = useClock();

	return (
		<Frame meta={meta} clock={clock}>
			<IsoCanvas
				alt={meta.alt}
				span={19}
				lift={1.2}
				angle={Math.PI / 12 + clock.time * TURN}
				scene={({ c, ground, lines, solid, breaker, transformer }) => [
					ground(14),
					lines(wires),
					solid(busbar, [0, BUS_Y - 0.07, 0], { edge: c.verdigris }),
					solid(post, [-5.2, 0, 0]),
					solid(post, [5.2, 0, 0]),
					...BAYS.map((x) => breaker([x, 0, 1.6])),
					transformer([0, 0, -2.6]),
				]}
			/>
		</Frame>
	);
}
