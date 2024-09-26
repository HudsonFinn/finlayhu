import { Link } from 'react-router-dom';
import './NavButton.css';

type NavButtonProps = {
	title: string;
	url: string;
};

function NavButton({ title, url }: NavButtonProps) {
	return (
		<Link className="nav-button" to={url}>
			{title}
		</Link>
	);
}

export default NavButton;
