import { useEffect, useState } from 'react';

type ReadinessData = {
	score: number;
};

type SleepData = {
	score: number;
};

type ActivityData = {
	score: number;
};

type OuraData = {
	readiness: ReadinessData;
	sleep: SleepData;
	activity: ActivityData;
};

type OuraResponse = {
	date: string;
	data: {
		readiness: {
			data: ReadinessData[];
		};
		sleep: {
			data: SleepData[];
		};
		activity: {
			data: ActivityData[];
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
				readiness: { score: 0 },
				sleep: { score: 0 },
				activity: { score: 0 },
			});
		});
	}, []);
	return (
		<div>
			<p className="font-bold">Readiness: {data?.readiness.score}</p>
			<p className="font-bold">Sleep: {data?.sleep.score}</p>
			<p className="font-bold">Activity: {data?.activity.score}</p>
		</div>
	);
};

export default OuraData;
