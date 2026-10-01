import { useEffect, useState } from 'react';

const useTypewriter = (text: string, speed: number) => {
	const [index, setIndex] = useState(0);

	const displayText = text.slice(0, index);
	const isComplete = index >= text.length;

	useEffect(() => {
		if (index >= text.length) return;

		const setTimeoutId = setTimeout(() => {
			setIndex(index + 1);
		}, speed);

		return () => {
			clearTimeout(setTimeoutId);
		};
	}, [index, text, speed]);

	return { displayText, isComplete };
};

export default useTypewriter;
