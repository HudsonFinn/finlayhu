import "./NavBar.css"
import NavButton from "./NavButton";

function NavBar() {
    return (
        <nav className="nav" >
            <h1>Finlayhu</h1>
            <ol className="nav-items">
                <NavButton title={"Home"} />
                <NavButton title={"Vault"} />
                <NavButton title={"About"} />
            </ol>
        </nav>
    )
}

export default NavBar;