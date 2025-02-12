import { useEffect, useState } from 'react';
import './playground.css';
import '../App.css';
import { ConsoleLogger } from '../logger';

function PlaygroundPage() {
	const logger = new ConsoleLogger();
	const [isVisible, setIsVisible] = useState<boolean>(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			logger.info('Setting isVisible to true');
			setIsVisible(true);
		}, 0);

		return () => {
			clearTimeout(timeout);
		};
	});

	return (
		<div className="page">
			<h1>Playground</h1>
			<div className="playground">
				<div className={`fade-in ${isVisible ? 'visible' : ''}`}>
					This content fades in!
				</div>
			</div>
		</div>
	);
}

export default PlaygroundPage;
