import { CodeBlock, Heading, Link, Prose, Text, TitleBlock } from '@fhudson/ui';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { getPostBySlug, posts } from '../../data/posts';
import OpenCircuitPage from '../faults/OpenCircuitPage';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/** About 230 words a minute. */
/** The text inside a Markdown node's children. */
const textOf = (children: ReactNode): string =>
	typeof children === 'string'
		? children
		: Array.isArray(children)
			? children.map(textOf).join('')
			: '';

const readingTime = (text: string) =>
	Math.max(1, Math.round(text.split(/\s+/).length / 230));

/** One post: Markdown through Prose, metadata in a title block, and links to its neighbours. */
function LogEntryPage() {
	const { slug } = useParams<{ slug: string }>();
	const post = slug ? getPostBySlug(slug) : undefined;
	if (!post) return <OpenCircuitPage />;

	// posts is newest first
	const index = posts.indexOf(post);
	const newer = posts[index - 1] as (typeof posts)[number] | undefined;
	const older = posts[index + 1] as (typeof posts)[number] | undefined;

	return (
		<article className="flex flex-col gap-8">
			<header className="flex flex-col gap-4">
				<Link href="/vault" variant="standalone">
					← Log
				</Link>
				<Text variant="label">{`Log entry ${String(posts.length - index).padStart(3, '0')}`}</Text>
				{/* Post titles are sentences, too long for the display face */}
				<Heading
					level={1}
					className="font-body text-h2 font-semibold normal-case tracking-normal"
				>
					{post.title}
				</Heading>
				<TitleBlock
					fields={[
						{
							label: 'Date',
							value: dateFormat.format(post.created),
						},
						{ label: 'Tags', value: post.tags.join(', ') || '–' },
						{
							label: 'Reading time',
							value: `${String(readingTime(post.content))} min`,
						},
						{
							label: 'Entry',
							value: String(posts.length - index).padStart(
								3,
								'0'
							),
						},
					]}
				/>
			</header>
			{/* Full width, so the text lines up with the title block above it */}
			<Prose className="max-w-none">
				<ReactMarkdown
					components={{
						// Fenced code goes through CodeBlock for highlighting; inline code stays as <code>
						pre: ({ children }) => <>{children}</>,
						code: ({ className, children }) => {
							const language = /language-(\w+)/.exec(
								className ?? ''
							)?.[1];
							const text = textOf(children);
							return language || text.includes('\n') ? (
								<CodeBlock language={language}>
									{text}
								</CodeBlock>
							) : (
								<code>{children}</code>
							);
						},
					}}
				>
					{post.content}
				</ReactMarkdown>
			</Prose>
			<nav
				aria-label="More entries"
				className="grid gap-4 border-t border-ink pt-6 sm:grid-cols-2"
			>
				{older ? (
					<Link
						href={`/vault/${older.slug}`}
						variant="standalone"
						className="flex-col items-start gap-1 normal-case tracking-normal"
					>
						<span className="font-data text-label uppercase tracking-widest text-ink-muted">
							← Older
						</span>
						<span className="font-body text-ui font-semibold">
							{older.title}
						</span>
					</Link>
				) : (
					<span />
				)}
				{newer && (
					<Link
						href={`/vault/${newer.slug}`}
						variant="standalone"
						className="flex-col items-start gap-1 normal-case tracking-normal sm:items-end sm:text-right"
					>
						<span className="font-data text-label uppercase tracking-widest text-ink-muted">
							Newer →
						</span>
						<span className="font-body text-ui font-semibold">
							{newer.title}
						</span>
					</Link>
				)}
			</nav>
		</article>
	);
}

export default LogEntryPage;
