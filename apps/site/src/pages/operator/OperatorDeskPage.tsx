import {
	BarChart,
	Blockquote,
	EmptyState,
	LineChart,
	Link,
	List,
	ListItem,
	Panel,
	PanelBody,
	PanelHeader,
	Stat,
	Status,
	Text,
	type State,
} from '@fhudson/ui';
import { useEffect, useState } from 'react';
import { PageHeader } from '../../controlRoom/PageHeader';
import { principles } from '../../data/posts';
import { loadOuraWeek } from '../../operator/oura';
import { loadQuote } from '../../operator/quote';
import { activityLabel, loadActivities } from '../../operator/strava';
import { useFetch, type LoadState } from '../../operator/useFetch';

function greeting(hour: number) {
	if (hour >= 5 && hour < 12) return 'Good morning';
	if (hour >= 12 && hour < 17) return 'Good afternoon';
	if (hour >= 17 && hour < 21) return 'Good evening';
	return 'Good night';
}

function useLocalClock() {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date());
		}, 30_000);
		return () => {
			clearInterval(timer);
		};
	}, []);
	return now;
}

/** Oura's own bands: below 60 needs attention, below 70 is fair. */
const scoreState = (score: number | null): State | undefined =>
	score === null
		? undefined
		: score < 60
			? 'fault'
			: score < 70
				? 'isolated'
				: 'in-service';

const shortDate = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
});
const label = (key: string) =>
	key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

const dataOf = <T,>(state: LoadState<T>) =>
	state.status === 'ready' ? state.data : undefined;

/** Fixed chart heights, so each chart is the same size loading and loaded. */
const SCORES_HEIGHT = 200;
// Taller by the scores chart's legend row (13px text × 1.45 line height) and the 12px gap
// below it, so both plots end on the same line
const CONTRIBUTORS_HEIGHT = SCORES_HEIGHT + 31;
const TYPES_HEIGHT = 200;

function FeedDown({ error }: { error: Error }) {
	return (
		<div className="flex flex-col items-start gap-2">
			<Status state="fault">Feed down</Status>
			<Text variant="small" tone="muted">
				{error.message}
			</Text>
		</div>
	);
}

function HealthPanel() {
	const oura = useFetch(loadOuraWeek);
	const week = dataOf(oura);
	const loading = oura.status === 'loading';

	return (
		<Panel>
			<PanelHeader label="Health · Oura" meta="PNL 03" />
			<PanelBody className="gap-5">
				{oura.status === 'error' ? (
					<FeedDown error={oura.error} />
				) : (
					<>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							{(['readiness', 'sleep', 'activity'] as const).map(
								(key) => {
									const score = week?.today?.[key] ?? null;
									return (
										<Stat
											key={key}
											label={label(key)}
											value={score}
											state={scoreState(score)}
											note={
												loading
													? 'Loading'
													: score === null
														? 'No score yet today'
														: 'Today'
											}
										/>
									);
								}
							)}
						</div>
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
							<div className="flex min-w-0 flex-col gap-2">
								<Text variant="label">Last 8 days</Text>
								<LineChart
									label="Oura scores, last 8 days"
									loading={loading}
									categories={
										week?.days.map((d) => d.label) ?? []
									}
									series={[
										{
											id: 'readiness',
											label: 'Readiness',
											values:
												week?.days.map(
													(d) => d.readiness
												) ?? [],
										},
										{
											id: 'sleep',
											label: 'Sleep',
											values:
												week?.days.map(
													(d) => d.sleep
												) ?? [],
										},
										{
											id: 'activity',
											label: 'Activity',
											values:
												week?.days.map(
													(d) => d.activity
												) ?? [],
										},
									]}
									yDomain={[40, 100]}
									categoryLabel="Day"
									height={SCORES_HEIGHT}
								/>
							</div>
							<div className="flex min-w-0 flex-col gap-2">
								<Text variant="label">
									Readiness contributors, today
								</Text>
								{loading || week?.readinessContributors ? (
									<BarChart
										label="Readiness contributors, today"
										loading={loading}
										orientation="horizontal"
										data={Object.entries(
											week?.readinessContributors ?? {}
										)
											.sort((a, b) => b[1] - a[1])
											.map(([key, value]) => ({
												label: label(key),
												value,
											}))}
										categoryLabel="Contributor"
										height={CONTRIBUTORS_HEIGHT}
									/>
								) : (
									<EmptyState
										title="No readiness score yet today"
										description="Contributors appear after the ring syncs."
										style={{
											minHeight: CONTRIBUTORS_HEIGHT,
										}}
									/>
								)}
							</div>
						</div>
					</>
				)}
			</PanelBody>
		</Panel>
	);
}

