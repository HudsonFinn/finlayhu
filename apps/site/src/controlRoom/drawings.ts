/** Each page's drawing number, shown in its title block. */
export const drawings: Record<string, { number: string; title: string }> = {
	'/': { number: 'FH-BRD-001', title: 'Board' },
	'/vault': { number: 'FH-LOG-001', title: 'Log' },
	'/projects': { number: 'FH-REG-001', title: 'Register' },
	'/new-tab': { number: 'FH-OPS-001', title: 'Operator desk' },
	'/about': { number: 'FH-OPR-001', title: 'Operator' },
	'/f': { number: 'FH-FIG-001', title: 'Figures' },
};

export function drawingFor(pathname: string) {
	if (pathname.startsWith('/vault/'))
		return { number: 'FH-LOG-100', title: 'Log entry' };
	// A figure's page carries the figure's own drawing number: /f/bn-03-f2 → BN-03-F2
	const figure = /^\/f\/(bn-\d{2}-f\d+)$/.exec(pathname)?.[1];
	if (figure) return { number: figure.toUpperCase(), title: 'Figure' };
	return drawings[pathname] ?? { number: 'FH-404', title: 'Open circuit' };
}

export const navItems = [
	{ label: 'Board', href: '/' },
	{ label: 'Log', href: '/vault' },
	{ label: 'Register', href: '/projects' },
	{ label: 'Operator desk', href: '/new-tab' },
	{ label: 'Operator', href: '/about' },
];
