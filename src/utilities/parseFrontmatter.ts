type Frontmatter = {
	title: string;
	created: string;
	updated?: string;
};

type ParsedMarkdown = {
	data: Frontmatter;
	content: string;
};

export function parseFrontmatter(raw: string): ParsedMarkdown {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = raw.match(frontmatterRegex);

	if (!match) {
		return {
			data: { title: 'Untitled', created: '' },
			content: raw,
		};
	}

	const [, frontmatterBlock, content] = match;
	const data: Record<string, string> = {};

	frontmatterBlock.split('\n').forEach((line) => {
		const colonIndex = line.indexOf(':');
		if (colonIndex !== -1) {
			const key = line.slice(0, colonIndex).trim();
			let value = line.slice(colonIndex + 1).trim();
			// Remove quotes if present
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			data[key] = value;
		}
	});

	return {
		data: data as unknown as Frontmatter,
		content: content.trim(),
	};
}
