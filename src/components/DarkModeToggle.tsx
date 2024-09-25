

// https://www.sitepoint.com/react-toggle-switch-reusable-component/

import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { ConsoleLogger } from "../logger";

function DarkModeToggle() {
    let [checked, setChecked] = useState(false);

    const logger = new ConsoleLogger();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.currentTarget.checked
        logger.info(checked)
        setChecked(checked);
    }
    return (
        <ToggleSwitch checked={checked} onChange={onChange} /> 
    )
}

export default DarkModeToggle;