import {
	forwardRef,
	useEffect,
	useId,
	useState,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from 'react';
import { Button, Link } from 'react-aria-components';
import { cn } from '../../lib/cn';
import { NodeMark } from '../NodeMark';

export interface SiteHeaderItem {
	label: string;
	href: string;
}

export interface SiteHeaderProps
	extends Omit<ComponentPropsWithoutRef<'header'>, 'title'> {
	/** The site name. Links home. */
	title: ReactNode;
	items: SiteHeaderItem[];
	/** The current path. The matching item gets aria-current="page". */
	currentHref: string;
	/** Accessible name for the navigation. */
	navLabel?: string;
}

function isCurrent(href: string, currentHref: string) {
	if (href === '/') return currentHref === '/';
	return currentHref === href || currentHref.startsWith(`${href}/`);
}

const itemClasses =
	'block border-b-[1.5px] border-transparent py-1 font-data text-label uppercase tracking-widest text-ink-muted transition-colors data-hovered:text-ink aria-[current=page]:border-verdigris aria-[current=page]:text-ink';

/** The site's top bar: its name and main navigation. Collapses behind a menu button on phones. */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
	function SiteHeader(
		{ title, items, currentHref, navLabel = 'Main', className, ...props },
		ref
	) {
		const [open, setOpen] = useState(false);
		const listId = useId();

		// Close the phone menu after navigating
		useEffect(() => {
			setOpen(false);
		}, [currentHref]);

		return (
			<header
				ref={ref}
				className={cn('border-b border-ink bg-paper', className)}
				{...props}
			>
				<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-8">
					<Link
						href="/"
						className="inline-flex items-center gap-3 font-display text-small uppercase tracking-wide text-ink data-hovered:text-verdigris"
					>
						<NodeMark className="h-4 w-10" />
						{title}
					</Link>
					<Button
						aria-expanded={open}
						aria-controls={listId}
						onPress={() => {
							setOpen((value) => !value);
						}}
						className="cursor-pointer border-[1.5px] border-ink px-3 py-2 font-data text-label uppercase tracking-widest text-ink data-hovered:bg-sheet sm:hidden"
					>
						{open ? 'Close' : 'Menu'}
					</Button>
					<nav
						aria-label={navLabel}
						className={cn(
							'w-full sm:block sm:w-auto',
							!open && 'hidden'
						)}
					>
						<ul
							id={listId}
							className="flex flex-col gap-3 border-t border-hairline pt-3 sm:flex-row sm:gap-6 sm:border-0 sm:pt-0"
						>
							{items.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										aria-current={
											isCurrent(item.href, currentHref)
												? 'page'
												: undefined
										}
										className={itemClasses}
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>
		);
	}
);
