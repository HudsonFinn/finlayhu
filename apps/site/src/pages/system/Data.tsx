import {
	Button,
	Cell,
	Checkbox,
	CheckboxGroup,
	Column,
	ColumnResizer,
	EmptyState,
	Link,
	List,
	ListItem,
	ResizableTableContainer,
	Row,
	Slider,
	Spinner,
	Stat,
	Status,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
	Tag,
	Text,
	type Selection,
	type SortDescriptor,
} from '@fhudson/ui';
import { useMemo, useState } from 'react';
import { posts } from '../../data/posts';
import { Demo, Example } from './Demo';

// Illustrative only: invented substations in the shape of an LTDS table
const substations = [
	{
		id: 'ALD',
		name: 'Alder Road',
		voltage: '33/11',
		firmMva: 24,
		peakMva: 19.4,
	},
	{
		id: 'BRK',
		name: 'Brook Lane',
		voltage: '33/11',
		firmMva: 15,
		peakMva: 14.8,
	},
	{
		id: 'CRS',
		name: 'Cross Street',
		voltage: '132/33',
		firmMva: 90,
		peakMva: 61.2,
	},
	{
		id: 'DNM',
		name: 'Dunmore',
		voltage: '33/11',
		firmMva: 12,
		peakMva: 12.6,
	},
	{
		id: 'ELM',
		name: 'Elm Park',
		voltage: '33/11',
		firmMva: 20,
		peakMva: 11.3,
	},
];

const dateFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

