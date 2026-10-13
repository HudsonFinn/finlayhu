import type { Span } from './types';

const blank = (text: string) => text.replace(/[^\n]/g, ' ');

/**
 * The body with everything that isn't prose blanked to spaces: headings, code, rules, link
 * addresses and markdown syntax. Offsets still line up with the body, so flags land in the
 * right place.
 */
export function proseOnly(body: string): string {
	let inFence = false;
	return body
		.split('\n')
		.map((line) => {
			if (/^\s*(```|~~~)/.test(line)) {
				inFence = !inFence;
				return blank(line);
			}
			if (
				inFence ||
				/^\s*#/.test(line) ||
				/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
				// A line that is only a link, like "[Goodreads](…)"
				/^\s*\[[^\]]*\]\([^)]*\)\s*$/.test(line)
			)
				return blank(line);
			return (
				line
					// Images, then link addresses (keeping the link text)
					.replace(/!\[[^\]]*\]\([^)]*\)/g, blank)
					.replace(/\]\([^)]*\)/g, blank)
					.replace(/\[(?!\[)/g, ' ')
					// Wiki links: keep the alias, or the name
					.replace(/\[\[([^\]|]*\|)?/g, blank)
					.replace(/\]\]/g, '  ')
					.replace(/`[^`]*`/g, blank)
					// Quote and list markers
					.replace(/^(\s*)(>\s?|[-*+]\s|\d+\.\s)/, (m) => blank(m))
			);
		})
		.join('\n');
}

export interface Sentence extends Span {
	text: string;
}

/** The sentences in the body's prose. Lines break sentences too, so list items stand alone. */
export function sentences(body: string): Sentence[] {
	const prose = proseOnly(body);
	const found: Sentence[] = [];
	const pattern = /[^.!?\n]+(?:[.!?]+["'”’)]*|(?=\n)|$)/g;
	for (const match of prose.matchAll(pattern)) {
		const raw = match[0];
		const lead = raw.length - raw.trimStart().length;
		const text = raw.trim();
		if (!/[A-Za-z]/.test(text)) continue;
		const start = match.index + lead;
		found.push({ start, end: start + text.length, text });
	}
	return found;
}

export const words = (text: string) => text.match(/[A-Za-z0-9’'-]+/g) ?? [];
