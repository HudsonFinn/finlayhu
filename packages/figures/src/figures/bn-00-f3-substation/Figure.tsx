import { BoxGeometry, CylinderGeometry } from 'three';
import { Frame } from '../../kit/Frame';
import { segments, type Point } from '../../kit/geometry';
import { IsoCanvas, Lines, Solid } from '../../kit/three';
import { useClock } from '../../kit/useClock';
import { meta } from './meta';

/* A 33/11 kV substation: single-line symbols, extruded. */

const BAYS = [-3, 0, 3];
const BUS_Y = 3;
/** One turn every 40 seconds: slow enough to read, constant so it never swoops. */
const TURN = (2 * Math.PI) / 40000;

const ground = segments(
	Array.from({ length: 15 }, (_, i) => i - 7).flatMap((n): Point[][] => [
		[
			[n, 0, -7],
			[n, 0, 7],
		],
		[
			[-7, 0, n],
			[7, 0, n],
		],
	])
);

const wires = segments([
	// Busbar down to each bay's breaker, and the cable out
	...BAYS.flatMap((x): Point[][] => [
		[
			[x, BUS_Y, 0],
			[x, BUS_Y, 1.6],
			[x, 0.85, 1.6],
		],
		[
			[x, 0.45, 1.95],
			[x, 0.45, 5.5],
		],
	]),
	// Transformer up to the busbar
	[
		[0, 1.85, -2.6],
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

const busbar = new BoxGeometry(10.4, 0.14, 0.14);
const post = new BoxGeometry(0.16, BUS_Y, 0.16);
const breaker = new BoxGeometry(0.7, 0.7, 0.7);
const breakerPlinth = new BoxGeometry(1.1, 0.1, 1.1);
// Octagonal prisms: a winding is the transformer symbol's circle, extruded
const winding = new CylinderGeometry(0.6, 0.6, 1.6, 8);
const transformerPlinth = new BoxGeometry(2.6, 0.15, 1.8);

export default function Figure() {
	const clock = useClock();
	const angle = Math.PI / 12 + clock.time * TURN;

	return (
		<Frame meta={meta} clock={clock}>
			<IsoCanvas alt={meta.alt} span={19}>
				{(c) => {
					const solid = { edge: c.ink, face: c.paper };
					return (
						<group rotation-y={angle} position={[0, -1.2, 0]}>
							<Lines geometry={ground} color={c.hairline} />
							<Lines geometry={wires} color={c.ink} />
							<Solid
								geometry={busbar}
								position={[0, BUS_Y, 0]}
								edge={c.verdigris}
								face={c.paper}
							/>
							<Solid
								geometry={post}
								position={[-5.2, BUS_Y / 2, 0]}
								{...solid}
							/>
							<Solid
								geometry={post}
								position={[5.2, BUS_Y / 2, 0]}
								{...solid}
							/>
							{BAYS.map((x) => (
								<group key={x}>
									<Solid
										geometry={breakerPlinth}
										position={[x, 0.05, 1.6]}
										{...solid}
									/>
									<Solid
										geometry={breaker}
										position={[x, 0.45, 1.6]}
										{...solid}
									/>
								</group>
							))}
							<Solid
								geometry={transformerPlinth}
								position={[0, 0.075, -2.6]}
								{...solid}
							/>
							<Solid
								geometry={winding}
								position={[-0.45, 0.95, -2.6]}
								{...solid}
							/>
							<Solid
								geometry={winding}
								position={[0.45, 0.95, -2.6]}
								{...solid}
							/>
						</group>
					);
				}}
			</IsoCanvas>
		</Frame>
	);
}
