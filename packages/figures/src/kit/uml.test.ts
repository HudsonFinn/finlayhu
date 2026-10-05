import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { layoutUml, type UmlSpec } from './uml';

const dir = join(import.meta.dir, '..', 'data', 'bn-01');
const spec = (name: string) =>
	JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8')) as UmlSpec;

/** Canvas sizes from boundary-node's tools/model_diagram.py on the same specs. */
const PYTHON: Record<string, [number, number]> = {
	d1: [220, 189],
	d2: [220, 227],
	d3: [220, 284],
	d4: [356, 334],
	d5: [1220, 277],
	d6: [1220, 449],
	d7a: [1220, 449],
	d7b: [1220, 449],
	d7c: [1220, 468],
	d9: [1420, 640],
	gbfs: [1368, 284],
	ltds: [1881, 981],
};

describe('UML layout matches model_diagram.py', () => {
	test('every spec is covered', () => {
		const names = readdirSync(dir).map((f) => f.replace('.json', ''));
		expect(names.sort()).toEqual(Object.keys(PYTHON).sort());
	});

	for (const [name, [w, h]] of Object.entries(PYTHON))
		test(`${name} is ${String(w)}×${String(h)}`, () => {
			const layout = layoutUml(spec(name));
			expect([layout.width, layout.height]).toEqual([w, h]);
		});

	test('groups name the model: boxes, attributes, kinds, lines', () => {
		const { groups } = layoutUml(spec('d9'));
		expect(groups).toContain('box:Thing');
		expect(groups).toContain('attr:Garment.clean');
		expect(groups).toContain('gen:Thing>Place');
		expect(groups).toContain('assoc:Garment-isIn-Place');
	});
});
