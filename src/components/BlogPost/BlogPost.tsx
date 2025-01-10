import { marked } from 'marked';
import { useEffect, useState } from 'react';
import './BlogPost.css';

type BlogPostProps = {
	file: string;
};

function BlogPost({ file }: BlogPostProps) {
	const [markdown, setMarkdown] = useState('');

	useEffect(() => {
		const fetchMarkdown = async () => {
			try {
				const res = await fetch(file);
				const text = await res.text();
				const md = await marked(text);
				setMarkdown(md);
			} catch (error) {
				console.error('Error fetching markdown:', error);
				setMarkdown('Error loading content');
			}
		};
		void fetchMarkdown();
	}, [file]);

	return (
		<section>
			<article
				className="blog-section"
				dangerouslySetInnerHTML={{ __html: markdown }}
			></article>
		</section>
	);
}

export default BlogPost;
