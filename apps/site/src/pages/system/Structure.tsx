import {
	Link,
	NodeMark,
	Panel,
	PanelBody,
	PanelHeader,
	SiteHeader,
	SkipLink,
	Text,
	TitleBlock,
} from '@fhudson/ui';
import { Demo, Example } from './Demo';

const navItems = [
	{ label: 'Home', href: '/' },
	{ label: 'Vault', href: '/vault' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'New tab', href: '/new-tab' },
];

export function Structure() {
	return (
		<>
			<Demo
				name="Panel"
				summary="A labelled area that groups related content. Never nested."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<Panel>
						<PanelHeader label="Health · Oura" meta="Today" />
						<PanelBody>
							<Text variant="ui">
								Readiness, sleep and activity scores, from the
								ring.
							</Text>
						</PanelBody>
					</Panel>
					<Panel>
						<PanelHeader
							label="Vault"
							meta="9 posts"
							href="/vault"
						/>
						<PanelBody>
							<Text variant="ui">
								The whole panel is a link. Hover it, or tab to
								it.
							</Text>
						</PanelBody>
					</Panel>
				</div>
			</Demo>

			<Demo
				name="SiteHeader"
				summary="The site's top bar. Collapses behind a menu button on phones."
			>
				<div className="border border-hairline">
					<SiteHeader
						title="Finlay Hudson"
						items={navItems}
						currentHref="/vault"
					/>
				</div>
				<Text variant="small" tone="muted">
					Shown with Vault as the current page.
				</Text>
			</Demo>

			<Demo
				name="SkipLink"
				summary="Lets keyboard users jump past the header. Hidden until focused."
			>
				<Example label="Tab into this box to see it">
					<div className="relative w-full border border-dashed border-hairline p-4">
						<SkipLink href="#components" className="focus:absolute">
							Skip to components
						</SkipLink>
						<Text variant="small" tone="muted">
							The link appears in the corner when focused.
						</Text>
					</div>
				</Example>
			</Demo>

			<Demo
				name="TitleBlock"
				summary="Page or post metadata, set out like a drawing's title block."
			>
				<TitleBlock
					fields={[
						{
							label: 'Title',
							value: 'What is a common information model?',
						},
						{ label: 'Drawn', value: 'FH' },
						{ label: 'Date', value: '13.09.26' },
						{ label: 'Rev', value: 'C' },
					]}
				/>
			</Demo>

			<Demo
				name="NodeMark"
				summary="The Boundary Node mark: two lines meeting at a hollow node."
			>
				<Example label="Sizes">
					<NodeMark className="h-3 w-8" />
					<NodeMark />
					<NodeMark className="h-10 w-24" label="Boundary Node" />
				</Example>
				<Text variant="small" tone="muted">
					Decorative by default. Give it a{' '}
					<Link href="#component-nodemark">label</Link> when it stands
					alone.
				</Text>
			</Demo>
		</>
	);
}
