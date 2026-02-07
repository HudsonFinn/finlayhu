import { useEffect, useState } from 'react';
import { Lead, Small } from 'chalkboard-ui';

type Quote = {
	q: string;
	a: string;
	i?: string;
	c?: number;
};

function QuoteOfTheDay() {
	const [quote, setQuote] = useState<Quote | undefined>();

	useEffect(() => {
		const getQuote = async () => {
			const response = await fetch('https://fhudson.com/api/qotd');
			const json = (await response.json()) as Quote;
			setQuote(json);
		};

		getQuote().catch((e: unknown) => {
			console.log(`Error getting QOTD ${String(e)}`);
			setQuote({
				q: "The struggle itself toward the heights is enough to fill a man's heart. One must imagine Sisyphus happy.",
				a: 'Albert Camus',
			});
		});
	}, []);

	if (!quote) {
		return <Small>Loading...</Small>;
	}

	return (
		<div className="max-w-xl mx-auto">
			<Lead className="italic text-center">&ldquo;{quote.q}&rdquo;</Lead>
			<Small className="block text-center mt-2">— {quote.a}</Small>
		</div>
	);
}

export default QuoteOfTheDay;
