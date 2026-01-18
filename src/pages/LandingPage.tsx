import { Link } from 'react-router-dom';
import useTypewriter from '../utilities/useTypewriter';

function LandingPage() {
	const text = useTypewriter(`I'm Finn. I write stuff.`, 100);
	return (
		<div className="flex flex-col max-w-[90%] mx-auto">
			<div className="text-center">
				<h1 className="text-3xl font-bold">{text}</h1>
				<div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
					<Link
						className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5"
						to={'/vault'}
					>
						Vault
					</Link>
					<Link to={'/new-tab'}>Data</Link>
				</div>
			</div>
		</div>
	);
}

export default LandingPage;
