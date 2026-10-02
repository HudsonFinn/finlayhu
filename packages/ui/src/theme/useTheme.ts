import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'sl-theme';

function readChoice(fallback: ThemeChoice): ThemeChoice {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark' || stored === 'system')
			return stored;
	} catch {
		// Storage can be blocked; fall back to the system setting
	}
	return fallback;
}

function applyChoice(choice: ThemeChoice) {
	const root = document.documentElement;
	if (choice === 'system') root.removeAttribute('data-theme');
	else root.setAttribute('data-theme', choice);
}

/**
 * The viewer's theme choice. 'system' follows prefers-color-scheme; 'light' and 'dark'
 * set data-theme on <html>, which the tokens respect. The choice is remembered.
 * `defaultChoice` applies until the viewer picks one.
 */
export function useTheme(defaultChoice: ThemeChoice = 'system') {
	const [choice, setChoiceState] = useState<ThemeChoice>(() =>
		readChoice(defaultChoice)
	);

	useEffect(() => {
		applyChoice(choice);
	}, [choice]);

	const setChoice = useCallback((next: ThemeChoice) => {
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Not remembered, but still applied for this visit
		}
		setChoiceState(next);
	}, []);

	return { choice, setChoice };
}
