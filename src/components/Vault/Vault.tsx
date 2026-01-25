import { useState, useMemo } from 'react';
import BlogPost from '../BlogPost/BlogPost';
import PostExplorer from '../PostExplorer/PostExplorer';
import { parseFrontmatter } from '../../utilities/parseFrontmatter';
import whyQinRaw from '../../posts/whyQin.md?raw';
import comparisonRaw from '../../posts/Comparison.md?raw';
import review2025Raw from '../../posts/2025-review.md?raw';
import inThisEconomyRaw from '../../posts/In-This-Economy.md?raw';

export type Post = {
	title: string;
	created: Date;
	content: string;
};

function parsePost(raw: string): Post {
	const { data, content } = parseFrontmatter(raw);
	return {
		title: data.title,
		created: new Date(data.created),
		content,
	};
}

function Vault() {
	const postList = useMemo<Post[]>(() => {
		return [
			parsePost(whyQinRaw),
			parsePost(comparisonRaw),
			parsePost(review2025Raw),
			parsePost(inThisEconomyRaw),
		].sort((a, b) => b.created.getTime() - a.created.getTime());
	}, []);

	const [activePost, setActivePost] = useState(postList[0]);

	return (
		<div style={{ display: 'flex', flexWrap: 'wrap' }}>
			<div
				style={{
					flexGrow: 1,
					flexBasis: '50px',
					margin: '10px 20px',
				}}
			>
				<PostExplorer
					posts={postList}
					activePost={activePost}
					setActivePost={setActivePost}
				/>
			</div>
			<main
				style={{
					flexGrow: 1,
					flexBasis: '800px',
					margin: '10px 20px',
				}}
			>
				<BlogPost content={activePost.content} />
			</main>
		</div>
	);
}

export default Vault;
