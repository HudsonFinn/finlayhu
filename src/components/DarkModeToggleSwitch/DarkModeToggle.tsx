import { useEffect, useState } from 'react';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import logger from '../../logger';
import { useMediaQuery } from '../../utilities/useMediaQuery';

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

function DarkModeToggle() {
	const [checked, setChecked] = useState<boolean | undefined>(undefined);
	const isSystemDarkSetting = useMediaQuery(DARK_MODE_QUERY);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checked = e.currentTarget.checked;

		logger.info(`User manually set dark mode ${String(checked)}`);

		setChecked(checked);
	};

	const darkMode = checked === undefined ? isSystemDarkSetting : checked;

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	});

	return <ToggleSwitch checked={darkMode} onChange={onChange} />;
}

export default DarkModeToggle;
