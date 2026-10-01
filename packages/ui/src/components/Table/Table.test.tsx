import { describe, expect, mock, test } from 'bun:test';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { SortDescriptor } from 'react-aria-components';
import { Cell, Column, Row, Table, TableBody, TableHeader } from './Table';

const posts = [
	{ id: 'a', title: 'Why Qin?', year: 2025 },
	{ id: 'b', title: 'January 2026 Review', year: 2026 },
];

function SortableTable() {
	const [sort, setSort] = useState<SortDescriptor>({
		column: 'title',
		direction: 'ascending',
	});
	const sorted = [...posts].sort((a, b) => {
		const order = a.title.localeCompare(b.title);
		return sort.direction === 'descending' ? -order : order;
	});
	return (
		<Table aria-label="Posts" sortDescriptor={sort} onSortChange={setSort}>
			<TableHeader>
				<Column id="title" isRowHeader allowsSorting>
					Title
				</Column>
				<Column id="year">Year</Column>
			</TableHeader>
			<TableBody items={sorted}>
				{(post) => (
					<Row id={post.id}>
						<Cell>{post.title}</Cell>
						<Cell numeric>{post.year}</Cell>
					</Row>
				)}
			</TableBody>
		</Table>
	);
}

const firstRowTitle = () =>
	within(screen.getAllByRole('row')[1]).getAllByRole('rowheader')[0]
		.textContent;

describe('Table', () => {
	test('renders a named grid with a row header column', () => {
		render(<SortableTable />);
		expect(screen.getByRole('grid', { name: 'Posts' })).toBeTruthy();
		expect(screen.getAllByRole('rowheader')).toHaveLength(2);
	});

	test('sorts when a sortable column is pressed', async () => {
		render(<SortableTable />);
		expect(firstRowTitle()).toBe('January 2026 Review');
		await userEvent.click(
			screen.getByRole('columnheader', { name: /Title/ })
		);
		expect(firstRowTitle()).toBe('Why Qin?');
		expect(
			screen
				.getByRole('columnheader', { name: /Title/ })
				.getAttribute('aria-sort')
		).toBe('descending');
	});

	test('multiple selection adds checkboxes and reports the selection', async () => {
		const onSelectionChange = mock();
		render(
			<Table
				aria-label="Posts"
				selectionMode="multiple"
				onSelectionChange={onSelectionChange}
			>
				<TableHeader>
					<Column isRowHeader>Title</Column>
				</TableHeader>
				<TableBody items={posts}>
					{(post) => (
						<Row id={post.id}>
							<Cell>{post.title}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		);
		const boxes = screen.getAllByRole('checkbox');
		expect(boxes).toHaveLength(3); // select all + one per row
		await userEvent.click(boxes[1]);
		const selection = onSelectionChange.mock.calls[0]?.[0] as Set<string>;
		expect([...selection]).toEqual(['a']);
	});

	test('shows the empty state when there are no rows', () => {
		render(
			<Table aria-label="Posts">
				<TableHeader>
					<Column isRowHeader>Title</Column>
				</TableHeader>
				<TableBody renderEmptyState={() => 'No posts yet'}>
					{[]}
				</TableBody>
			</Table>
		);
		expect(screen.getByText('No posts yet')).toBeTruthy();
	});
});
