import { useEffect, useState, type ReactNode } from 'react';
import {
	colorTokens,
	contrastPairs,
	contrastRatio,
	spacing,
	strokes,
	typeFaces,
	typeScale,
	useTheme,
	NodeMark,
	TitleBlock,
	type ThemeChoice,
} from '@fhudson/ui';
import { TypeAndActions } from './system/TypeAndActions';
import { Structure } from './system/Structure';
import { Data } from './system/Data';
import { Symbols } from './system/Symbols';
import { Charts } from './system/Charts';
import { Figures } from './system/Figures';

const themeChoices: { value: ThemeChoice; label: string }[] = [
	{ value: 'system', label: 'System' },
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
];

const darkQuery = '(prefers-color-scheme: dark)';

/** Reads the current value of every colour token, and re-reads when the theme changes. */
function useTokenValues(choice: ThemeChoice) {
	const [values, setValues] = useState<Record<string, string>>({});
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(darkQuery);
		const read = () => {
			const styles = getComputedStyle(document.documentElement);
			setValues(
				Object.fromEntries(
					colorTokens.map((token) => [
						token.name,
						styles.getPropertyValue(token.cssVar).trim(),
					])
				)
			);
			setIsDark(choice === 'system' ? media.matches : choice === 'dark');
		};
		read();
		media.addEventListener('change', read);
		return () => {
			media.removeEventListener('change', read);
		};
	}, [choice]);

	return { values, isDark };
}

function Section({
	id,
	label,
	title,
	children,
}: {
	id: string;
	label: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section
			aria-labelledby={id}
			className="flex flex-col gap-6 border-t border-ink pt-6"
		>
			<header className="flex flex-col gap-2">
				<p className="font-data text-label uppercase tracking-widest text-ink-muted">
					{label}
				</p>
				<h2
					id={id}
					className="font-display text-h3 uppercase tracking-wide text-balance"
				>
					{title}
				</h2>
			</header>
			{children}
		</section>
	);
}

