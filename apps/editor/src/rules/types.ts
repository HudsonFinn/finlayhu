/** A stretch of the post's body, as character offsets. */
export interface Span {
	start: number;
	end: number;
}

/** Something a rule found, with a note saying why. */
export interface Flag extends Span {
	note: string;
}

export interface Rule {
	id: string;
	title: string;
	/** Shown before the pass: what to hunt for. */
	lookFor: string;
	/** Why it matters, in a sentence or two. */
	why: string;
	/** One before-and-after, ideally from a real post. */
	example: { before: string; after: string };
	/** Finds the problems in the post's body. Rules without one need judgment (Claude, in v2). */
	check?: (body: string) => Flag[];
}
