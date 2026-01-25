import ReactMarkdown from 'react-markdown';
import {
	H1,
	H2,
	H3,
	H4,
	H5,
	H6,
	P,
	Blockquote,
	Code,
	Pre,
} from 'chalkboard-ui';

type BlogPostProps = {
	content: string;
};

function BlogPost({ content }: BlogPostProps) {
	return (
		<section>
			<article className="blog-section">
				<ReactMarkdown
					components={{
						h1: ({ children }) => <H1>{children}</H1>,
						h2: ({ children }) => (
							<H2 className="mt-8 mb-4">{children}</H2>
						),
						h3: ({ children }) => (
							<H3 className="mt-6 mb-3">{children}</H3>
						),
						h4: ({ children }) => (
							<H4 className="mt-4 mb-2">{children}</H4>
						),
						h5: ({ children }) => (
							<H5 className="mt-4 mb-2">{children}</H5>
						),
						h6: ({ children }) => (
							<H6 className="mt-4 mb-2">{children}</H6>
						),
						p: ({ children }) => <P className="mb-4">{children}</P>,
						blockquote: ({ children }) => (
							<Blockquote>{children}</Blockquote>
						),
						code: ({ children, className }) => {
							const isBlock = className?.includes('language-');
							if (isBlock) {
								return <Pre>{children}</Pre>;
							}
							return <Code>{children}</Code>;
						},
						pre: ({ children }) => <>{children}</>,
						a: ({ href, children }) => (
							<a
								href={href}
								className="text-chalkboard-primary underline hover:text-chalkboard-primary/80"
							>
								{children}
							</a>
						),
						ul: ({ children }) => (
							<ul className="list-disc list-inside mb-4 text-chalkboard-foreground">
								{children}
							</ul>
						),
						ol: ({ children }) => (
							<ol className="list-decimal list-inside mb-4 text-chalkboard-foreground">
								{children}
							</ol>
						),
						li: ({ children }) => (
							<li className="mb-1">{children}</li>
						),
						hr: () => (
							<hr className="my-8 border-chalkboard-foreground/20" />
						),
						strong: ({ children }) => (
							<strong className="font-bold">{children}</strong>
						),
						em: ({ children }) => (
							<em className="italic">{children}</em>
						),
					}}
				>
					{content}
				</ReactMarkdown>
			</article>
		</section>
	);
}

export default BlogPost;
