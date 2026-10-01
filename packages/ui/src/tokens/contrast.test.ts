import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { contrastPairs, contrastRatio } from './index';

const css = readFileSync(
	new URL('../styles/tokens.css', import.meta.url),
	'utf8'
);

function readBlock(selector: string): Record<string, string> {
	const start = css.indexOf(selector);
	const body = css.slice(
		css.indexOf('{', start) + 1,
		css.indexOf('}', start)
	);
	const values: Record<string, string> = {};
	for (const [, name, value] of body.matchAll(
		/--sl-([a-z-]+):\s*(#[0-9a-f]{6})/gi
	)) {
		values[name] = value;
	}
	return values;
}

const themes = {
	light: readBlock(':root {'),
	dark: readBlock(":root[data-theme='dark']"),
};

describe.each(Object.entries(themes))('%s theme', (_, colors) => {
	test.each(contrastPairs)(
		'$fg on $bg ($use) meets $min:1',
		({ fg, bg, min }) => {
			expect(colors[fg]).toBeDefined();
			expect(colors[bg]).toBeDefined();
			expect(
				contrastRatio(colors[fg], colors[bg])
			).toBeGreaterThanOrEqual(min);
		}
	);
});

test('the system-preference dark block matches the data-theme dark block', () => {
	expect(readBlock(":root:not([data-theme='light'])")).toEqual(themes.dark);
});
