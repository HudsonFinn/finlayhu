import { useEffect, useState } from 'react';

type ReadinessContributors = {
	activity_balance: number;
	body_temperature: number;
	hrv_balance: number;
	previous_day_activity: number;
	previous_night: number;
	recovery_index: number;
	resting_heart_rate: number;
	sleep_balance: number;
	sleep_regularity: number;
};

type ReadinessData = {
	id: string;
	contributors: ReadinessContributors;
	day: string;
	score: number;
	temperature_deviation: number;
	temperature_trend_deviation: number;
	timestamp: string;
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

type SleepData = {
	id: string;
	contributors: SleepContributors;
	day: string;
	score: number;
	timestamp: string;
};

type ActivityContributors = {
	meet_daily_targets: number;
	move_every_hour: number;
	recovery_time: number;
	stay_active: number;
	training_frequency: number;
	training_volume: number;
};

type MetData = {
	interval: number;
	items: number[];
	timestamp: string;
};

type ActivityData = {
	id: string;
	active_calories: number;
	average_met_minutes: number;
	class_5_min: string;
	contributors: ActivityContributors;
	day: string;
	equivalent_walking_distance: number;
	high_activity_met_minutes: number;
	high_activity_time: number;
	inactivity_alerts: number;
	low_activity_met_minutes: number;
	low_activity_time: number;
	medium_activity_met_minutes: number;
	medium_activity_time: number;
	met: MetData;
	meters_to_target: number;
	non_wear_time: number;
	resting_time: number;
	score: number;
	sedentary_met_minutes: number;
	sedentary_time: number;
	steps: number;
	target_calories: number;
	target_meters: number;
	timestamp: string;
	total_calories: number;
};

type OuraData = {
	readiness: ReadinessData | null;
	sleep: SleepData | null;
	activity: ActivityData | null;
};

type OuraResponse = {
	date: string;
	data: {
		readiness: {
			data: ReadinessData[];
			next_token: string | null;
		};
		sleep: {
			data: SleepData[];
			next_token: string | null;
		};
		activity: {
			data: ActivityData[];
			next_token: string | null;
		};
	};
};

const OuraData = () => {
	const [data, setData] = useState<OuraData>();
	useEffect(() => {
		const getData = async () => {
			const response = await fetch('https://fhudson.com/api/oura');
			const json = (await response.json()) as OuraResponse;

			const readiness = json.data.readiness.data[0];
			const sleep = json.data.sleep.data[0];
			const activity = json.data.activity.data[0];
			setData({
				readiness,
				sleep,
				activity,
			});
		};

		getData().catch((e: unknown) => {
			console.log(`Error getting Oura data ${String(e)}`);
			setData({
				readiness: null,
				sleep: null,
				activity: null,
			});
		});
	}, []);
	return (
		<div>
			<p className="font-bold">Readiness: {data?.readiness?.score}</p>
			<p className="font-bold">Sleep: {data?.sleep?.score}</p>
			<p className="font-bold">Activity: {data?.activity?.score}</p>
		</div>
	);
};

export default OuraData;
