/** Each page's drawing number, shown in its title block. */
export const drawings: Record<string, { number: string; title: string }> = {
	'/': { number: 'FH-BRD-001', title: 'Board' },
	'/vault': { number: 'FH-LOG-001', title: 'Log' },
	'/projects': { number: 'FH-REG-001', title: 'Register' },
	'/new-tab': { number: 'FH-OPS-001', title: 'Operator desk' },
	'/about': { number: 'FH-OPR-001', title: 'Operator' },
};

export function drawingFor(pathname: string) {
	if (pathname.startsWith('/vault/'))
		return { number: 'FH-LOG-100', title: 'Log entry' };
	return drawings[pathname] ?? { number: 'FH-404', title: 'Open circuit' };
}

export const navItems = [
	{ label: 'Board', href: '/' },
	{ label: 'Log', href: '/vault' },
	{ label: 'Register', href: '/projects' },
	{ label: 'Operator desk', href: '/new-tab' },
	{ label: 'Operator', href: '/about' },
];
