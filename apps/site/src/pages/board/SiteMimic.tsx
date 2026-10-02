import { Breaker, Link, Status, Text } from '@fhudson/ui';

const circuits = [
	{ id: 'C1', label: 'Log', detail: 'Writing and notes', href: '/vault' },
	{ id: 'C2', label: 'Register', detail: 'Projects', href: '/projects' },
	{
		id: 'C3',
		label: 'Operator desk',
		detail: 'Health, activity, quotes',
		href: '/new-tab',
	},
	{ id: 'C4', label: 'Operator', detail: 'About Finn', href: '/about' },
	{
		id: 'C5',
		label: 'Boundary Node',
		detail: 'The newsletter',
		href: 'https://finlayhu.substack.com',
	},
];

/**
 * The site drawn as a mimic diagram: a busbar with a closed breaker for each section.
 * Each circuit is a link. On phones the busbar runs down the side instead.
 */
export function SiteMimic() {
	return (
		<nav aria-label="Sections" className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4">
				<Text variant="label">Busbar BB1 · all circuits closed</Text>
				<Status state="in-service">Energised</Status>
			</div>
			<ul className="grid grid-cols-1 border-l-[3px] border-verdigris sm:grid-cols-5 sm:border-t-[3px] sm:border-l-0">
				{circuits.map((c) => (
					<li key={c.id} className="flex">
						<Link
							href={c.href}
							variant="standalone"
							externalIcon={false}
							className="group flex w-full items-center gap-3 py-2 pl-0 normal-case tracking-normal sm:flex-col sm:items-center sm:gap-2 sm:py-0 sm:text-center"
						>
							{/* The drop from the busbar: horizontal on phones, vertical above */}
							<span
								aria-hidden="true"
								className="h-[1.5px] w-5 bg-ink sm:hidden"
							/>
							<Breaker
								closed
								state="in-service"
								className="max-sm:h-8 max-sm:w-4"
							/>
							<span className="flex flex-col gap-0.5 sm:items-center">
								<span className="font-data text-label uppercase tracking-widest text-ink-muted">
									{c.id}
								</span>
								<span className="font-display text-small whitespace-nowrap uppercase tracking-wide text-ink group-data-hovered:text-verdigris">
									{c.label}
									{c.href.startsWith('http') && (
										<span aria-hidden="true"> ↗</span>
									)}
								</span>
								<span className="font-body text-small text-ink-muted">
									{c.detail}
								</span>
							</span>
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
