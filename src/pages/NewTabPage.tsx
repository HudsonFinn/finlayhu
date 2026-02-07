import { H1 } from 'chalkboard-ui';
import OuraData from '../components/OuraData/OuraData';
import QuoteOfTheDay from '../components/QuoteOfTheDay/QuoteOfTheDay';

const getGreeting = (): string => {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return 'Good Morning';
	if (hour >= 12 && hour < 17) return 'Good Afternoon';
	if (hour >= 17 && hour < 21) return 'Good Evening';
	return 'Good Night';
};

function NewTabPage() {
	return (
		<div className="max-w-4xl mx-auto px-6 py-12">
			<header className="text-center mb-12">
				<H1 className="mb-4">{getGreeting()}</H1>
				<QuoteOfTheDay />
			</header>

			<OuraData />
		</div>
	);
}

export default NewTabPage;
