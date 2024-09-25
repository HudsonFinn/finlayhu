
import { Link } from 'react-router-dom'


type NavButtonProps = {
    title: string
    url: string
}

function NavButton({ title, url }: NavButtonProps) {

    return (
        <Link to={url}><p>{title}</p></Link>    
    )
}

export default NavButton;