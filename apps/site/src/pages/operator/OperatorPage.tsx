import { Link, Panel, PanelBody, PanelHeader, Text } from '@fhudson/ui';
import { PageHeader } from '../../controlRoom/PageHeader';

const contacts = [
	{
		label: 'Email',
		value: '11finnh@gmail.com',
		href: 'mailto:11finnh@gmail.com',
	},
	{
		label: 'LinkedIn',
		value: 'finn-hudson',
		href: 'https://www.linkedin.com/in/finn-hudson/',
	},
	{
		label: 'GitHub',
		value: 'HudsonFinn',
		href: 'https://www.github.com/HudsonFinn',
	},
	{
		label: 'Newsletter',
		value: 'Boundary Node',
		href: 'https://finlayhu.substack.com',
	},
];

/** About Finn, and how to reach him. */
function OperatorPage() {
	return (
		<>
			<PageHeader panel="PNL 01 · Operator" title="Operator">
				I&rsquo;m Finn, a software engineer who likes to write and build
				things.
			</PageHeader>
			<Panel>
				<PanelHeader
					label="Contact"
					meta={`${String(contacts.length)} channels`}
				/>
				<PanelBody className="py-1">
					<dl className="flex flex-col">
						{contacts.map((c) => (
							<div
								key={c.label}
								className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-4 border-b border-hairline py-3 last:border-b-0"
							>
								<dt>
									<Text as="span" variant="label">
										{c.label}
									</Text>
								</dt>
								<dd className="min-w-0 wrap-anywhere">
									<Link href={c.href}>{c.value}</Link>
								</dd>
							</div>
						))}
					</dl>
				</PanelBody>
			</Panel>
		</>
	);
}

export default OperatorPage;
