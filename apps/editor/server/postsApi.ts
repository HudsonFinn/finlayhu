import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

interface Options {
	/** The site's posts folder. */
	postsDir: string;
	/** The file that lists which posts the site publishes. */
	registry: string;
	/** Where review pass results are kept. */
	reviewsFile: string;
}

/** Only plain markdown names, so a request can't reach outside the posts folder. */
const FILE = /^[A-Za-z0-9][A-Za-z0-9-]*\.md$/;

function field(text: string, key: string) {
	const match = new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(
		/^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? ''
	);
	return match?.[1].trim().replace(/^(['"])(.*)\1$/, '$2') ?? '';
}

export function slugify(title: string) {
	return title
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function body(req: IncomingMessage) {
	const chunks: Buffer[] = [];
	for await (const chunk of req) chunks.push(chunk as Buffer);
	return Buffer.concat(chunks).toString('utf8');
}

function send(res: ServerResponse, status: number, data: unknown) {
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(data));
}

async function readReviews(path: string): Promise<unknown[]> {
	if (!existsSync(path)) return [];
	return JSON.parse(await readFile(path, 'utf8')) as unknown[];
}

/** A small JSON API on the dev server: list, read, create and save posts, and keep review results. */
export function postsApi({ postsDir, registry, reviewsFile }: Options): Plugin {
	const handle = async (req: IncomingMessage, res: ServerResponse) => {
		const url = new URL(req.url ?? '/', 'http://localhost');
		const [, , resource, name] = url.pathname.split('/');

		if (resource === 'posts' && !name && req.method === 'GET') {
			const published = await readFile(registry, 'utf8');
			const files = (await readdir(postsDir)).filter((f) => FILE.test(f));
			const posts = await Promise.all(
				files.map(async (file) => {
					const text = await readFile(join(postsDir, file), 'utf8');
					return {
						file,
						title: field(text, 'title') || file,
						created: field(text, 'created'),
						// A post is on the site once the registry imports it; until then it's a draft
						onSite: published.includes(`../posts/${file}?raw`),
					};
				})
			);
			posts.sort((a, b) => b.created.localeCompare(a.created));
			send(res, 200, posts);
			return;
		}

		if (resource === 'posts' && !name && req.method === 'POST') {
			const { title } = JSON.parse(await body(req)) as { title?: string };
			const slug = slugify(title ?? '');
			if (!title || !slug) {
				send(res, 400, { error: 'A post needs a title' });
				return;
			}
			const file = `${slug}.md`;
			if (existsSync(join(postsDir, file))) {
				send(res, 409, { error: `${file} already exists` });
				return;
			}
			const today = new Date().toISOString().slice(0, 10);
			const text = `---\ntitle: '${title.replace(/'/g, '’')}'\ncreated: ${today}\ntags:\n---\n\n`;
			await writeFile(join(postsDir, file), text);
			send(res, 201, { file });
			return;
		}

		if (resource === 'posts' && name) {
			if (!FILE.test(name)) {
				send(res, 400, { error: 'Not a post file name' });
				return;
			}
			const path = join(postsDir, name);
			if (!existsSync(path)) {
				send(res, 404, { error: `No post ${name}` });
				return;
			}
			if (req.method === 'GET') {
				send(res, 200, {
					file: name,
					text: await readFile(path, 'utf8'),
				});
				return;
			}
			if (req.method === 'PUT') {
				const { text } = JSON.parse(await body(req)) as {
					text: string;
				};
				await writeFile(path, text);
				send(res, 200, { file: name });
				return;
			}
		}

		if (resource === 'reviews' && req.method === 'GET') {
			send(res, 200, await readReviews(reviewsFile));
			return;
		}

		if (resource === 'reviews' && req.method === 'POST') {
			const reviews = await readReviews(reviewsFile);
			reviews.push(JSON.parse(await body(req)));
			await writeFile(
				reviewsFile,
				`${JSON.stringify(reviews, null, '\t')}\n`
			);
			send(res, 201, { count: reviews.length });
			return;
		}

		if (resource === 'reviews' && req.method === 'PATCH') {
			const { file, at, left } = JSON.parse(await body(req)) as {
				file: string;
				at: string;
				left: number;
			};
			const reviews = (await readReviews(reviewsFile)) as {
				file: string;
				at: string;
				left?: number;
			}[];
			const record = reviews.find((r) => r.file === file && r.at === at);
			if (!record) {
				send(res, 404, { error: 'No such review' });
				return;
			}
			record.left = left;
			await writeFile(
				reviewsFile,
				`${JSON.stringify(reviews, null, '\t')}\n`
			);
			send(res, 200, record);
			return;
		}

		send(res, 404, { error: 'Not found' });
	};

	return {
		name: 'posts-api',
		configureServer(server) {
			server.middlewares.use('/api', (req, res) => {
				// Mounted at /api, so put the prefix back for the router above
				req.url = `/api${req.url ?? ''}`;
				handle(req, res).catch((error: unknown) => {
					send(res, 500, { error: String(error) });
				});
			});
		},
	};
}
