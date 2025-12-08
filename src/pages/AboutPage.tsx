import '../App.css';

function AboutPage() {
	return (
		<div className="page">
			<h1 className="text-3xl text-bold">About me</h1>
			<p>
				Hey, I&apos;m Finn a Software Engineer who likes to write and
				build stuff. You can contact me below.
			</p>
			<h2 className="text-2xl">Contact</h2>
			<ul>
				<li>
					Linkedin:
					<a href="https://www.linkedin.com/in/finn-hudson/">
						finn-hudson
					</a>
				</li>
				<li>
					Email:
					<a href="matilo:11finnh@gmail.com">11finnh@gmail.com</a>
				</li>
				<li>
					Github:
					<a href="https://www.github.com/HudsonFinn">HudsonFinn</a>
				</li>
			</ul>
		</div>
	);
}

export default AboutPage;
