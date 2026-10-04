import { BufferGeometry, Vector3 } from 'three';

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