function PostsTable() {
	const [sort, setSort] = useState<SortDescriptor>({
		column: 'date',
		direction: 'descending',
	});
	const sorted = useMemo(
		() =>
			[...posts].sort((a, b) => {
				const order =
					sort.column === 'title'
						? a.title.localeCompare(b.title)
						: a.created.getTime() - b.created.getTime();
				return sort.direction === 'descending' ? -order : order;
			}),
		[sort]
	);
	return (
		<TableContainer>
			<Table
				aria-label="Posts"
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
				<TableBody items={sorted}>
					{(post) => (
						<Row id={post.slug} href={`/vault/${post.slug}`}>
							<Cell>{post.title}</Cell>
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
	);
}

function SubstationTable() {
	const [selected, setSelected] = useState<Selection>(new Set(['DNM']));
	const count = selected === 'all' ? substations.length : selected.size;
	return (
		<div className="flex flex-col gap-2">
			<TableContainer>
				<ResizableTableContainer>
					<Table
						aria-label="Primary substations"
						density="compact"
						selectionMode="multiple"
						selectedKeys={selected}
						onSelectionChange={(keys) => {
							setSelected(keys);
						}}
					>
						<TableHeader>
							<Column
								id="name"
								isRowHeader
								defaultWidth="2fr"
								minWidth={140}
							>
								Substation
								<ColumnResizer />
							</Column>
							<Column
								id="voltage"
								defaultWidth="1fr"
								minWidth={90}
							>
								kV
								<ColumnResizer />
							</Column>
							<Column
								id="firm"
								align="end"
								defaultWidth="1fr"
								minWidth={90}
							>
								Firm MVA
								<ColumnResizer />
							</Column>
							<Column
								id="peak"
								align="end"
								defaultWidth="1fr"
								minWidth={90}
							>
								Peak MVA
							</Column>
						</TableHeader>
						<TableBody items={substations}>
							{(s) => (
								<Row id={s.id}>
									<Cell>{s.name}</Cell>
									<Cell className="font-data">
										{s.voltage}
									</Cell>
									<Cell numeric>{s.firmMva.toFixed(1)}</Cell>
									<Cell
										numeric
										className={
											s.peakMva > s.firmMva
												? 'text-fault'
												: undefined
										}
									>
										{s.peakMva.toFixed(1)}
									</Cell>
								</Row>
							)}
						</TableBody>
					</Table>
				</ResizableTableContainer>
			</TableContainer>
			<Text variant="small" tone="muted">
				Example data, not real substations. {count} selected. Drag the
				column edges to resize.
			</Text>
		</div>
	);
}

export function Data() {
	return (
		<>
			<Demo
				name="Table"
				summary="Tabular data on React Aria's Table: sorting, selection, row links, resizing."
			>
				<Example label="Sortable, rows link to posts">
					<div className="w-full">
						<PostsTable />
					</div>
				</Example>
				<Example label="Compact, selectable, resizable">
					<div className="w-full">
						<SubstationTable />
					</div>
				</Example>
				<Example label="Empty">
					<div className="w-full">
						<Table aria-label="Projects">
							<TableHeader>
								<Column isRowHeader>Project</Column>
								<Column>Status</Column>
							</TableHeader>
							<TableBody
								renderEmptyState={() => (
									<EmptyState
										title="No projects yet"
										description="Boundary Node projects will appear here."
									/>
								)}
							>
								{[]}
							</TableBody>
						</Table>
					</div>
				</Example>
			</Demo>

			<Demo
				name="Stat"
				summary="One number with its label: a reading from an instrument."
			>
				<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
					<Stat
						label="Readiness"
						value={80}
						note="Example value"
						state="in-service"
					/>
					<Stat
						label="Sleep"
						value={71}
						note="Example value"
						state="isolated"
					/>
					<Stat label="Activity" value={null} note="No data yet" />
				</div>
				<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
					<Stat label="Frequency" value="49.98" unit="Hz" />
					<Stat label="Demand" value="27.4" unit="GW" />
					<Stat label="Carbon" value={142} unit="g/kWh" />
				</div>
			</Demo>

			<Demo
				name="Status"
				summary="The state of a thing. A lamp plus a label."
			>
				<Example label="States">
					<Status state="in-service" />
					<Status state="isolated" />
					<Status state="fault" />
					<Status state="unknown" />
				</Example>
				<Example label="Custom label">
					<Status state="in-service">Oura API</Status>
					<Status state="isolated">Strava sync paused</Status>
				</Example>
			</Demo>

			<Demo name="Tag" summary="Labels a thing with a category or topic.">
				<Example label="Topics">
					<Tag>Review</Tag>
					<Tag>Principle</Tag>
					<Tag>CIM</Tag>
					<Tag>LTDS</Tag>
				</Example>
			</Demo>

			<Demo name="List" summary="Bulleted, numbered or bare lists.">
				<div className="grid w-full gap-6 sm:grid-cols-3">
					<List>
						<ListItem>Lines</ListItem>
						<ListItem>Transformers</ListItem>
						<ListItem>Breakers</ListItem>
					</List>
					<List variant="number">
						<ListItem>Request a connection</ListItem>
						<ListItem>Get an offer</ListItem>
						<ListItem>Accept by the deadline</ListItem>
					</List>
					<List variant="bare">
						<ListItem>
							<Link variant="standalone" href="/vault">
								Vault
							</Link>
						</ListItem>
						<ListItem>
							<Link variant="standalone" href="/projects">
								Projects
							</Link>
						</ListItem>
					</List>
				</div>
			</Demo>

			<Demo
				name="Checkbox"
				summary="One yes/no choice, or a group of independent choices."
			>
				<Example label="Single">
					<Checkbox defaultSelected>Email me new posts</Checkbox>
					<Checkbox isIndeterminate>Some feeds</Checkbox>
					<Checkbox isDisabled>Disabled</Checkbox>
				</Example>
				<CheckboxGroup
					label="Follow topics"
					description="Choose what shows on your new tab page."
					defaultValue={['ltds']}
				>
					<Checkbox value="ltds">LTDS</Checkbox>
					<Checkbox value="cim">CIM</Checkbox>
					<Checkbox value="connections">Connections reform</Checkbox>
				</CheckboxGroup>
			</Demo>

			<Demo
				name="Slider"
				summary="Picks one number from a range. The fill runs from the minimum, or from an origin."
			>
				<div className="grid max-w-xl gap-6">
					<Slider
						label="Gas setpoint"
						unit="MW"
						minValue={0}
						maxValue={2000}
						step={50}
						defaultValue={1200}
					/>
					<Slider
						label="Battery"
						unit="MW"
						minValue={-500}
						maxValue={500}
						step={10}
						origin={0}
						defaultValue={-150}
					/>
					<Slider
						label="Disabled"
						unit="MW"
						defaultValue={40}
						isDisabled
					/>
				</div>
			</Demo>

			<Demo
				name="EmptyState"
				summary="What to show when there is nothing to show."
			>
				<EmptyState
					title="No health data this week"
					description="The ring hasn’t synced since 28 September. Scores will appear after the next sync."
					action={
						<Button size="sm" variant="ghost">
							Refresh
						</Button>
					}
				/>
			</Demo>

			<Demo name="Spinner" summary="Shows that something is loading.">
				<Example label="Default">
					<Spinner />
					<Text variant="small" tone="muted">
						Loading posts
					</Text>
				</Example>
			</Demo>
		</>
	);
}
