import '../App.css';
import QuoteOfTheDay from '../components/QuoteOfTheDay/QuoteOfTheDay';

function NewTabPage() {
	return (
		<div className="page">
			<h1>NewTab</h1>
			<hr />
			<QuoteOfTheDay />
			<hr />
			<div style={{ display: 'flex', flexWrap: 'wrap' }}>
				<div
					style={{
						flexGrow: 1,
						flexBasis: '400px',
						margin: '10px 20px',
					}}
				>
					<h3>Links 🔗</h3>
					<p>This is where links will go</p>
				</div>
				<div
					style={{
						flexGrow: 1,
						flexBasis: '400px',
						margin: '10px 20px',
					}}
				>
					<h3>Information 📊</h3>
					<p>This is where information will go</p>
				</div>
			</div>
		</div>
	);
}

export default NewTabPage;
