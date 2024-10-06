type QuoteProps = {
	quote: string;
	author: string;
};

function Quote(props: QuoteProps) {
	const { quote, author } = props;
	return (
		<>
			<i>{quote}</i> - {author}
		</>
	);
}

export default Quote;
