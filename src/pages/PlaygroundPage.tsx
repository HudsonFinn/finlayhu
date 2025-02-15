import { useEffect, useState } from 'react';
import './Playground.css';
import '../App.css';
import { ConsoleLogger } from '../logger';
import Button from '../components/Button/Button';

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
				<Button
					onClick={() => {
						'Button Pressed';
					}}
				>
					This is the button
				</Button>
			</div>
		</div>
	);
}

export default PlaygroundPage;
