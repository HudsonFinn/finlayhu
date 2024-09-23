import "./NavBar.css"

function NavBar() {
    return (
        <nav className="nav" >
            <h1>Finlayhu</h1>
            <ol className="nav-items">
                <li>Home</li> 
                <li>Vault</li> 
                <li>Back</li> 
            </ol>
        </nav>
    )
}

export default NavBar;