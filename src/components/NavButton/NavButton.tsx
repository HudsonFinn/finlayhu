import { useMatch, useResolvedPath, useNavigate } from 'react-router-dom';
import { Button } from 'chalkboard-ui';

type NavButtonProps = {
	title: string;
	url: string;
};

function NavButton({ title, url }: NavButtonProps) {
	const navigate = useNavigate();
	const resolvedPath = useResolvedPath(url);
	const isActive = useMatch({ path: resolvedPath.pathname, end: true });

	return (
		<li>
			<Button
				variant={isActive ? 'primary' : 'outline'}
				onClick={() => {
					navigate(url);
				}}
			>
				{title}
			</Button>
		</li>
	);
}

export default NavButton;
