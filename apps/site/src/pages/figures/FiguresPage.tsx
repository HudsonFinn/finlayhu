import { figures, type FigureEntry } from '@fhudson/figures';
import {
	Cell,
	Column,
	Panel,
	PanelBody,
	PanelHeader,
	Row,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
} from '@fhudson/ui';
import { PageHeader } from '../../controlRoom/PageHeader';

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

/** Still, a build that loops, or continuous motion that loops. */
const kind = (f: FigureEntry) =>
	f.duration
		? `Build · ${seconds(f.duration)}`
		: f.loop
			? `Loop · ${seconds(f.loop)}`
			: 'Still';

/** The post a figure belongs to, from its drawing number: BN-03-F2 → 03. */
const postOf = (f: FigureEntry) => f.number.slice(3, 5);

/** fhudson.com/f: every Boundary Node figure, by post. Open a row to see it live. */
function FiguresPage() {
	const posts = [...new Set(figures.map(postOf))].sort().reverse();

	return (
		<>
			<PageHeader panel="PNL 01 · Figures" title="Figures">
				Every figure drawn for Boundary Node, live and interactive.
			</PageHeader>
			{posts.map((post) => {
				const items = figures.filter((f) => postOf(f) === post);
				const label = post === '00' ? 'Identity sheet' : `Post ${post}`;
				return (
					<Panel key={post}>
						<PanelHeader
							label={label}
							meta={`${String(items.length)} ${items.length === 1 ? 'figure' : 'figures'}`}
						/>
						<PanelBody>
							<TableContainer>
								<Table aria-label={`${label} figures`}>
									<TableHeader>
										<Column id="number">Drawing</Column>
										<Column id="title" isRowHeader>
											Figure
										</Column>
										<Column id="kind">Kind</Column>
										<Column id="date">Date</Column>
									</TableHeader>
									<TableBody items={items}>
										{(f) => (
											<Row
												id={f.slug}
												href={`/f/${f.slug}`}
											>
												<Cell className="font-data whitespace-nowrap">
													{f.number}
												</Cell>
												<Cell className="font-semibold">
													{f.title}
												</Cell>
												<Cell className="font-data whitespace-nowrap text-ink-muted">
													{kind(f)}
												</Cell>
												<Cell className="font-data whitespace-nowrap text-ink-muted">
													{f.date}
												</Cell>
											</Row>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</PanelBody>
					</Panel>
				);
			})}
		</>
	);
}

export default FiguresPage;