function ActivityPanel() {
	const strava = useFetch(loadActivities);
	const activities = dataOf(strava);
	const loading = strava.status === 'loading';

	if (strava.status === 'error') {
		return (
			<Panel>
				<PanelHeader
					label="Activity · Strava"
					meta="PNL 04 · 90 days"
				/>
				<PanelBody>
					<FeedDown error={strava.error} />
				</PanelBody>
			</Panel>
		);
	}
	if (activities?.length === 0) {
		return (
			<Panel>
				<PanelHeader
					label="Activity · Strava"
					meta="PNL 04 · 90 days"
				/>
				<PanelBody>
					<EmptyState title="No activities in the last 90 days" />
				</PanelBody>
			</Panel>
		);
	}

	const byType = new Map<string, number>();
	for (const a of activities ?? [])
		byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
	const km =
		(activities ?? []).reduce((sum, a) => sum + a.distance, 0) / 1000;
	const hours =
		(activities ?? []).reduce((sum, a) => sum + a.movingTime, 0) / 3600;
	const last = activities?.[0];

	return (
		<Panel>
			<PanelHeader label="Activity · Strava" meta="PNL 04 · 90 days" />
			<PanelBody className="gap-5">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<Stat
						label="Activities"
						value={activities ? activities.length : null}
						note={
							last
								? `Last on ${shortDate.format(new Date(last.date))}`
								: 'Loading'
						}
					/>
					<Stat
						label="Distance"
						value={activities ? km.toFixed(0) : null}
						unit="km"
						note={loading ? 'Loading' : 'Last 90 days'}
					/>
					<Stat
						label="Moving time"
						value={activities ? hours.toFixed(1) : null}
						unit="h"
						note={loading ? 'Loading' : 'Last 90 days'}
					/>
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="flex min-w-0 flex-col gap-2">
						<Text variant="label">By type</Text>
						<BarChart
							label="Activities by type, last 90 days"
							loading={loading}
							orientation="horizontal"
							data={[...byType.entries()]
								.sort((a, b) => b[1] - a[1])
								.map(([type, count]) => ({
									label: activityLabel(type),
									value: count,
								}))}
							categoryLabel="Type"
							height={TYPES_HEIGHT}
						/>
					</div>
					<div className="flex min-w-0 flex-col gap-2">
						<Text variant="label">Recent</Text>
						<ul className="flex flex-col" aria-busy={loading}>
							{(
								activities ??
								Array.from({ length: 5 }, () => null)
							)
								.slice(0, 5)
								.map((a, i) => (
									<li
										key={
											a?.id ?? `placeholder-${String(i)}`
										}
										className="grid h-10 grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline last:border-b-0"
									>
										{a ? (
											<>
												<span className="font-data text-label text-ink-muted">
													{shortDate.format(
														new Date(a.date)
													)}
												</span>
												<span className="min-w-0 truncate text-ui">
													{a.name}
													<span className="text-ink-muted">
														{' '}
														·{' '}
														{activityLabel(a.type)}
													</span>
												</span>
												<span className="font-data text-small tabular-nums text-ink-muted">
													{a.distance > 0
														? `${(a.distance / 1000).toFixed(1)} km`
														: `${String(Math.round(a.movingTime / 60))} min`}
												</span>
											</>
										) : (
											<span
												aria-hidden="true"
												className="col-span-3 h-2 w-2/3 bg-hairline"
											/>
										)}
									</li>
								))}
						</ul>
					</div>
				</div>
			</PanelBody>
		</Panel>
	);
}

/** Finn's own desk: the day's quote, health, activity and principles. */
function OperatorDeskPage() {
	const now = useLocalClock();
	const quote = useFetch(loadQuote);
	const time = now.toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<>
			<PageHeader
				panel={`PNL 01 · Operator desk · ${time}`}
				title={greeting(now.getHours())}
			/>
			<Panel>
				<PanelHeader label="Quote of the day" meta="PNL 02" />
				{/* Room for a two-line quote and its attribution, so it rarely moves */}
				<PanelBody className="min-h-32 justify-center">
					{quote.status === 'error' ? (
						<FeedDown error={quote.error} />
					) : quote.status === 'loading' ? (
						<Text variant="label" aria-busy="true">
							Loading quote
						</Text>
					) : (
						<Blockquote attribution={quote.data.author}>
							{quote.data.text}
						</Blockquote>
					)}
				</PanelBody>
			</Panel>
			<HealthPanel />
			<ActivityPanel />
			<Panel>
				<PanelHeader label="Principles" meta="PNL 05" />
				<PanelBody>
					<List>
						{principles.map((p) => (
							<ListItem key={p.slug}>
								<Link href={`/vault/${p.slug}`}>{p.title}</Link>
							</ListItem>
						))}
					</List>
				</PanelBody>
			</Panel>
		</>
	);
}

export default OperatorDeskPage;
