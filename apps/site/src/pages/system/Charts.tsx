import {
	AreaChart,
	BarChart,
	Heatmap,
	LineChart,
	Meter,
	ScatterChart,
	Stat,
	Text,
} from '@fhudson/ui';
import { Demo, Example } from './Demo';

// Real readiness scores from the Oura API, 24 Sep to 1 Oct 2026. null = ring not worn.
const readiness = [
	{ label: '24 Sep', value: 75 },
	{ label: '25 Sep', value: 73 },
	{ label: '26 Sep', value: null },
	{ label: '27 Sep', value: 88 },
	{ label: '28 Sep', value: 80 },
	{ label: '29 Sep', value: null },
	{ label: '30 Sep', value: null },
	{ label: '1 Oct', value: null },
];

// Everything below is illustrative: shaped like GB grid data, but generated, not measured.
const round1 = (v: number) => Math.round(v * 10) / 10;
const hours = Array.from(
	{ length: 24 },
	(_, h) => `${String(h).padStart(2, '0')}:00`
);
const wave = (h: number, peak: number, width = 1) =>
	Math.cos(((h - peak) / 24) * 2 * Math.PI * width);

const mix = [
	{ id: 'nuclear', label: 'Nuclear', values: hours.map(() => 4.1) },
	{
		id: 'wind',
		label: 'Wind',
		values: hours.map((_, h) => round1(9 + 3 * Math.sin(h / 4))),
	},
	{
		id: 'solar',
		label: 'Solar',
		values: hours.map((_, h) => round1(Math.max(0, 7 * wave(h, 13)))),
	},
	{
		id: 'gas',
		label: 'Gas',
		values: hours.map((_, h) =>
			round1(Math.max(1, 6 + 4 * wave(h, 18) - 2 * Math.sin(h / 4)))
		),
	},
	{
		id: 'imports',
		label: 'Imports',
		values: hours.map((_, h) => round1(3 + wave(h, 2))),
	},
];

const price = hours.map((label, h) => ({
	label,
	value: Math.round(62 + 38 * wave(h, 18) - 25 * Math.max(0, wave(h, 13))),
}));

const output = [
	{ id: 'wind', label: 'Wind', values: mix[1]?.values ?? [] },
	{ id: 'solar', label: 'Solar', values: mix[2]?.values ?? [] },
];

const substations = [
	'Alder Road',
	'Brook Lane',
	'Cross Street',
	'Dunmore',
	'Elm Park',
];
const firm = [24, 15, 90, 12, 20];
const peak = [19.4, 14.8, 61.2, 12.6, 11.3];

const regions = [
	'North East',
	'Yorkshire',
	'East Midlands',
	'South West',
	'Scotland',
];
const queue = [
	{ id: 'storage', label: 'Storage', values: [3.1, 4.2, 5.6, 6.8, 7.4] },
	{ id: 'solar', label: 'Solar', values: [1.8, 2.9, 4.4, 5.2, 1.6] },
	{ id: 'wind', label: 'Wind', values: [2.2, 1.4, 0.9, 1.1, 6.3] },
];

const imbalance = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
	(label, i) => ({
		label,
		value: Math.round(140 * Math.sin(i * 1.3 + 0.4)),
	})
);

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const periods = Array.from({ length: 48 }, (_, p) => String(p + 1));
const demand = days.map((_, d) =>
	periods.map((_, p) => {
		if (d === 2 && p >= 20 && p < 24) return null; // a gap in the feed
		const h = p / 2;
		const weekend = d >= 5 ? 0.85 : 1;
		return round1(weekend * (24 + 6 * wave(h, 18) + 3 * wave(h, 8, 2)));
	})
);

const scatter = (offset: number, scale: number) =>
	Array.from({ length: 18 }, (_, i) => {
		const x = round1(20 + i * 1.1 + 2 * Math.sin(i * 2.1 + offset));
		return {
			x,
			y: Math.round(scale * (x - 18) + 12 * Math.sin(i * 1.7 + offset)),
			label: `${String(i + 1)} Oct`,
		};
	});

