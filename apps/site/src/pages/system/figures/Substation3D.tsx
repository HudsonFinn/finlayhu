import { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
	BoxGeometry,
	BufferGeometry,
	CylinderGeometry,
	EdgesGeometry,
	Vector3,
} from 'three';
import { useTokenColours } from './kit';

/*
 * A 33/11 kV substation, drawn rather than rendered: an orthographic iso camera, paper faces
 * that hide what's behind them, and ink edges. Single-line symbols, extruded.
 */

type Point = [number, number, number];

/** Line pairs from polylines, for one lineSegments draw. */
function segments(lines: Point[][]) {
	const pairs = lines.flatMap((line) =>
		line
			.slice(1)
			.flatMap((point, i) => [
				new Vector3(...line[i]),
				new Vector3(...point),
			])
	);
	return new BufferGeometry().setFromPoints(pairs);
}

const BAYS = [-3, 0, 3];
const BUS_Y = 3;

const ground = segments(
	Array.from({ length: 15 }, (_, i) => i - 7).flatMap((n) => [
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

function Solid({
	geometry,
	position,
	edge,
	face,
}: {
	geometry: BufferGeometry;
	position: Point;
	edge: string;
	face: string;
}) {
	const edges = useMemo(() => new EdgesGeometry(geometry, 20), [geometry]);
	return (
		<group position={position}>
			<mesh geometry={geometry}>
				{/* Pushed back slightly, so edges on the faces always win the depth test */}
				<meshBasicMaterial
					color={face}
					polygonOffset
					polygonOffsetFactor={1}
					polygonOffsetUnits={1}
				/>
			</mesh>
			<lineSegments geometry={edges}>
				<lineBasicMaterial color={edge} />
			</lineSegments>
		</group>
	);
}

/** Keeps the drawing's scale tied to the canvas width. */
function FitZoom() {
	const { camera, size, invalidate } = useThree();
	useEffect(() => {
		camera.zoom = size.width / 19;
		camera.updateProjectionMatrix();
		invalidate();
	}, [camera, size.width, invalidate]);
	return null;
}

export default function Substation3D({ angle }: { angle: number }) {
	const c = useTokenColours();
	const solid = { edge: c.ink, face: c.paper };

	return (
		<Canvas
			orthographic
			flat
			frameloop="demand"
			dpr={[1, 2]}
			camera={{ position: [10, 10, 10], zoom: 30, near: 0.1, far: 100 }}
		>
			<FitZoom />
			<group rotation-y={angle} position={[0, -1.2, 0]}>
				<lineSegments geometry={ground}>
					<lineBasicMaterial color={c.hairline} />
				</lineSegments>
				<lineSegments geometry={wires}>
					<lineBasicMaterial color={c.ink} />
				</lineSegments>
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
		</Canvas>
	);
}
