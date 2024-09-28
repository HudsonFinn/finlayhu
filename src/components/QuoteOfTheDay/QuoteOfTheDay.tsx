import { useEffect, useState } from 'react';

type Quote = {
	q: string;
	a: string;
	i: string;
	c: number;
};

type Response = Array<Quote>;

function QuoteOfTheDay() {
	const [quote, setQuote] = useState<Quote | undefined>();

	useEffect(() => {
		const getQuote = async () => {
			const response = await fetch('https://zenquotes.io/api/today/');
			const json = (await response.json()) as Response;
			console.log(json);
			setQuote(json[0]);
		};

		getQuote().catch((e: unknown) => {
			console.log(`Error getting QOTD ${String(e)}`);
		});
	}, []);

	return <p>QOTD: {quote?.q}</p>;
}

export default QuoteOfTheDay;
