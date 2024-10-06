import { useEffect, useState } from 'react';
import './QuoteOfTheDay.css';

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
			const response = await fetch(
				'https://5xelzlc0nb.execute-api.eu-west-2.amazonaws.com/prod/'
			);
			const json = (await response.json()) as Response;
			console.log(json);
			setQuote(json[0]);
		};

		getQuote().catch((e: unknown) => {
			console.log(`Error getting QOTD ${String(e)}`);
		});
	}, []);

	return <p className="quote">QOTD: {quote?.q}</p>;
}

export default QuoteOfTheDay;
