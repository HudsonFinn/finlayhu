import {
	Button,
	Panel,
	PanelBody,
	PanelHeader,
	Stat,
	Text,
	cn,
} from '@fhudson/ui';
import type { Comparison } from './review';
import { ruleById, rules, type Flag, type Rule, type Span } from './rules';
import type { Session } from './session';

const excerpt = (body: string, span: Span) => {
	const text = body.slice(span.start, span.end).replace(/\s+/g, ' ');
	return text.length > 90 ? `${text.slice(0, 88)}…` : text;
};

const STAGES = {
	brief: 'Brief',
	marking: 'Marking',
	compare: 'Compare',
	fixing: 'Fixing',
	done: 'Summary',
} as const;

function Label({ children }: { children: string }) {
	return (
		<span className="font-data text-label uppercase tracking-widest text-ink-muted">
			{children}
		</span>
	);
}

function Found({
	label,
	tone,
	items,
	onPick,
}: {
	label: string;
	tone: string;
	items: { key: number; text: string; note?: string }[];
	/** Makes each item a button, e.g. to jump to it. */
	onPick?: (key: number) => void;
}) {
	if (items.length === 0) return null;
	return (
		<div className="flex flex-col gap-2">
			<Label>{label}</Label>
			<ul className="flex flex-col gap-2">
				{items.map((item) => {
					const content = (
						<>
							<span className="block text-small text-ink">
								{item.text}
							</span>
							{item.note && (
								<span className="block font-data text-label text-ink-muted">
									{item.note}
								</span>
							)}
						</>
					);
					return (
						<li
							key={item.key}
							className={cn('border-l-[3px]', tone)}
						>
							{onPick ? (
								<button
									type="button"
									onClick={() => {
										onPick(item.key);
									}}
									className="w-full cursor-pointer px-3 py-1 text-left hover:bg-paper focus-visible:outline-solid focus-visible:outline-[1.5px] focus-visible:outline-verdigris"
								>
									{content}
								</button>
							) : (
								<div className="px-3 py-1">{content}</div>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function Brief({ rule }: { rule: Rule }) {
	return (
		<>
			<div className="flex flex-col gap-2">
				<Label>Why</Label>
				<Text variant="small" tone="muted">
					{rule.why}
				</Text>
			</div>
			<div className="flex flex-col gap-2">
				<Label>Example</Label>
				<p className="border-l-[3px] border-fault pl-3 text-small text-ink-muted">
					{rule.example.before}
				</p>
				<p className="border-l-[3px] border-verdigris pl-3 text-small text-ink">
					{rule.example.after}
				</p>
			</div>
			{!rule.check && (
				<Text variant="small" tone="muted">
					This pass needs judgment, so there’s no automatic check yet.
					Mark what you find, then ask Claude to review the same pass.
				</Text>
			)}
		</>
	);
}

/** Before a review: run every checked pass, or pick one. */
function Start({ onRun }: { onRun: (queue: string[]) => void }) {
	const checked = rules.filter((r) => r.check);
	return (
		<Panel className="shrink-0">
			<PanelHeader label="Review" />
			<PanelBody className="gap-5">
				<Text variant="small" tone="muted">
					Each pass hunts for one thing. Read the brief, mark what you
					find, see what the rule found, then fix it in the draft
					while the flags clear.
				</Text>
				<Button
					onPress={() => {
						onRun(checked.map((r) => r.id));
					}}
				>
					Review this post · {checked.length} passes
				</Button>
				<div className="flex flex-col gap-2">
					<Label>One pass</Label>
					<div className="flex flex-wrap gap-2">
						{rules.map((rule) => (
							<Button
								key={rule.id}
								size="sm"
								variant="ghost"
								onPress={() => {
									onRun([rule.id]);
								}}
							>
								{rule.title}
							</Button>
						))}
					</div>
				</div>
			</PanelBody>
		</Panel>
	);
}

/** One pass at a time: brief, mark it yourself, compare with the rule, then fix. */
export function ReviewPanel({
	session,
	body,
	comparison,
	remaining,
	file,
	onRun,
	onMark,
	onReveal,
	onFix,
	onRemark,
	onNext,
	onStop,
	onJump,
}: {
	session: Session | null;
	body: string;
	/** Set in the compare stage of a checked rule. */
	comparison: Comparison | null;
	/** The current rule's flags on the text as it is now. */
	remaining: Flag[];
	file: string;
	onRun: (queue: string[]) => void;
	onMark: () => void;
	onReveal: () => void;
	onFix: () => void;
	onRemark: () => void;
	onNext: () => void;
	onStop: () => void;
	onJump: (flag: Flag) => void;
}) {
	if (!session) return <Start onRun={onRun} />;

	const rule = ruleById(session.queue[session.index]);
	const last = session.index === session.queue.length - 1;
	const { stage, marks } = session;
	const result = session.results.find((r) => r.rule === rule?.id);
	const flagged = result ? result.both + result.ruleOnly : 0;

	return (
		<Panel className="shrink-0">
			<PanelHeader
				label={
					stage === 'done'
						? 'Review done'
						: `Pass ${String(session.index + 1)} of ${String(session.queue.length)}`
				}
				meta={STAGES[stage]}
			/>
			<PanelBody className="gap-5">
				{session.queue.length > 1 && (
					<div className="flex gap-1" aria-hidden="true">
						{session.queue.map((id, i) => (
							<span
								key={id}
								className={cn(
									'h-1 flex-1',
									stage === 'done' || i < session.index
										? 'bg-verdigris'
										: i === session.index
											? 'bg-ink'
											: 'bg-hairline'
								)}
							/>
						))}
					</div>
				)}

				{stage === 'done' && (
					<>
						<table className="w-full text-small">
							<thead>
								<tr className="font-data text-label uppercase tracking-widest text-ink-muted">
									<th className="pb-2 text-left font-normal">
										Pass
									</th>
									<th className="pb-2 text-right font-normal">
										Caught
									</th>
									<th className="pb-2 text-right font-normal">
										Left
									</th>
								</tr>
							</thead>
							<tbody>
								{session.results.map((r) => (
									<tr
										key={r.at}
										className="border-t border-hairline"
									>
										<td className="py-1.5 text-ink">
											{ruleById(r.rule)?.title ?? r.rule}
										</td>
										<td className="py-1.5 text-right font-data text-ink">
											{String(r.both)}/
											{String(r.both + r.ruleOnly)}
										</td>
										<td
											className={cn(
												'py-1.5 text-right font-data',
												r.left
													? 'text-fault'
													: 'text-verdigris'
											)}
										>
											{r.left ?? '–'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Button onPress={onStop}>Back to writing</Button>
					</>
				)}

				{rule && stage !== 'done' && (
					<>
						<div className="flex flex-col gap-2">
							<span className="font-display text-h3 text-ink">
								{rule.title}
							</span>
							<Text className="text-ink">{rule.lookFor}</Text>
						</div>

						{stage === 'brief' && (
							<>
								<Brief rule={rule} />
								<Button onPress={onMark}>Start marking</Button>
							</>
						)}

						{stage === 'marking' && (
							<>
								<Text variant="small" tone="muted">
									Select text to mark it. Click a mark to
									remove it. Marking the sentence is enough.
								</Text>
								<span className="font-data text-small text-ink">
									{marks.length} marked
								</span>
								<Button onPress={onReveal}>
									{rule.check ? 'Done: show me' : 'Done'}
								</Button>
							</>
						)}

						{stage === 'compare' && comparison && (
							<>
								<div className="grid grid-cols-3 gap-2">
									<Stat
										label="Both"
										value={comparison.both.length}
									/>
									<Stat
										label="Rule only"
										value={comparison.ruleOnly.length}
									/>
									<Stat
										label="You only"
										value={comparison.youOnly.length}
									/>
								</div>
								<Text variant="small" tone="muted">
									{flagged === 0
										? 'The rule found nothing in this post.'
										: `You found ${String(comparison.both.length)} of the ${String(flagged)} the rule flagged.`}{' '}
									“You only” isn’t wrong: the checks are
									simple, and you’re the author.
								</Text>
								<Found
									label="Rule only"
									tone="border-fault"
									items={comparison.ruleOnly.map((f) => ({
										key: f.start,
										text: excerpt(body, f),
										note: f.note,
									}))}
								/>
								<Found
									label="Both"
									tone="border-verdigris"
									items={comparison.both.map((f) => ({
										key: f.start,
										text: excerpt(body, f),
										note: f.note,
									}))}
								/>
								<Found
									label="You only"
									tone="border-ink-muted"
									items={comparison.youOnly.map((m) => ({
										key: m.start,
										text: excerpt(body, m),
									}))}
								/>
								<div className="flex flex-wrap gap-2">
									{flagged > 0 ? (
										<Button onPress={onFix}>
											Fix these
										</Button>
									) : (
										<Button onPress={onNext}>
											{last
												? 'Finish review'
												: 'Next pass'}
										</Button>
									)}
									<Button variant="ghost" onPress={onRemark}>
										Mark again
									</Button>
								</div>
							</>
						)}

						{stage === 'compare' && !comparison && (
							<>
								<Text variant="small" tone="muted">
									You marked {marks.length}. Ask Claude in the
									terminal to review{' '}
									<code className="font-data">{file}</code>{' '}
									for “{rule.title}” and compare.
								</Text>
								<Found
									label="Your marks"
									tone="border-amber"
									items={marks.map((m) => ({
										key: m.start,
										text: excerpt(body, m),
									}))}
								/>
								<Button onPress={onFix}>Fix them</Button>
							</>
						)}

						{stage === 'fixing' && rule.check && (
							<>
								<Stat
									label="Left to fix"
									value={remaining.length}
									state={
										remaining.length === 0
											? 'in-service'
											: 'fault'
									}
									note={
										remaining.length === 0
											? 'All clear'
											: `of ${String(flagged)} flagged. They clear as you fix them.`
									}
								/>
								<Found
									label="Still flagged · click to jump"
									tone="border-fault"
									items={remaining.map((f) => ({
										key: f.start,
										text: excerpt(body, f),
										note: f.note,
									}))}
									onPick={(start) => {
										const flag = remaining.find(
											(f) => f.start === start
										);
										if (flag) onJump(flag);
									}}
								/>
								<Text variant="small" tone="muted">
									Not every flag needs fixing: a hedge can be
									honest. Move on when you’re happy.
								</Text>
							</>
						)}

						{stage === 'fixing' && !rule.check && (
							<>
								<Found
									label="What you marked"
									tone="border-amber"
									items={marks.map((m) => ({
										key: m.start,
										text: excerpt(
											session.markedBody ?? body,
											m
										),
									}))}
								/>
								<Text variant="small" tone="muted">
									Fix them in the draft, then move on.
								</Text>
							</>
						)}

						{stage === 'fixing' && (
							<Button
								variant={
									rule.check && remaining.length > 0
										? 'ghost'
										: 'primary'
								}
								onPress={onNext}
							>
								{last ? 'Finish review' : 'Next pass'}
							</Button>
						)}

						<Button variant="quiet" size="sm" onPress={onStop}>
							Stop review
						</Button>
					</>
				)}
			</PanelBody>
		</Panel>
	);
}