export function Charts() {
	return (
		<>
			<Demo
				name="LineChart"
				summary="A line over time. Crosshair and tooltip on hover; arrow keys read values. Straight or stepped."
			>
				<Example label="One series, your real readiness">
					<div className="w-full">
						<LineChart
							label="Readiness, last 8 days"
							data={readiness}
							yDomain={[50, 100]}
							showArea
						/>
					</div>
				</Example>
				<Example label="Several series (illustrative)">
					<div className="w-full">
						<LineChart
							label="Wind and solar output, GW"
							categories={hours}
							series={output}
							categoryLabel="Hour"
						/>
					</div>
				</Example>
				<Example label="Stepped, for prices (illustrative)">
					<div className="w-full">
						<LineChart
							label="Day-ahead price, £/MWh"
							data={price}
							curve="step"
							formatValue={(v) => `£${String(v)}`}
							categoryLabel="Hour"
						/>
					</div>
				</Example>
			</Demo>

			<Demo
				name="AreaChart"
				summary="Stacked areas: how a total splits into parts over time."
			>
				<div className="w-full">
					<AreaChart
						label="Generation mix, GW (illustrative)"
						categories={hours}
						series={mix}
						categoryLabel="Hour"
					/>
				</div>
			</Demo>

			<Demo
				name="BarChart"
				summary="Bars from one baseline. Vertical or horizontal, grouped or stacked."
			>
				<Example label="One series">
					<div className="w-full">
						<BarChart
							label="Peak demand, MVA (illustrative)"
							data={substations.map((label, i) => ({
								label,
								value: peak[i] ?? 0,
							}))}
							categoryLabel="Substation"
						/>
					</div>
				</Example>
				<Example label="Grouped">
					<div className="w-full">
						<BarChart
							label="Firm capacity and peak demand, MVA (illustrative)"
							categories={substations}
							series={[
								{
									id: 'firm',
									label: 'Firm capacity',
									values: firm,
								},
								{
									id: 'peak',
									label: 'Peak demand',
									values: peak,
								},
							]}
							categoryLabel="Substation"
						/>
					</div>
				</Example>
				<Example label="Horizontal, stacked">
					<div className="w-full">
						<BarChart
							label="Connection queue by technology, GW (illustrative)"
							orientation="horizontal"
							layout="stacked"
							categories={regions}
							series={queue}
							categoryLabel="Region"
						/>
					</div>
				</Example>
				<Example label="Above and below zero">
					<div className="w-full">
						<BarChart
							label="System imbalance, MWh (illustrative)"
							data={imbalance}
							categoryLabel="Day"
						/>
					</div>
				</Example>
			</Demo>

			<Demo
				name="Heatmap"
				summary="Values in a grid, shaded light to dark. Arrow keys move across and down."
			>
				<div className="w-full">
					<Heatmap
						label="Demand by settlement period, GW (illustrative)"
						rows={days}
						columns={periods}
						values={demand}
					/>
				</div>
			</Demo>

			<Demo
				name="ScatterChart"
				summary="Two measures against each other. Up to three series, each with its own shape."
			>
				<div className="w-full">
					<ScatterChart
						label="Price against demand (illustrative)"
						xLabel="Demand, GW"
						yLabel="Price, £/MWh"
						series={[
							{
								id: 'weekday',
								label: 'Weekdays',
								points: scatter(0, 6),
							},
							{
								id: 'weekend',
								label: 'Weekends',
								points: scatter(1.5, 4),
							},
						]}
						formatY={(v) => `£${String(v)}`}
					/>
				</div>
			</Demo>

			<Demo
				name="Sparkline"
				summary="A small trend for Stat and tables. Muted line, latest value in verdigris."
			>
				<div className="grid w-full gap-3 sm:grid-cols-3">
					<Stat
						label="Readiness"
						value={80}
						note="28 Sep, your real scores"
						state="in-service"
						trend={readiness.map((d) => d.value)}
					/>
					<Stat
						label="Wind"
						value="11.4"
						unit="GW"
						note="Illustrative"
						trend={mix[1]?.values}
					/>
					<Stat
						label="Price"
						value="£84"
						note="Illustrative"
						trend={price.map((p) => p.value)}
					/>
				</div>
			</Demo>

			<Demo
				name="Meter"
				summary="One value against a limit. The fill carries the state."
			>
				<div className="flex w-full max-w-md flex-col gap-5">
					<Meter
						label="Alder Road loading"
						value={19.4}
						max={24}
						unit="MVA"
					/>
					<Meter
						label="Brook Lane loading"
						value={14.8}
						max={15}
						unit="MVA"
						state="isolated"
					/>
					<Meter
						label="Dunmore loading"
						value={12.6}
						max={12}
						unit="MVA"
						state="fault"
					/>
				</div>
				<Text variant="small" tone="muted">
					Illustrative substations. Dunmore is over its firm capacity,
					so the fill is full and red.
				</Text>
			</Demo>
		</>
	);
}
