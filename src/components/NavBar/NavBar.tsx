import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from 'chalkboard-ui';

function NavBar() {
	const location = useLocation();
	const navigate = useNavigate();

	const sections = {
		'': [
			{ label: 'Home', href: '/', icon: 'home' as const },
			{ label: 'About', href: '/about', icon: 'user' as const },
			{ label: 'Vault', href: '/vault', icon: 'star' as const },
			{
				label: 'NewTab',
				href: '/new-tab',
				icon: 'external-link' as const,
			},
		],
	};

	const isActive = (href: string) => {
		if (href === '/') {
			return location.pathname === '/';
		}
		return location.pathname.startsWith(href);
	};

	return (
		<Navbar
			title="FHudson"
			sections={sections}
			isActive={isActive}
			onItemClick={(href) => {
				navigate(href);
			}}
		/>
	);
}

export default NavBar;
