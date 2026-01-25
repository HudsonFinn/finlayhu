import { Link } from 'react-router-dom';
import { H1, Preview, PreviewHeader, PreviewDescription } from 'chalkboard-ui';
import useTypewriter from '../utilities/useTypewriter';

function LandingPage() {
	const { displayText, isComplete } = useTypewriter(
		`I'm Finn. I write stuff.`,
		100
	);
	return (
		<div className="mt-[30vh] text-center px-4">
			<H1 className="break-words">{displayText}</H1>
			<div
				style={{
					transform: isComplete
						? 'translateY(0)'
						: 'translateY(2rem)',
					opacity: isComplete ? 1 : 0,
					transition: 'all 1s ease-out',
				}}
				className="mt-24 flex flex-wrap justify-center gap-8 text-left max-w-5xl mx-auto"
			>
				<Preview as={Link} href="/about" className="w-64">
					<PreviewHeader title="About" />
					<PreviewDescription>Learn more about me</PreviewDescription>
				</Preview>
				<Preview as={Link} href="/vault" className="w-64">
					<PreviewHeader title="Vault" />
					<PreviewDescription>My obsidian notes</PreviewDescription>
				</Preview>
				<Preview as={Link} href="/new-tab" className="w-64">
					<PreviewHeader title="New Tab" />
					<PreviewDescription>Quotes and data</PreviewDescription>
				</Preview>
			</div>
		</div>
	);
}

export default LandingPage;
