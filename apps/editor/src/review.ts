import type { Flag, Span } from './rules';

export const overlaps = (a: Span, b: Span) =>
	a.start < b.end && b.start < a.end;

/** Adds a mark, merging it with any it touches, so marks never overlap. */
export function addMark(marks: Span[], mark: Span): Span[] {
	let merged = mark;
	const rest: Span[] = [];
	for (const other of marks) {
		if (other.start <= merged.end && merged.start <= other.end)
			merged = {
				start: Math.min(other.start, merged.start),
				end: Math.max(other.end, merged.end),
			};
		else rest.push(other);
	}
	return [...rest, merged].sort((a, b) => a.start - b.start);
}

/** Removes the mark under a position, if there is one. */
export const removeMarkAt = (marks: Span[], at: number) =>
	marks.filter((mark) => !(mark.start <= at && at < mark.end));

export interface Comparison {
	/** Flags you found too. */
	both: Flag[];
	/** Flags you didn't mark. */
	ruleOnly: Flag[];
	/** Marks the rule didn't flag: a miss by the rule, or a call it can't make. */
	youOnly: Span[];
}

/** A mark counts for a flag when they overlap at all: marking the sentence is enough. */
export function compare(marks: Span[], flags: Flag[]): Comparison {
	return {
		both: flags.filter((f) => marks.some((m) => overlaps(m, f))),
		ruleOnly: flags.filter((f) => !marks.some((m) => overlaps(m, f))),
		youOnly: marks.filter((m) => !flags.some((f) => overlaps(m, f))),
	};
}

export interface Segment extends Span {
	marked: boolean;
	flags: Flag[];
}

/** Cuts the text at every mark and flag boundary, so each piece can be styled on its own. */
export function segments(
	length: number,
	marks: Span[],
	flags: Flag[]
): Segment[] {
	const cuts = new Set([0, length]);
	for (const span of [...marks, ...flags]) {
		cuts.add(Math.max(0, Math.min(length, span.start)));
		cuts.add(Math.max(0, Math.min(length, span.end)));
	}
	const points = [...cuts].sort((a, b) => a - b);
	return points.slice(1).map((end, i) => {
		const piece = { start: points[i], end };
		return {
			...piece,
			marked: marks.some((m) => overlaps(m, piece)),
			flags: flags.filter((f) => overlaps(f, piece)),
		};
	});
}

/** The post's body: everything after the frontmatter. Review passes work on this. */
export function splitFrontmatter(text: string) {
	const match = /^---\n[\s\S]*?\n---\n?/.exec(text);
	const offset = match ? match[0].length : 0;
	return { offset, body: text.slice(offset) };
}

export const wordCount = (text: string) =>
	(splitFrontmatter(text).body.match(/[A-Za-z0-9’'-]+/g) ?? []).length;