function Lamp({ ok }: { ok: boolean }) {
	return (
		<span
			className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 font-data text-label uppercase tracking-wider ${
				ok
					? 'border-verdigris text-verdigris'
					: 'border-fault text-fault'
			}`}
		>
			<span
				className={`size-2 rounded-full ${ok ? 'bg-verdigris' : 'bg-fault'}`}
			/>
			{ok ? 'Pass' : 'Fail'}
		</span>
	);
}

function SystemPage() {
	const { choice, setChoice } = useTheme();
	const { values, isDark } = useTokenValues(choice);
	const showing = isDark ? 'dark' : 'light';

	return (
		<div className="min-h-screen">
			<main
				id="main"
				className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12 sm:px-8"
			>
				<header className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<NodeMark className="h-5 w-12" />
						<span className="font-data text-label uppercase tracking-widest text-ink-muted">
							@fhudson/ui · Single Line
						</span>
					</div>
					<h1 className="font-display text-h2 uppercase tracking-wide text-balance sm:text-h1">
						Single Line
					</h1>
					<p className="max-w-[60ch] text-body text-ink-muted">
						The fhudson design system, modelled on single-line
						diagrams and engineering drawing sheets. This page shows
						its tokens as they render, in whichever theme you pick.
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<span
							id="theme-label"
							className="font-data text-label uppercase tracking-widest text-ink-muted"
						>
							Theme
						</span>
						<div
							role="group"
							aria-labelledby="theme-label"
							className="inline-flex border border-ink"
						>
							{themeChoices.map(({ value, label }) => (
								<button
									key={value}
									type="button"
									aria-pressed={choice === value}
									onClick={() => {
										setChoice(value);
									}}
									className={`cursor-pointer px-3 py-2 font-data text-label uppercase tracking-wider ${
										choice === value
											? 'bg-ink text-paper'
											: 'text-ink hover:bg-sheet'
									}`}
								>
									{label}
								</button>
							))}
						</div>
					</div>
				</header>

				<Section
					id="colour"
					label={`Colour · showing ${showing} values`}
					title="Ink and verdigris"
				>
					<ul className="flex flex-col">
						{colorTokens.map((token) => (
							<li
								key={token.name}
								className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-hairline py-3 sm:grid-cols-[40px_9rem_6rem_minmax(0,1fr)]"
							>
								<span
									className="row-span-2 size-10 border border-hairline sm:row-span-1"
									style={{
										background: `var(${token.cssVar})`,
									}}
								/>
								<span className="font-data text-small">
									{token.name}
								</span>
								<span className="font-data text-small tabular-nums text-ink-muted">
									{values[token.name]}
								</span>
								<span className="col-start-2 text-small text-ink-muted sm:col-start-auto">
									{token.use}
								</span>
							</li>
						))}
					</ul>
				</Section>

				<Section
					id="contrast"
					label={`Contrast · WCAG AA · ${showing}`}
					title="Every text pair passes"
				>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[21rem] border-collapse text-left text-small">
							<thead>
								<tr className="border-b border-ink font-data text-label uppercase tracking-wider text-ink-muted">
									<th className="py-2 pr-3 font-normal">
										Sample
									</th>
									<th className="py-2 pr-3 font-normal">
										Pair
									</th>
									<th className="py-2 pr-3 font-normal">
										Ratio
									</th>
									<th className="py-2 font-normal">Result</th>
								</tr>
							</thead>
							<tbody>
								{contrastPairs.map((pair) => {
									const fg = values[pair.fg];
									const bg = values[pair.bg];
									const ratio =
										fg && bg ? contrastRatio(fg, bg) : 0;
									return (
										<tr
											key={`${pair.fg}-${pair.bg}`}
											className="border-b border-hairline"
										>
											<td className="py-2 pr-3">
												<span
													className="inline-block border border-hairline px-3 py-1 font-semibold"
													style={{
														color: `var(--sl-${pair.fg})`,
														background: `var(--sl-${pair.bg})`,
													}}
												>
													Aa
												</span>
											</td>
											<td className="py-2 pr-3">
												<span className="font-data">
													{pair.fg} on {pair.bg}
												</span>
												<span className="block text-ink-muted">
													{pair.use}
												</span>
											</td>
											<td className="py-2 pr-3 font-data tabular-nums">
												{ratio.toFixed(2)}:1
											</td>
											<td className="py-2">
												<Lamp ok={ratio >= pair.min} />
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</Section>

				<Section id="type" label="Type" title="Three faces, one scale">
					<div className="grid gap-4 md:grid-cols-3">
						{typeFaces.map((face) => (
							<div
								key={face.role}
								className="flex flex-col gap-3 border border-hairline bg-sheet p-4"
							>
								<p className="font-data text-label uppercase tracking-widest text-ink-muted">
									{face.role}
								</p>
								<p
									className="text-h3 leading-tight"
									style={{
										fontFamily: `var(${face.cssVar})`,
									}}
								>
									{face.role === 'Display'
										? 'BOUNDARY NODE'
										: face.role === 'Body'
											? 'Grid data, explained'
											: '132 kV · 50.01 Hz'}
								</p>
								<p className="text-small text-ink-muted">
									<span className="font-data text-ink">
										{face.family}
									</span>
									<br />
									{face.use}
								</p>
							</div>
						))}
					</div>
					<ul className="flex flex-col">
						{typeScale.map((step) => {
							const isHeading = step.token.startsWith('h');
							const isLabel = step.token === 'label';
							return (
								<li
									key={step.token}
									className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-hairline py-3"
								>
									<span className="font-data text-label text-ink-muted">
										{step.token} · {step.px}
									</span>
									<span
										className={`min-w-0 leading-tight text-balance ${
											isHeading
												? 'font-display uppercase tracking-wide'
												: isLabel
													? 'font-data uppercase tracking-widest'
													: ''
										}`}
										style={{
											fontSize: `${String(step.px)}px`,
										}}
									>
										{isHeading ? 'Grid code' : step.use}
									</span>
								</li>
							);
						})}
					</ul>
				</Section>

				<Section
					id="space"
					label="Spacing and strokes"
					title="Measured, not guessed"
				>
					<div className="grid gap-10 md:grid-cols-2">
						<ul className="flex flex-col gap-2">
							{spacing.map((px) => (
								<li
									key={px}
									className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3"
								>
									<span className="font-data text-label tabular-nums text-ink-muted">
										{px}px
									</span>
									<span
										className="h-3 bg-verdigris"
										style={{ width: `${String(px)}px` }}
									/>
								</li>
							))}
						</ul>
						<ul className="flex flex-col gap-4">
							{strokes.map((stroke) => (
								<li
									key={stroke.name}
									className="flex flex-col gap-2"
								>
									<span
										className="block w-full bg-ink"
										style={{
											height: `var(${stroke.cssVar})`,
										}}
									/>
									<span className="text-small text-ink-muted">
										<span className="font-data text-ink">
											{stroke.name}
										</span>{' '}
										· {stroke.use}
									</span>
								</li>
							))}
						</ul>
					</div>
				</Section>

				<Section
					id="grid"
					label="Drawing grid"
					title="The sheet behind the work"
				>
					<div className="drawing-grid flex flex-col gap-4 border border-ink bg-paper p-6">
						<p className="max-w-[60ch] text-ui">
							A 24px grid sits behind sheets and diagrams. It is
							drawn in ink at 5.5% opacity on paper, so it reads
							as a texture rather than a pattern.
						</p>
						<NodeMark className="h-8 w-20" />
					</div>
				</Section>

				<section
					aria-labelledby="components"
					className="flex flex-col border-t border-ink pt-6"
				>
					<header className="flex flex-col gap-2">
						<p className="font-data text-label uppercase tracking-widest text-ink-muted">
							Components · Tier 1
						</p>
						<h2
							id="components"
							className="font-display text-h3 uppercase tracking-wide text-balance"
						>
							Tier 1 components
						</h2>
					</header>
					<TypeAndActions />
					<Structure />
					<Data />
					<Charts />
					<Symbols />
				</section>

				<Section
					id="figures"
					label="Figures · Boundary Node"
					title="Single Line in motion"
				>
					<p className="max-w-[60ch] text-body text-ink-muted">
						How animated, interactive and 3D figures look. Each one
						carries a title block strip, and exports to Substack in
						both themes.
					</p>
					<Figures />
				</Section>

				<TitleBlock
					fields={[
						{ label: 'Drawing', value: 'FH-SYS-001' },
						{ label: 'Phase', value: '3 · Components' },
						{ label: 'Rev', value: 'B' },
						{ label: 'Date', value: '01.10.26' },
					]}
				/>
			</main>
		</div>
	);
}

export default SystemPage;
