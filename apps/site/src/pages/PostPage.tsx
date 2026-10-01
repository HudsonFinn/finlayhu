import { useParams, Link } from 'react-router-dom';
import { H1, Small } from 'chalkboard-ui';
import { getPostBySlug } from '../data/posts';
import BlogPost from '../components/BlogPost/BlogPost';
import NotFoundPage from './NotFoundPage';

function PostPage() {
	const { slug } = useParams<{ slug: string }>();
	const post = slug ? getPostBySlug(slug) : undefined;

	if (!post) {
		return <NotFoundPage />;
	}

	const formattedDate = post.created.toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<div className="flex flex-col max-w-3xl mx-auto px-4 py-8">
			<Link
				to="/vault"
				className="text-chalkboard-primary hover:text-chalkboard-primary/80 mb-6"
			>
				← Back to Vault
			</Link>
			<header className="mb-8">
				<H1>{post.title}</H1>
				<Small className="text-chalkboard-foreground/60 mt-2">
					{formattedDate}
				</Small>
			</header>
			<BlogPost content={post.content} />
		</div>
	);
}

export default PostPage;
