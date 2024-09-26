import DarkModeToggle from '../DarkModeToggleSwitch/DarkModeToggle';
import './NavBar.css';
import NavButton from '../NabButton/NavButton';

function NavBar() {
	return (
		<div className="nav-container">
			<h1 className="nav-title">Finlayhu</h1>
			<nav>
				<ol className="nav-items">
					<NavButton title={'Home'} url={''} />
					<NavButton title={'Vault'} url={'/vault'} />
					<NavButton title={'About'} url={'/about'} />
					<NavButton title={'NewTab'} url={'/new-tab'} />
				</ol>
			</nav>
			<DarkModeToggle />
		</div>
	);
}

export default NavBar;
