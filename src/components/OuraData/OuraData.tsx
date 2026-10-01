import { useEffect, useState } from 'react';
import {
	LineChart,
	P,
	Small,
	Preview,
	PreviewHeader,
	PreviewContent,
} from 'chalkboard-ui';

type ReadinessContributors = {
	activity_balance: number;
	body_temperature: number;
	hrv_balance: number;
	previous_day_activity: number;
	previous_night: number;
	recovery_index: number;
	resting_heart_rate: number;
	sleep_balance: number;
};

type SleepContributors = {
	deep_sleep: number;
	efficiency: number;
	latency: number;
	rem_sleep: number;
	restfulness: number;
	timing: number;
	total_sleep: number;
};

type ActivityContributors = {
	meet_daily_targets: number;
	move_every_hour: number;
	recovery_time: number;
	stay_active: number;
	training_frequency: number;
	training_volume: number;
};

type OuraRangeResponse = {
	start: string;
	end: string;
	dates: Record<
		string,
		{
			readiness?: {
				data: { score: number; contributors: ReadinessContributors }[];
			};
			sleep?: {
				data: { score: number; contributors: SleepContributors }[];
			};
			activity?: {
				data: { score: number; contributors: ActivityContributors }[];
			};
		}
	>;
};

type ChartData = {
	label: string;
	value: number;
};

type OuraChartData = {
	readiness: ChartData[];
	sleep: ChartData[];
	activity: ChartData[];
	// Tiles only show today's scores, so a day without the ring reads as empty
	todayReadiness: number | null;
	todaySleep: number | null;
	todayActivity: number | null;
	todayReadinessContributors: ReadinessContributors | null;
	todaySleepContributors: SleepContributors | null;
	todayActivityContributors: ActivityContributors | null;
};

type MetricType = 'readiness' | 'sleep' | 'activity';

