import { Link } from 'react-router-dom';
import './NavButton.css';

type NavButtonProps = {
	title: string;
	url: string;
};

function NavButton({ title, url }: NavButtonProps) {
	return (
		<Link to={url}>
			<p className="nav-button">{title}</p>
		</Link>
	);
}

export default NavButton;
