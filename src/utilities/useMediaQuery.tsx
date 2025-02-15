import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false);

	const getMatches = (query: string) => {
		return window.matchMedia(query).matches;
	};

	useEffect(() => {
		const matchMedia = window.matchMedia(query);

		console.log('Initial system dark mode setting:', getMatches(query));
		setMatches(getMatches(query));

		const listener = () => {
			console.log('System dark mode setting changed:', getMatches(query));
			setMatches(getMatches(query));
		};

		matchMedia.addEventListener('change', listener);

		return () => {
			matchMedia.removeEventListener('change', listener);
		};
	}, [query]);

	return matches;
};
