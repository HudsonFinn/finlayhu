import '../App.css';
import Button from '../components/Button/Button';
import PhotoGallery from '../components/PhotoGallery/PhotoGallery';
import FadeIn from '../components/FadeIn/FadeIn';

function PlaygroundPage() {
	return (
		<div className="page">
			<h1>Playground</h1>
			<div className="playground">
				<h4>Testing out css fade animation</h4>
				<FadeIn>This content fades in!</FadeIn>
				<h4>
					Testing out styling a button with gradients and fancy
					borders
				</h4>
				<Button
					onClick={() => {
						'Button Pressed';
					}}
				>
					This is the button
				</Button>
				<h4>Testing out a grid layout and component memoisation</h4>
				<PhotoGallery />
			</div>
		</div>
	);
}

export default PlaygroundPage;
