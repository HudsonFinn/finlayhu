import { parseFrontmatter } from '../utilities/parseFrontmatter';
import whyQinRaw from '../posts/whyQin.md?raw';
import comparisonRaw from '../posts/Comparison.md?raw';
import review2025Raw from '../posts/2025-review.md?raw';
import inThisEconomyRaw from '../posts/In-This-Economy.md?raw';
import jan2026ReviewRaw from '../posts/jan-2026-review.md?raw';

export type Post = {
	slug: string;
	title: string;
	created: Date;
	tags: string[];
	content: string;
};

function parsePost(raw: string, slug: string): Post {
	const { data, content } = parseFrontmatter(raw);
	const tags = data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [];
	return {
		slug,
		title: data.title,
		created: new Date(data.created),
		tags,
		content,
	};
}

export const posts: Post[] = [
	parsePost(whyQinRaw, 'why-qin'),
	parsePost(comparisonRaw, 'comparison'),
	parsePost(review2025Raw, '2025-review'),
	parsePost(inThisEconomyRaw, 'in-this-economy'),
	parsePost(jan2026ReviewRaw, 'jan-2026-review'),
].sort((a, b) => b.created.getTime() - a.created.getTime());

export function getPostBySlug(slug: string): Post | undefined {
	return posts.find((post) => post.slug === slug);
}
