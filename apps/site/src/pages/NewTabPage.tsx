import { Link } from 'react-router-dom';
import { H1, H2, List, ListItem } from 'chalkboard-ui';
import OuraData from '../components/OuraData/OuraData';
import QuoteOfTheDay from '../components/QuoteOfTheDay/QuoteOfTheDay';
import { principles } from '../data/posts';

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

			<section className="mt-12">
				<H2 className="mb-4">Principles</H2>
				<List>
					{principles.map((p) => (
						<ListItem key={p.slug}>
							<Link
								to={`/vault/${p.slug}`}
								className="hover:text-chalkboard-accent transition-colors"
							>
								{p.title}
							</Link>
						</ListItem>
					))}
				</List>
			</section>
		</div>
	);
}

export default NewTabPage;
