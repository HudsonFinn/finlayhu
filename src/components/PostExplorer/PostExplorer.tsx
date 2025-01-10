import { Post } from '../Vault/Vault';

type PostExplorerProps = {
	posts: Post[];
	activePost: Post;
	setActivePost: (post: Post) => void;
};

function PostExplorer({ posts, activePost, setActivePost }: PostExplorerProps) {
	return (
		<div>
			<h3>Posts</h3>
			<hr />
			{posts.map((post) => (
				<div key={post.title}>
					<div
						onClick={() => {
							setActivePost(post);
						}}
						style={{
							cursor: 'pointer',
						}}
					>
						<p>
							{activePost.title === post.title
								? post.title + ' <'
								: post.title}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

export default PostExplorer;
