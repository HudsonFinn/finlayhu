import { ruleById, type Span } from './rules';

export type Stage = 'brief' | 'marking' | 'compare' | 'fixing' | 'done';

/** How one pass went. */
export interface PassResult {
	rule: string;
	/** When the comparison was recorded; identifies its review record. */
	at: string;
	both: number;
	ruleOnly: number;
	youOnly: number;
	/** Flags still there when you moved on. Unset until you do. */
	left?: number;
}

/** A review in progress on one post: a run of passes, and where you are in it. */
export interface Session {
	queue: string[];
	index: number;
	stage: Stage;
	marks: Span[];
	/** The body your marks were made on. If it has changed since, the marks are stale. */
	markedBody?: string;
	results: PassResult[];
}

export const startSession = (queue: string[]): Session => ({
	queue,
	index: 0,
	stage: 'brief',
	marks: [],
	results: [],
});

/** Moves to the next pass, or to the summary after the last. */
export const nextPass = (session: Session): Session =>
	session.index + 1 < session.queue.length
		? {
				...session,
				index: session.index + 1,
				stage: 'brief',
				marks: [],
				markedBody: undefined,
			}
		: { ...session, stage: 'done', marks: [], markedBody: undefined };

/**
 * Makes a saved session safe to resume against the post as it is now: drops unknown rules, and
 * restarts a pass whose marks were made on different text.
 */
export function resume(session: Session, body: string): Session | null {
	const queue = session.queue.filter((id) => ruleById(id));
	if (queue.length === 0) return null;
	const index = Math.min(session.index, queue.length - 1);
	const stale =
		(session.stage === 'marking' || session.stage === 'compare') &&
		session.markedBody !== body;
	return stale
		? {
				...session,
				queue,
				index,
				stage: 'brief',
				marks: [],
				markedBody: undefined,
			}
		: { ...session, queue, index };
}

const key = (file: string) => `editor-session:${file}`;

export function loadSession(file: string): Session | null {
	try {
		const raw = localStorage.getItem(key(file));
		return raw ? (JSON.parse(raw) as Session) : null;
	} catch {
		return null;
	}
}

export function storeSession(file: string, session: Session | null) {
	try {
		if (session) localStorage.setItem(key(file), JSON.stringify(session));
		else localStorage.removeItem(key(file));
	} catch {
		// Storage can be blocked; the review still works, it just won't resume
	}
}
