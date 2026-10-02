import {
	Cell,
	Chip,
	ChipGroup,
	Column,
	EmptyState,
	Panel,
	PanelBody,
	PanelHeader,
	Row,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
	Tag,
	type Key,
	type SortDescriptor,
} from '@fhudson/ui';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../controlRoom/PageHeader';
import { posts } from '../../data/posts';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});
const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

/** Every post: filter by tag, sort by title or date, open a row to read it. */
function LogPage() {
	const [sort, setSort] = useState<SortDescriptor>({
		column: 'date',
		direction: 'descending',
	});
	const [tags, setTags] = useState<Set<Key>>(new Set());

	const rows = useMemo(() => {
		const filtered =
			tags.size === 0
				? posts
				: posts.filter((p) => p.tags.some((t) => tags.has(t)));
		return [...filtered].sort((a, b) => {
			const order =
				sort.column === 'title'
					? a.title.localeCompare(b.title)
					: a.created.getTime() - b.created.getTime();
			return sort.direction === 'descending' ? -order : order;
		});
	}, [sort, tags]);

	return (
		<>
			<PageHeader panel="PNL 01 · Log" title="Log">
				Writing and notes: reviews, principles and essays.
			</PageHeader>
			<Panel>
				<PanelHeader
					label="Entries"
					meta={`${String(rows.length)} of ${String(posts.length)}`}
				/>
				<PanelBody className="gap-4">
					<ChipGroup
						aria-label="Filter by tag"
						selectedKeys={tags}
						onSelectionChange={setTags}
					>
						{allTags.map((tag) => (
							<Chip key={tag} id={tag}>
								{tag}
							</Chip>
						))}
					</ChipGroup>
					<TableContainer>
						<Table
							aria-label="Log entries"
							sortDescriptor={sort}
							onSortChange={setSort}
						>
							<TableHeader>
								<Column id="title" isRowHeader allowsSorting>
									Title
								</Column>
								<Column id="date" allowsSorting>
									Date
								</Column>
								<Column id="tags">Tags</Column>
							</TableHeader>
							<TableBody
								items={rows}
								renderEmptyState={() => (
									<EmptyState
										title="No entries with those tags"
										description="Clear a tag to see more."
									/>
								)}
							>
								{(post) => (
									<Row
										id={post.slug}
										href={`/vault/${post.slug}`}
									>
										<Cell className="font-semibold">
											{post.title}
										</Cell>
										<Cell className="font-data text-small whitespace-nowrap text-ink-muted">
											{dateFormat.format(post.created)}
										</Cell>
										<Cell>
											<span className="flex flex-wrap gap-1">
												{post.tags.map((tag) => (
													<Tag key={tag}>{tag}</Tag>
												))}
											</span>
										</Cell>
									</Row>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</PanelBody>
			</Panel>
		</>
	);
}

export default LogPage;