// Parse YYYY-MM-DD as a local date; new Date('YYYY-MM-DD') is UTC and can shift a day
const formatDate = (dateStr: string): string => {
	const [year, month, day] = dateStr.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLabel = (key: string): string => {
	return key
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const getScoreColor = (value: number): string => {
	if (value < 60) return '#ef4444'; // red
	if (value < 70) return '#f59e0b'; // amber
	if (value < 85) return '#10b981'; // emerald
	return '#22c55e'; // green
};

const formatYYYYMMDD = (d: Date): string =>
	[
		d.getFullYear(),
		String(d.getMonth() + 1).padStart(2, '0'),
		String(d.getDate()).padStart(2, '0'),
	].join('-');

const getDateRange = (): { start: string; end: string } => {
	const end = new Date();
	const start = new Date();
	start.setDate(start.getDate() - 7);

	return {
		start: formatYYYYMMDD(start),
		end: formatYYYYMMDD(end),
	};
};

const MetricItem = ({ label, value }: { label: string; value: number }) => (
	<div className="flex justify-between items-center py-1">
		<Small>{label}</Small>
		<Small
			className="font-semibold"
			style={{ color: getScoreColor(value) }}
		>
			{value}
		</Small>
	</div>
);

const OuraData = () => {
	const [data, setData] = useState<OuraChartData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<MetricType | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const { start, end } = getDateRange();
			const response = await fetch(
				`https://fhudson.com/api/oura?start=${start}&end=${end}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch Oura data');
			}

			const json = (await response.json()) as Partial<OuraRangeResponse>;

			if (!json.dates || typeof json.dates !== 'object') {
				throw new Error(
					'Unexpected Oura response shape: missing "dates" (are query params reaching the API?)'
				);
			}

			const sortedDates = Object.keys(json.dates).sort();

			const readiness: ChartData[] = [];
			const sleep: ChartData[] = [];
			const activity: ChartData[] = [];

			const today = formatYYYYMMDD(new Date());
			// No entry for today when the ring hasn't synced yet
			const todayData = json.dates[today] as
				| OuraRangeResponse['dates'][string]
				| undefined;
			const todayReadinessData = todayData?.readiness?.data[0];
			const todaySleepData = todayData?.sleep?.data[0];
			const todayActivityData = todayData?.activity?.data[0];

			for (const date of sortedDates) {
				const dayData = json.dates[date];
				const label = formatDate(date);

				const readinessData = dayData.readiness?.data[0];
				const sleepData = dayData.sleep?.data[0];
				const activityData = dayData.activity?.data[0];

				if (readinessData?.score) {
					readiness.push({ label, value: readinessData.score });
				}
				if (sleepData?.score) {
					sleep.push({ label, value: sleepData.score });
				}
				if (activityData?.score) {
					activity.push({ label, value: activityData.score });
				}
			}

			setData({
				readiness,
				sleep,
				activity,
				todayReadiness: todayReadinessData?.score ?? null,
				todaySleep: todaySleepData?.score ?? null,
				todayActivity: todayActivityData?.score ?? null,
				todayReadinessContributors:
					todayReadinessData?.contributors ?? null,
				todaySleepContributors: todaySleepData?.contributors ?? null,
				todayActivityContributors:
					todayActivityData?.contributors ?? null,
			});
			setLoading(false);
		};

		fetchData().catch((e: unknown) => {
			console.error('Error fetching Oura data:', e);
			setError('Failed to load health data');
			setLoading(false);
		});
	}, []);

	if (loading) {
		return <P className="text-center">Loading health data...</P>;
	}

	if (error || !data) {
		return <P className="text-center">{error || 'No data available'}</P>;
	}

	if (
		data.readiness.length === 0 &&
		data.sleep.length === 0 &&
		data.activity.length === 0
	) {
		return <P className="text-center">No health data in the last week</P>;
	}

	const toggleExpanded = (metric: MetricType) => {
		setExpanded(expanded === metric ? null : metric);
	};

	const renderContributors = () => {
		if (!expanded) return null;

		let contributors: Record<string, number> | null = null;

		if (expanded === 'readiness' && data.todayReadinessContributors) {
			contributors = data.todayReadinessContributors;
		} else if (expanded === 'sleep' && data.todaySleepContributors) {
			contributors = data.todaySleepContributors;
		} else if (expanded === 'activity' && data.todayActivityContributors) {
			contributors = data.todayActivityContributors;
		}

		if (!contributors) return null;

		const entries = Object.entries(contributors);
		const midpoint = Math.ceil(entries.length / 2);
		const leftColumn = entries.slice(0, midpoint);
		const rightColumn = entries.slice(midpoint);

		return (
			<div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-4 pt-4 border-t border-chalkboard-border">
				<div>
					{leftColumn.map(([key, value]) => (
						<MetricItem
							key={key}
							label={formatLabel(key)}
							value={value}
						/>
					))}
				</div>
				<div>
					{rightColumn.map(([key, value]) => (
						<MetricItem
							key={key}
							label={formatLabel(key)}
							value={value}
						/>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-3 gap-4">
				<Preview
					onClick={() => {
						toggleExpanded('readiness');
					}}
				>
					<PreviewHeader title="Readiness" showArrow={false} />
					<PreviewContent>
						<P
							className="text-3xl font-bold"
							style={{
								color: data.todayReadiness
									? getScoreColor(data.todayReadiness)
									: undefined,
							}}
						>
							{data.todayReadiness ?? '–'}
						</P>
					</PreviewContent>
				</Preview>

				<Preview
					onClick={() => {
						toggleExpanded('sleep');
					}}
				>
					<PreviewHeader title="Sleep" showArrow={false} />
					<PreviewContent>
						<P
							className="text-3xl font-bold"
							style={{
								color: data.todaySleep
									? getScoreColor(data.todaySleep)
									: undefined,
							}}
						>
							{data.todaySleep ?? '–'}
						</P>
					</PreviewContent>
				</Preview>

				<Preview
					onClick={() => {
						toggleExpanded('activity');
					}}
				>
					<PreviewHeader title="Activity" showArrow={false} />
					<PreviewContent>
						<P
							className="text-3xl font-bold"
							style={{
								color: data.todayActivity
									? getScoreColor(data.todayActivity)
									: undefined,
							}}
						>
							{data.todayActivity ?? '–'}
						</P>
					</PreviewContent>
				</Preview>
			</div>

			{expanded && (
				<div className="border border-chalkboard-border rounded-lg p-6">
					<LineChart
						data={data[expanded]}
						height={200}
						smooth
						showArea
					/>
					{renderContributors()}
				</div>
			)}
		</div>
	);
};

export default OuraData;
