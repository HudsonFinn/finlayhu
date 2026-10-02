import { getJson } from './useFetch';

export interface Quote {
	text: string;
	author: string;
}

export async function loadQuote(signal: AbortSignal): Promise<Quote> {
	const body = await getJson<{ q: string; a: string }>(
		'https://fhudson.com/api/qotd',
		signal
	);
	return { text: body.q, author: body.a };
}
