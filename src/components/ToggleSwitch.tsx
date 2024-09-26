type ToggleSwitchProps = {
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function ToggleSwitch(props: ToggleSwitchProps) {
    const { checked, onChange } = props
    return <input type="checkbox" checked={checked} onChange={onChange}></input>
}

export default ToggleSwitch
