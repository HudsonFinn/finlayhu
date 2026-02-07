import { H1 } from 'chalkboard-ui';
import OuraData from '../components/OuraData/OuraData';
import QuoteOfTheDay from '../components/QuoteOfTheDay/QuoteOfTheDay';

function NewTabPage() {
	return (
		<div className="max-w-4xl mx-auto px-6 py-12">
			<header className="text-center mb-12">
				<H1 className="mb-4">Good Morning</H1>
				<QuoteOfTheDay />
			</header>

			<OuraData />
		</div>
	);
}

export default NewTabPage;
