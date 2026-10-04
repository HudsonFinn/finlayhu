/*
 * Building blocks for 3D figures, in plain three.js: drawn, not rendered. Paper faces hide what's
 * behind them; edges are ink (or verdigris for the one thing that matters). Only the classes
 * imported here reach the bundle, which is why the kit doesn't use react-three-fiber.
 */
import {
	BoxGeometry,
	BufferGeometry,
	CylinderGeometry,
	EdgesGeometry,
	Group,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshBasicMaterial,
	Vector3,
	type Object3D,
} from 'three';
import type { TokenColours } from './useTokenColours';

export type Point = [number, number, number];

/** Line pairs from polylines, for one lineSegments draw. */
export function segments(lines: Point[][]) {
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

/** A box, its base sitting on y = 0 so things stack by height. */
export const box = (width: number, height: number, depth: number) =>
	new BoxGeometry(width, height, depth).translate(0, height / 2, 0);

/** An upright prism, base on y = 0. Eight sides: a symbol's circle, extruded, reads as drawn. */
export const prism = (radius: number, height: number, sides = 8) =>
	new CylinderGeometry(radius, radius, height, sides).translate(
		0,
		height / 2,
		0
	);

// The single-line symbols, extruded (see Busbar, Breaker and Transformer in @fhudson/ui)
const BREAKER = box(0.7, 0.7, 0.7);
const BREAKER_PLINTH = box(1.1, 0.1, 1.1);
const WINDING = prism(0.6, 1.6);
const TRANSFORMER_PLINTH = box(2.6, 0.15, 1.8);

/**
 * The drawing tools for one scene, bound to the theme's colours. Everything made here is
 * disposed when the scene is rebuilt (on a theme change) or the canvas goes away; geometry
 * passed in is the figure's own and is left alone.
 */
export function createDraw(c: TokenColours) {
	const owned: { dispose: () => void }[] = [];
	const own = <T extends { dispose: () => void }>(thing: T) => {
		owned.push(thing);
		return thing;
	};
	const line = (color: string) => own(new LineBasicMaterial({ color }));
	// Pushed back slightly, so edges lying on a face always win the depth test
	const face = own(
		new MeshBasicMaterial({
			color: c.paper,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1,
		})
	);
	const ink = line(c.ink);

	const at = (object: Object3D, [x, y, z]: Point) => {
		object.position.set(x, y, z);
		return object;
	};

	/** A solid: paper faces and edges, ink unless `edge` says otherwise. */
	const solid = (
		geometry: BufferGeometry,
		position: Point,
		{ edge }: { edge?: string } = {}
	) => {
		const group = new Group();
		group.add(
			new Mesh(geometry, face),
			new LineSegments(
				own(new EdgesGeometry(geometry, 20)),
				edge ? line(edge) : ink
			)
		);
		return at(group, position);
	};

	/** Lines only: conductors, cables. Ink unless `color` says otherwise. */
	const lines = (geometry: BufferGeometry, color?: string) =>
		new LineSegments(geometry, color ? line(color) : ink);

	/** A square ground grid, one unit to a square, in hairline. */
	const ground = (size: number) => {
		const half = size / 2;
		const ticks = Array.from({ length: size + 1 }, (_, i) => i - half);
		return new LineSegments(
			own(
				segments(
					ticks.flatMap((n): Point[][] => [
						[
							[n, 0, -half],
							[n, 0, half],
						],
						[
							[-half, 0, n],
							[half, 0, n],
						],
					])
				)
			),
			line(c.hairline)
		);
	};

	/** A breaker on its plinth. */
	const breaker = (position: Point) => {
		const group = new Group();
		group.add(
			solid(BREAKER_PLINTH, [0, 0, 0]),
			solid(BREAKER, [0, 0.1, 0])
		);
		return at(group, position);
	};

	/** A two-winding transformer: two overlapping prisms, like the symbol's two circles. */
	const transformer = (position: Point) => {
		const group = new Group();
		group.add(
			solid(TRANSFORMER_PLINTH, [0, 0, 0]),
			solid(WINDING, [-0.45, 0.15, 0]),
			solid(WINDING, [0.45, 0.15, 0])
		);
		return at(group, position);
	};

	return {
		c,
		solid,
		lines,
		ground,
		breaker,
		transformer,
		dispose: () => {
			for (const thing of owned) thing.dispose();
		},
	};
}

export type Draw = ReturnType<typeof createDraw>;
