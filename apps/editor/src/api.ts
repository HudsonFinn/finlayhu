/** The dev server's posts API (see server/postsApi.ts). */

export interface PostSummary {
	file: string;
	title: string;
	created: string;
	/** False for a draft: the site doesn't import it yet. */
	onSite: boolean;
}

/** One finished review pass. */
export interface ReviewRecord {
	file: string;
	rule: string;
	at: string;
	both: number;
	ruleOnly: number;
	youOnly: number;
	/** Flags still there when you moved on from fixing. */
	left?: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`/api/${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json' },
	});
	const data = (await response.json()) as T & { error?: string };
	if (!response.ok) throw new Error(data.error ?? response.statusText);
	return data;
}

export const listPosts = () => request<PostSummary[]>('posts');

export const readPost = (file: string) =>
	request<{ file: string; text: string }>(`posts/${file}`).then(
		(p) => p.text
	);

export const savePost = (file: string, text: string) =>
	request(`posts/${file}`, { method: 'PUT', body: JSON.stringify({ text }) });

export const createPost = (title: string) =>
	request<{ file: string }>('posts', {
		method: 'POST',
		body: JSON.stringify({ title }),
	}).then((p) => p.file);

export const listReviews = () => request<ReviewRecord[]>('reviews');

export const saveReview = (record: ReviewRecord) =>
	request('reviews', { method: 'POST', body: JSON.stringify(record) });

/** Records how many flags were left after fixing, on the pass recorded at `at`. */
export const finishReview = (file: string, at: string, left: number) =>
	request('reviews', {
		method: 'PATCH',
		body: JSON.stringify({ file, at, left }),
	});
