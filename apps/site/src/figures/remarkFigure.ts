/*
 * Figures in posts. A paragraph that is exactly
 *
 *     ::figure{slug="bn-03-f2"}
 *
 * becomes <figure data-slug="bn-03-f2">, which LogEntryPage renders as the live figure.
 * Matched by hand rather than with remark-directive, which would also turn ordinary text like
 * "note:this" into directives.
 */

interface MdNode {
	type: string;
	value?: string;
	children?: MdNode[];
	data?: { hName?: string; hProperties?: Record<string, string> };
}

const FIGURE = /^::figure\{slug="([a-z0-9-]+)"\}$/;

function walk(node: MdNode) {
	for (const child of node.children ?? []) {
		const only =
			child.children?.length === 1 ? child.children[0] : undefined;
		const slug =
			child.type === 'paragraph' && only?.type === 'text'
				? FIGURE.exec(only.value?.trim() ?? '')?.[1]
				: undefined;
		if (slug) {
			child.children = [];
			child.data = { hName: 'figure', hProperties: { dataSlug: slug } };
		} else walk(child);
	}
}

export function remarkFigure() {
	return (tree: MdNode) => {
		walk(tree);
	};
}
