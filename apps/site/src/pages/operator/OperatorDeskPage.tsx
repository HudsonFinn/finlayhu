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
	Spinner,
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

/** Loading and failure states shared by every panel on the desk. */
function Loading<T>({
	state,
	children,
}: {
	state: LoadState<T>;
	children: (data: T) => React.ReactNode;
}) {
	if (state.status === 'loading') return <Spinner label="Loading" />;
	if (state.status === 'error')
		return (
			<div className="flex flex-col items-start gap-2">
				<Status state="fault">Feed down</Status>
				<Text variant="small" tone="muted">
					{state.error.message}
				</Text>
			</div>
		);
	return <>{children(state.data)}</>;
}

function HealthPanel() {
	const oura = useFetch(loadOuraWeek);
	return (
		<Panel>
			<PanelHeader label="Health · Oura" meta="PNL 03" />
			<PanelBody className="gap-5">
				<Loading state={oura}>
					{({ days, today, readinessContributors }) => (
						<>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								{(
									['readiness', 'sleep', 'activity'] as const
								).map((key) => (
									<Stat
										key={key}
										label={label(key)}
										value={today?.[key] ?? null}
										state={scoreState(today?.[key] ?? null)}
										note={
											today?.[key] == null
												? 'No score yet today'
												: 'Today'
										}
									/>
								))}
							</div>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
								<div className="flex min-w-0 flex-col gap-2">
									<Text variant="label">Last 8 days</Text>
									<LineChart
										label="Oura scores, last 8 days"
										categories={days.map((d) => d.label)}
										series={[
											{
												id: 'readiness',
												label: 'Readiness',
												values: days.map(
													(d) => d.readiness
												),
											},
											{
												id: 'sleep',
												label: 'Sleep',
												values: days.map(
													(d) => d.sleep
												),
											},
											{
												id: 'activity',
												label: 'Activity',
												values: days.map(
													(d) => d.activity
												),
											},
										]}
										yDomain={[40, 100]}
										categoryLabel="Day"
									/>
								</div>
								<div className="flex min-w-0 flex-col gap-2">
									<Text variant="label">
										Readiness contributors, today
									</Text>
									{readinessContributors ? (
										<BarChart
											label="Readiness contributors, today"
											orientation="horizontal"
											data={Object.entries(
												readinessContributors
											)
												.sort((a, b) => b[1] - a[1])
												.map(([key, value]) => ({
													label: label(key),
													value,
												}))}
											categoryLabel="Contributor"
										/>
									) : (
										<EmptyState
											title="No readiness score yet today"
											description="Contributors appear after the ring syncs."
										/>
									)}
								</div>
							</div>
						</>
					)}
				</Loading>
			</PanelBody>
		</Panel>
	);
}

function ActivityPanel() {
	const strava = useFetch(loadActivities);
	return (
		<Panel>
			<PanelHeader label="Activity · Strava" meta="PNL 04 · 90 days" />
			<PanelBody className="gap-5">
				<Loading state={strava}>
					{(activities) => {
						if (activities.length === 0)
							return (
								<EmptyState title="No activities in the last 90 days" />
							);
						const byType = new Map<string, number>();
						for (const a of activities)
							byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
						const km =
							activities.reduce((sum, a) => sum + a.distance, 0) /
							1000;
						const hours =
							activities.reduce(
								(sum, a) => sum + a.movingTime,
								0
							) / 3600;
						// Newest first, and the list isn't empty here
						const last = activities[0];
						return (
							<>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
									<Stat
										label="Activities"
										value={activities.length}
										note={`Last on ${shortDate.format(new Date(last.date))}`}
									/>
									<Stat
										label="Distance"
										value={km.toFixed(0)}
										unit="km"
									/>
									<Stat
										label="Moving time"
										value={hours.toFixed(1)}
										unit="h"
									/>
								</div>
								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
									<div className="flex min-w-0 flex-col gap-2">
										<Text variant="label">By type</Text>
										<BarChart
											label="Activities by type, last 90 days"
											orientation="horizontal"
											data={[...byType.entries()]
												.sort((a, b) => b[1] - a[1])
												.map(([type, count]) => ({
													label: activityLabel(type),
													value: count,
												}))}
											categoryLabel="Type"
										/>
									</div>
									<div className="flex min-w-0 flex-col gap-2">
										<Text variant="label">Recent</Text>
										<ul className="flex flex-col">
											{activities.slice(0, 5).map((a) => (
												<li
													key={a.id}
													className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-hairline py-2 last:border-b-0"
												>
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
															{activityLabel(
																a.type
															)}
														</span>
													</span>
													<span className="font-data text-small tabular-nums text-ink-muted">
														{a.distance > 0
															? `${(a.distance / 1000).toFixed(1)} km`
															: `${String(Math.round(a.movingTime / 60))} min`}
													</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							</>
						);
					}}
				</Loading>
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
				<PanelBody>
					<Loading state={quote}>
						{(q) => (
							<Blockquote attribution={q.author}>
								{q.text}
							</Blockquote>
						)}
					</Loading>
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
