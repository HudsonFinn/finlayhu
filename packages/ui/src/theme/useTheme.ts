import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'sl-theme';

function readChoice(): ThemeChoice {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') return stored;
	} catch {
		// Storage can be blocked; fall back to the system setting
	}
	return 'system';
}

function applyChoice(choice: ThemeChoice) {
	const root = document.documentElement;
	if (choice === 'system') root.removeAttribute('data-theme');
	else root.setAttribute('data-theme', choice);
}

/**
 * The viewer's theme choice. 'system' follows prefers-color-scheme; 'light' and 'dark'
 * set data-theme on <html>, which the tokens respect. The choice is remembered.
 */
export function useTheme() {
	const [choice, setChoiceState] = useState<ThemeChoice>(readChoice);

	useEffect(() => {
		applyChoice(choice);
	}, [choice]);

	const setChoice = useCallback((next: ThemeChoice) => {
		try {
			if (next === 'system') localStorage.removeItem(STORAGE_KEY);
			else localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Not remembered, but still applied for this visit
		}
		setChoiceState(next);
	}, []);

	return { choice, setChoice };
}
