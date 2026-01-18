import NavButton from '../NavButton/NavButton';

function NavBar() {
	return (
		<header className="nav-container">
			<h1 className="nav-title">Finlayhu</h1>
			<nav>
				<ol className="nav-items">
					<NavButton title={'Home'} url={''} />
					<NavButton title={'About'} url={'/about'} />
					<NavButton title={'Vault'} url={'/vault'} />
					<NavButton title={'Playground'} url={'/playground'} />
					<NavButton title={'NewTab'} url={'/new-tab'} />
				</ol>
			</nav>
		</header>
	);
}

export default NavBar;
