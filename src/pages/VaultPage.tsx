import { Link } from 'react-router-dom';
import {
	H1,
	Preview,
	PreviewHeader,
	PreviewDescription,
	PreviewContent,
	Tag,
} from 'chalkboard-ui';
import { posts } from '../data/posts';

function VaultPage() {
	return (
		<div className="flex flex-col max-w-4xl mx-auto px-4 py-8">
			<H1 className="mb-8">Vault</H1>
			<div className="grid gap-4 md:grid-cols-2">
				{posts.map((post) => {
					const formattedDate = post.created.toLocaleDateString(
						'en-GB',
						{
							year: 'numeric',
							month: 'short',
							day: 'numeric',
						}
					);

					return (
						<Preview
							key={post.slug}
							as={Link}
							href={`/vault/${post.slug}`}
						>
							<PreviewHeader title={post.title} />
							<PreviewDescription>
								{formattedDate}
							</PreviewDescription>
							{post.tags.length > 0 && (
								<PreviewContent className="flex gap-2 flex-wrap">
									{post.tags.map((tag) => (
										<Tag key={tag}>{tag}</Tag>
									))}
								</PreviewContent>
							)}
						</Preview>
					);
				})}
			</div>
		</div>
	);
}

export default VaultPage;
