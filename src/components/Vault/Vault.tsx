import BlogPost from '../BlogPost/BlogPost';
import PostExplorer from '../PostExplorer/PostExplorer';
import post from '../../posts/whyQin.md';
import post2 from '../../posts/Comparison.md';
import { useState } from 'react';

export type Post = {
	title: string;
	date: Date;
	content: string;
};

function Vault() {
	const postList: Post[] = [
		{
			title: 'Why Qin?',
			date: new Date('2021-08-11'),
			content: post,
		},
		{
			title: 'Comparison is the death of connection',
			date: new Date('2021-08-11'),
			content: post2,
		},
	];

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
				<BlogPost file={activePost.content} />
			</main>
		</div>
	);
}

export default Vault;
