import '../App.css';
import QuoteOfTheDay from '../components/QuoteOfTheDay/QuoteOfTheDay';

function NewTabPage() {
	return (
		<div className="page">
			<h1>NewTab</h1>
			<p>Base page for new tab idea</p>
			<QuoteOfTheDay />
		</div>
	);
}

export default NewTabPage;
