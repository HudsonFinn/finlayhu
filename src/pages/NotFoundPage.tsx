import '../App.css';
import asciiArt from '../ascii/missingPage.art.ts';

function NotFoundPage() {
	return (
		<div className="page">
			<pre>{asciiArt}</pre>
			<h1 className="font-bold">Not found</h1>
			<p>
				This page isn&apos;t implemented at the moment, don&apos;t judge
				me
			</p>
		</div>
	);
}

export default NotFoundPage;
