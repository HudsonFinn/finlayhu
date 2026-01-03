import { useEffect, useState } from 'react';
import './FadeIn.css';

export default function FadeIn({ children }: { children: React.ReactNode }) {
	const [isVisible, setIsVisible] = useState<boolean>(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsVisible(true);
		}, 0);

		return () => {
			clearTimeout(timeout);
		};
	}, []);

	return (
		<div className={`fade-in ${isVisible ? 'visible' : ''}`}>
			{children}
		</div>
	);
}
