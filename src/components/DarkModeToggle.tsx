// https://www.sitepoint.com/react-toggle-switch-reusable-component/

import { useEffect, useState } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { ConsoleLogger } from '../logger';
import { useMediaQuery } from '../utilities/useMediaQuery';

function DarkModeToggle() {
	const [checked, setChecked] = useState(false);

	const logger = new ConsoleLogger();

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checked = e.currentTarget.checked;

		logger.info(`User manually set dark mode ${checked}`);

		setChecked(checked);
	};

	const onSystemPreferenceChange = (checked: boolean) => {
		console.log(`System preference set dark mode ${checked}`);
		setChecked(checked);
	};

	useMediaQuery('(prefers-color-scheme: dark)', onSystemPreferenceChange);

	useEffect(() => {
		if (checked) {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	});

	return <ToggleSwitch checked={checked} onChange={onChange} />;
}

export default DarkModeToggle;
