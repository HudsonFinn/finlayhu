import '../App.css';
import useTypewriter from '../utilities/useTypewriter';

function LandingPage() {
	const text = useTypewriter(`I'm Finn. I write code.`, 100);
	return (
		<div className="page">
			<div className="">
				<h1>{text}</h1>
			</div>
		</div>
	);
}

export default LandingPage;
