
import { Link } from 'react-router-dom'


type NavButtonProps = {
    title: string
    url: string
}

function NavButton({ title, url }: NavButtonProps) {

    return (
        <Link to={url}><button>{title}</button></Link>    
    )
}

export default NavButton;