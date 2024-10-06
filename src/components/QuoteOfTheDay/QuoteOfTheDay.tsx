import { useEffect, useState } from 'react';
import './QuoteOfTheDay.css';
import Quote from './Quote';

// Documentation: https://docs.zenquotes.io/zenquotes-documentation/#api-structure
type Quote = {
	q: string; // Quote
	a: string; // Author
	i?: string; // Author Image
	c?: number; // Character Count
};

function QuoteOfTheDay() {
	const [quote, setQuote] = useState<Quote | undefined>();

	useEffect(() => {
		const getQuote = async () => {
			const response = await fetch(
				'https://5xelzlc0nb.execute-api.eu-west-2.amazonaws.com/prod/'
			);
			const json = (await response.json()) as Quote;
			setQuote(json);
		};

		getQuote().catch((e: unknown) => {
			console.log(`Error getting QOTD ${String(e)}`);
			setQuote({
				q: 'The struggle itself toward the heights is enough to fill a man’s heart. One must imagine Sisyphus happy.',
				a: 'Albert Camus',
			});
		});
	}, []);

	return (
		<p className="quote">
			QOTD: {quote ? <Quote quote={quote.q} author={quote.a} /> : '...'}
		</p>
	);
}

export default QuoteOfTheDay;
