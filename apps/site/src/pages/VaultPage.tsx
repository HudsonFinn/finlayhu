import { Link } from 'react-router-dom';
import {
	H1,
	H2,
	Preview,
	PreviewHeader,
	PreviewDescription,
	PreviewContent,
	Tag,
	Table,
	TableColumn,
} from 'chalkboard-ui';
import { posts, Post } from '../data/posts';

const recentPosts = posts.slice(0, 2);

const columns: TableColumn<Post & { key: string }>[] = [
	{ title: 'Title', dataIndex: 'title', key: 'title' },
	{
		title: 'Date',
		key: 'date',
		render: (_, record) =>
			record.created.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}),
	},
	{
		title: 'Tags',
		key: 'tags',
		render: (_, record) => (
			<div className="flex gap-1 flex-wrap">
				{record.tags.map((tag) => (
					<Tag key={tag}>{tag}</Tag>
				))}
			</div>
		),
	},
	{
		title: '',
		key: 'action',
		render: (_, record) => (
			<Link
				to={`/vault/${record.slug}`}
				className="text-accent hover:underline"
			>
				Read
			</Link>
		),
	},
];

const tableData = posts.map((post) => ({ ...post, key: post.slug }));

function VaultPage() {
	return (
		<div className="flex flex-col max-w-4xl mx-auto px-4 py-8">
			<H1>Vault</H1>

			<div className="h-8" />

			<H2 className="mb-4">Recent</H2>
			<div className="grid gap-4 md:grid-cols-2 mb-8">
				{recentPosts.map((post) => {
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

			<H2 className="mb-4">All Posts</H2>
			<Table columns={columns} dataSource={tableData} />
		</div>
	);
}

export default VaultPage;
