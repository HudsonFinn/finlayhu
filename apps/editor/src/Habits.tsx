import { Panel, PanelBody, PanelHeader, Text } from '@fhudson/ui';
import type { ReviewRecord } from './api';
import { rules } from './rules';

/** How often you catch what each rule flags, across every pass so far. */
export function Habits({ reviews }: { reviews: ReviewRecord[] }) {
	const rows = rules
		.filter((rule) => rule.check)
		.map((rule) => {
			const passes = reviews.filter((r) => r.rule === rule.id);
			const both = passes.reduce((sum, r) => sum + r.both, 0);
			const flagged = passes.reduce(
				(sum, r) => sum + r.both + r.ruleOnly,
				0
			);
			const last = passes.at(-1);
			// Of the passes you fixed, how many you left with nothing flagged
			const fixed = passes.filter((r) => r.left !== undefined);
			const cleared = fixed.filter((r) => r.left === 0).length;
			return {
				rule,
				passes: passes.length,
				both,
				flagged,
				last,
				fixed: fixed.length,
				cleared,
			};
		});

	return (
		<Panel className="shrink-0">
			<PanelHeader
				label="Habits"
				meta={`${String(reviews.length)} ${reviews.length === 1 ? 'pass' : 'passes'}`}
			/>
			<PanelBody>
				{reviews.length === 0 ? (
					<Text variant="small" tone="muted">
						Finish a review pass to start your record. Each rule
						shows how much of what it flags you catch yourself.
					</Text>
				) : (
					<table className="w-full text-small">
						<thead>
							<tr className="font-data text-label uppercase tracking-widest text-ink-muted">
								<th className="pb-2 text-left font-normal">
									Rule
								</th>
								<th className="pb-2 text-right font-normal">
									Last
								</th>
								<th className="pb-2 text-right font-normal">
									Caught
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map(
								({ rule, passes, both, flagged, last }) => (
									<tr
										key={rule.id}
										className="border-t border-hairline"
									>
										<td className="py-1.5 text-ink">
											{rule.title}
										</td>
										<td className="py-1.5 text-right font-data text-ink-muted">
											{last
												? `${String(last.both)}/${String(last.both + last.ruleOnly)}`
												: '–'}
										</td>
										<td className="py-1.5 text-right font-data text-ink">
											{passes && flagged
												? `${String(Math.round((both / flagged) * 100))}%`
												: '–'}
										</td>
									</tr>
								)
							)}
						</tbody>
					</table>
				)}
			</PanelBody>
		</Panel>
	);
}
