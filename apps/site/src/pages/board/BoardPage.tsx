import {
	Heading,
	Link,
	Panel,
	PanelBody,
	PanelHeader,
	Tag,
	Text,
} from '@fhudson/ui';
import { posts } from '../../data/posts';
import { GridPanel } from './GridPanel';
import { SiteMimic } from './SiteMimic';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});
const latest = [...posts]
	.sort((a, b) => b.created.getTime() - a.created.getTime())
	.slice(0, 3);

/** The homepage: who this is, the live grid, the site's circuits, and the latest writing. */
function BoardPage() {
	return (
		<>
			<header className="flex flex-col gap-4">
				<Text variant="label">PNL 01 · Board</Text>
				<Heading level={1}>Building AI for the grid</Heading>
				<Text variant="lead" className="max-w-[56ch]">
					I&rsquo;m Finn, a software engineer. I write Boundary Node:
					the electricity system&rsquo;s data, explained.
				</Text>
				<div className="flex flex-wrap gap-3">
					<Link variant="button" href="https://finlayhu.substack.com">
						Read Boundary Node
					</Link>
					<Link variant="button" buttonVariant="ghost" href="/about">
						Operator
					</Link>
				</div>
			</header>

			<GridPanel />

			<Panel>
				<PanelHeader label="Circuits" meta="PNL 03" />
				<PanelBody>
					<SiteMimic />
				</PanelBody>
			</Panel>

			<Panel>
				<PanelHeader
					label="Latest from the log"
					meta="PNL 04"
					href="/vault"
				/>
				<PanelBody className="gap-0 py-1">
					<ul className="flex flex-col">
						{latest.map((post) => (
							<li
								key={post.slug}
								className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-hairline py-3 last:border-b-0"
							>
								<Link
									href={`/vault/${post.slug}`}
									className="text-ui font-semibold"
								>
									{post.title}
								</Link>
								<span className="font-data text-label whitespace-nowrap text-ink-muted">
									{dateFormat.format(post.created)}
								</span>
								<span className="col-span-2 flex flex-wrap gap-1">
									{post.tags.map((tag) => (
										<Tag key={tag}>{tag}</Tag>
									))}
								</span>
							</li>
						))}
					</ul>
				</PanelBody>
			</Panel>
		</>
	);
}

export default BoardPage;
