import { useState } from 'react';
import { Button, cn } from '@fhudson/ui';

/** The habits behind every pass. Rules catch problems; these stop them being written. */
const PRINCIPLES = [
	{
		title: 'Know your point',
		detail: 'Write the one sentence the piece argues before you start. Can’t? You’re about to write a summary.',
	},
	{
		title: 'Draft, then edit',
		detail: 'Separate jobs. Draft fast and badly, leave it a day, then edit.',
	},
	{
		title: 'One thing per pass',
		detail: 'Hunt for a single problem at a time. “Make it better” catches little.',
	},
	{
		title: 'Read it aloud',
		detail: 'Where you stumble or run out of breath, the sentence needs work.',
	},
	{
		title: 'Cut',
		detail: 'Most drafts get better at 70% of their length.',
	},
];

const KEY = 'editor-principles-hidden';

function readHidden() {
	try {
		return localStorage.getItem(KEY) === 'true';
	} catch {
		return false;
	}
}

/** The general rules, across the top of the editor. Hide them once they're habit. */
export function Principles() {
	const [hidden, setHidden] = useState(readHidden);

	const toggle = () => {
		const next = !hidden;
		setHidden(next);
		try {
			localStorage.setItem(KEY, String(next));
		} catch {
			// Not remembered, but still toggles
		}
	};

	return (
		<section
			aria-label="Writing principles"
			className={cn(
				'flex gap-4 border-b border-hairline bg-sheet px-4',
				hidden ? 'items-center py-1' : 'items-start py-3'
			)}
		>
			{hidden ? (
				<span className="flex-1 font-data text-label uppercase tracking-widest text-ink-muted">
					{PRINCIPLES.map((p) => p.title).join(' · ')}
				</span>
			) : (
				<ol className="grid flex-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-5">
					{PRINCIPLES.map((p, i) => (
						<li key={p.title} className="flex gap-2">
							<span className="font-data text-label text-verdigris">
								{String(i + 1).padStart(2, '0')}
							</span>
							<span className="flex flex-col gap-0.5">
								<span className="text-small font-semibold text-ink">
									{p.title}
								</span>
								<span className="text-small text-ink-muted">
									{p.detail}
								</span>
							</span>
						</li>
					))}
				</ol>
			)}
			<Button
				size="sm"
				variant="quiet"
				onPress={toggle}
				aria-expanded={!hidden}
			>
				{hidden ? 'Show' : 'Hide'}
			</Button>
		</section>
	);
}
