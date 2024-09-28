import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import './NavButton.css';

type NavButtonProps = {
	title: string;
	url: string;
};

function NavButton({ title, url }: NavButtonProps) {
	const resolvedPath = useResolvedPath(url);
	const isActive = useMatch({ path: resolvedPath.pathname, end: true });
	return (
		<li className={isActive ? 'active' : ''}>
			<Link className="nav-button" to={url}>
				{title}
			</Link>
		</li>
	);
}

export default NavButton;
