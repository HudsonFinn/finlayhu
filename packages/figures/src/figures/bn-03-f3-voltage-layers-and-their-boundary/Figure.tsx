import { Frame } from '../../kit/Frame';
import { prism, segments, type Point } from '../../kit/geometry';
import { IsoCanvas, type IsoLabel } from '../../kit/three';
import { meta } from './meta';

/* Four voltage layers as stacked plates; transformers join them; grid supply points are the
   boundary nodes between transmission and distribution. Networks are schematic. */

const GAP = 2.4;
const HALF = 3.5;

type Plan = [number, number][];

interface Layer {
	kv: string;
	part: 'TRANSMISSION' | 'DISTRIBUTION';
	y: number;
	network: Plan[];
}

const LAYERS: Layer[] = [
	{
		kv: '400 kV',
		part: 'TRANSMISSION',
		y: 3 * GAP,
		network: [
			[
				[-2.5, -2.5],
				[2.5, -2.5],
				[2.5, 2.5],
				[-2.5, 2.5],
				[-2.5, -2.5],
			],
		],
	},
	{
		kv: '275 kV',
		part: 'TRANSMISSION',
		y: 2 * GAP,
		network: [
			[
				[-2.5, -1],
				[2.5, -1],
			],
			[
				[-1, -1],
				[-1, 2.5],
			],
			[
				[1.5, -1],
				[1.5, 2],
			],
		],
	},
	{
		kv: '132 kV',
		part: 'DISTRIBUTION',
		y: GAP,
		network: [
			[
				[-1, 1.5],
				[-1, -2.5],
				[1.5, -2.5],
				[1.5, 1],
			],
			[
				[-1, -0.5],
				[-2.8, -0.5],
			],
			[
				[1.5, -0.5],
				[2.8, -0.5],
			],
		],
	},
	{
		kv: '33 kV',
		part: 'DISTRIBUTION',
		y: 0,
		network: [
			[
				[-2, -3],
				[-2, 2.8],
			],
			[
				[-2, 1],
				[-3, 1],
			],
			[
				[-2, 2],
				[0, 2],
			],
			[
				[2.2, -3],
				[2.2, 2.8],
			],
			[
				[2.2, 1.2],
				[0.5, 1.2],
			],
			[
				[2.2, -2],
				[3, -2],
			],
		],
	},
];

/** Transformers between layers, as [x, z] and the two heights they join. */
const TRANSFORMERS: [number, number, number, number][] = [
	[-2.5, -1, 3 * GAP, 2 * GAP],
	[2.5, -1, 3 * GAP, 2 * GAP],
	[-2, -0.5, GAP, 0],
	[2.2, -0.5, GAP, 0],
];
/** Grid supply points: where transmission (275 kV) meets distribution (132 kV). */
const GSPS: [number, number][] = [
	[-1, 1.5],
	[1.5, 1],
];

const lift = (plan: Plan, y: number): Point[] =>
	plan.map(([x, z]) => [x, y, z]);
const outline = (y: number): Point[] => [
	[-HALF, y, -HALF],
	[HALF, y, -HALF],
	[HALF, y, HALF],
	[-HALF, y, HALF],
	[-HALF, y, -HALF],
];

const plates = segments(LAYERS.map((l) => outline(l.y)));
const networks = segments(
	LAYERS.flatMap((l) => l.network.map((p) => lift(p, l.y)))
);
const links = segments(
	TRANSFORMERS.map(([x, z, top, bottom]): Point[] => [
		[x, top, z],
		[x, bottom, z],
	])
);
const supply = segments(
	GSPS.map(([x, z]): Point[] => [
		[x, 2 * GAP, z],
		[x, GAP, z],
	])
);
const node = prism(0.2, 0.3);

/*
 * A still, in true isometric: a stack reads best from one place, and labels stay put. Layer
 * voltages on the right-hand corners; down the left, what each gap is.
 */
const right = (y: number): Point => [HALF + 0.3, y, -HALF - 0.3];
const left = (y: number): Point => [-HALF - 0.3, y, HALF + 0.3];

const labelsFor = (compact: boolean): IsoLabel[] => [
	...LAYERS.map(
		(l): IsoLabel => ({ at: right(l.y), text: l.kv, tone: 'ink' })
	),
	{ at: left(2.5 * GAP), text: 'TRANSMISSION', anchor: 'end' },
	{
		at: left(1.5 * GAP),
		text: compact ? 'GSPs' : 'GRID SUPPLY POINTS',
		tone: 'verdigris',
		anchor: 'end',
	},
	{ at: left(0.5 * GAP), text: 'DISTRIBUTION', anchor: 'end' },
];

export default function Figure() {
	return (
		<Frame meta={meta}>
			{({ compact }) => (
				<IsoCanvas
					alt={meta.alt}
					span={compact ? 24 : 19}
					aspect={compact ? 1.5 : 1.3}
					lift={1.5 * GAP}
					labels={labelsFor(compact)}
					scene={({ c, lines, solid }) => [
						lines(plates, c.hairline),
						lines(networks),
						lines(links),
						lines(supply, c.verdigris),
						...GSPS.map(([x, z]) =>
							solid(node, [x, GAP - 0.15, z], {
								edge: c.verdigris,
							})
						),
					]}
				/>
			)}
		</Frame>
	);
}
