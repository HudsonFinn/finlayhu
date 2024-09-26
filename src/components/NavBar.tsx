import DarkModeToggle from './DarkModeToggle';
import './NavBar.css';
import NavButton from './NavButton';

function NavBar() {
    return (
        <nav className="nav">
            <h1>Finlayhu</h1>
            <ol className="nav-items">
                <NavButton title={'Home'} url={''} />
                <NavButton title={'Vault'} url={'/vault'} />
                <NavButton title={'About'} url={'/about'} />
            </ol>
            <DarkModeToggle />
        </nav>
    );
}

export default NavBar;
