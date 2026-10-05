import { useEffect, useMemo, useState } from 'react';
import {
	Cell,
	Column,
	Row,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
	Text,
	type SortDescriptor,
} from '@fhudson/ui';
import { parseCsv } from './csv';

/*
 * A table in a post, from `::table{src="wardrobe/05-socks" title="Socks" sort="none"}`. The
 * CSV lives in src/posts/tables and loads with the post. Sortable by any column unless
 * sort="none" (for tables whose row order carries meaning).
 */

const tables = import.meta.glob<string>('../posts/tables/**/*.csv', {
	query: '?raw',
	import: 'default',
});

const collator = new Intl.Collator('en-GB', { numeric: true });

export function PostTable({
	src,
	title,
	sort,
}: {
	src: string;
	title?: string;
	sort?: string;
}) {
	const load = tables[`../posts/tables/${src}.csv`] as
		| (() => Promise<string>)
		| undefined;
	const [csv, setCsv] = useState<string[][] | null>(null);
	const [order, setOrder] = useState<SortDescriptor | undefined>();
	const sortable = sort !== 'none';

	useEffect(() => {
		let live = true;
		void load?.().then((text) => {
			if (live) setCsv(parseCsv(text));
		});
		return () => {
			live = false;
		};
	}, [load]);

	const rows = useMemo(() => {
		const body = (csv ?? []).slice(1).map((cells, i) => ({ i, cells }));
		if (!order || !csv) return body;
		const col = csv[0].indexOf(String(order.column));
		const sorted = [...body].sort((a, b) =>
			collator.compare(a.cells[col] ?? '', b.cells[col] ?? '')
		);
		return order.direction === 'descending' ? sorted.reverse() : sorted;
	}, [csv, order]);

	if (!load)
		return (
			<p className="border-[1.5px] border-fault p-3 font-data text-small text-fault">
				No table at src/posts/tables/{src}.csv
			</p>
		);
	if (!csv) return null;
	const [header] = csv;

	return (
		<div data-block="table" className="flex flex-col gap-2">
			{title ? <Text variant="label">{title}</Text> : null}
			<TableContainer className="max-h-[26rem]">
				<Table
					aria-label={title ?? src}
					sortDescriptor={order}
					onSortChange={setOrder}
				>
					<TableHeader>
						{header.map((name, i) => (
							<Column
								key={name}
								id={name}
								isRowHeader={i === 0}
								allowsSorting={sortable}
							>
								{name}
							</Column>
						))}
					</TableHeader>
					<TableBody>
						{rows.map(({ i, cells }) => (
							<Row key={i} id={i}>
								{header.map((name, c) => (
									<Cell key={name} className="font-data">
										{cells[c] ?? ''}
									</Cell>
								))}
							</Row>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
