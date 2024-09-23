
type NavButtonProps = {
    title: string
}

function NavButton({ title }: NavButtonProps) {

    return (
        <button>{title}</button>
    )
}

export default NavButton;