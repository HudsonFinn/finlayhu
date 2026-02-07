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
	latestReadinessContributors: ReadinessContributors | null;
	latestSleepContributors: SleepContributors | null;
	latestActivityContributors: ActivityContributors | null;
};

type MetricType = 'readiness' | 'sleep' | 'activity';

const formatDate = (dateStr: string): string => {
	const date = new Date(dateStr);
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

const getDateRange = (): { start: string; end: string } => {
	const end = new Date();
	const start = new Date();
	start.setDate(start.getDate() - 7);

	const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
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

			const json = (await response.json()) as OuraRangeResponse;

			const sortedDates = Object.keys(json.dates).sort();

			const readiness: ChartData[] = [];
			const sleep: ChartData[] = [];
			const activity: ChartData[] = [];

			let latestReadinessContributors: ReadinessContributors | null =
				null;
			let latestSleepContributors: SleepContributors | null = null;
			let latestActivityContributors: ActivityContributors | null = null;

			for (const date of sortedDates) {
				const dayData = json.dates[date];
				const label = formatDate(date);

				const readinessData = dayData.readiness?.data[0];
				const sleepData = dayData.sleep?.data[0];
				const activityData = dayData.activity?.data[0];

				if (readinessData?.score) {
					readiness.push({ label, value: readinessData.score });
					latestReadinessContributors = readinessData.contributors;
				}
				if (sleepData?.score) {
					sleep.push({ label, value: sleepData.score });
					latestSleepContributors = sleepData.contributors;
				}
				if (activityData?.score) {
					activity.push({ label, value: activityData.score });
					latestActivityContributors = activityData.contributors;
				}
			}

			setData({
				readiness,
				sleep,
				activity,
				latestReadinessContributors,
				latestSleepContributors,
				latestActivityContributors,
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

	const latestReadiness = data.readiness[data.readiness.length - 1]?.value;
	const latestSleep = data.sleep[data.sleep.length - 1]?.value;
	const latestActivity = data.activity[data.activity.length - 1]?.value;

	const toggleExpanded = (metric: MetricType) => {
		setExpanded(expanded === metric ? null : metric);
	};

	const renderContributors = () => {
		if (!expanded) return null;

		let contributors: Record<string, number> | null = null;

		if (expanded === 'readiness' && data.latestReadinessContributors) {
			contributors = data.latestReadinessContributors;
		} else if (expanded === 'sleep' && data.latestSleepContributors) {
			contributors = data.latestSleepContributors;
		} else if (expanded === 'activity' && data.latestActivityContributors) {
			contributors = data.latestActivityContributors;
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
								color: latestReadiness
									? getScoreColor(latestReadiness)
									: undefined,
							}}
						>
							{latestReadiness}
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
								color: latestSleep
									? getScoreColor(latestSleep)
									: undefined,
							}}
						>
							{latestSleep}
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
								color: latestActivity
									? getScoreColor(latestActivity)
									: undefined,
							}}
						>
							{latestActivity}
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
