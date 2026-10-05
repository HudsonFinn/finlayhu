/*
 * Blocks in posts. A paragraph that is exactly one of
 *
 *     ::figure{slug="bn-03-f2" caption="…"}
 *     ::table{src="wardrobe/05-socks" title="Socks" sort="none"}
 *
 * becomes <figure data-block="figure|table" data-…>, which LogEntryPage renders as a live
 * figure or a table from a CSV in src/posts/tables. Matched by hand rather than with
 * remark-directive, which would also turn ordinary text like "note:this" into directives.
 */

interface MdNode {
	type: string;
	value?: string;
	children?: MdNode[];
	data?: { hName?: string; hProperties?: Record<string, string> };
}

const BLOCK = /^::(figure|table)\{(.*)\}$/;
const ATTR = /(\w+)="([^"]*)"/g;

/** `slug="x" caption="y"` → { dataSlug: 'x', dataCaption: 'y' } */
const attributes = (source: string) =>
	Object.fromEntries(
		[...source.matchAll(ATTR)].map(([, key, value]) => [
			`data${key[0].toUpperCase()}${key.slice(1)}`,
			value,
		])
	);

function walk(node: MdNode) {
	for (const child of node.children ?? []) {
		const only =
			child.children?.length === 1 ? child.children[0] : undefined;
		const match =
			child.type === 'paragraph' && only?.type === 'text'
				? BLOCK.exec(only.value?.trim() ?? '')
				: null;
		if (match) {
			child.children = [];
			child.data = {
				hName: 'figure',
				hProperties: { dataBlock: match[1], ...attributes(match[2]) },
			};
		} else walk(child);
	}
}

export function remarkBlocks() {
	return (tree: MdNode) => {
		walk(tree);
	};
}
