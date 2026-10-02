import { useGrid } from '@fhudson/grid';
import {
	BarChart,
	LineChart,
	Panel,
	PanelBody,
	PanelHeader,
	Stat,
	Status,
	Text,
} from '@fhudson/ui';

const hhmm = (d: Date) => d.toISOString().slice(11, 16);
const capitalise = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1);

/** Frequency within ±0.2 Hz is normal operation; ±0.5 Hz is the statutory limit. */
function frequencyState(hz: number) {
	const off = Math.abs(hz - 50);
	if (off <= 0.2) return 'in-service' as const;
	if (off <= 0.5) return 'isolated' as const;
	return 'fault' as const;
}

const carbonState = (index: string) =>
	index === 'high' || index === 'very high'
		? ('isolated' as const)
		: ('in-service' as const);

/** Fixed, so the chart is the same size whatever the number of fuels generating. */
const MIX_HEIGHT = 230;

/**
 * Live GB grid readings: frequency, demand, carbon intensity and the generation mix. Everything
 * renders at its final size while loading, so nothing moves when the data arrives.
 */
export function GridPanel() {
	const { frequency, demand, carbon, mix } = useGrid();
	const f = frequency.data?.at(-1);
	const d = demand.data?.at(-1);
	const c = carbon.data?.at(-1);

	// Thin the 15-second frequency readings to one a minute for the trend
	const freqTrend =
		frequency.data?.filter((_, i) => i % 4 === 0).map((r) => r.value) ?? [];

	return (
		<Panel>
			<PanelHeader label="GB grid · live" meta="PNL 02" />
			<PanelBody className="gap-5">
				<div className="flex flex-wrap items-center gap-2">
					<Status state={frequency.state} live>
						Frequency feed
					</Status>
					<Status state={demand.state}>Demand feed</Status>
					<Status state={carbon.state}>Carbon feed</Status>
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<Stat
						label="Frequency"
						value={f ? f.value.toFixed(3) : null}
						unit="Hz"
						state={f ? frequencyState(f.value) : undefined}
						note={
							f ? `At ${hhmm(f.time)} UTC` : 'Waiting for Elexon'
						}
						trend={freqTrend}
					/>
					<Stat
						label="Demand"
						value={d ? (d.value / 1000).toFixed(1) : null}
						unit="GW"
						note={
							d ? `At ${hhmm(d.time)} UTC` : 'Waiting for Elexon'
						}
						trend={demand.data?.map((r) => r.value) ?? []}
					/>
					<Stat
						label="Carbon intensity"
						value={c ? c.value : null}
						unit="g/kWh"
						state={c ? carbonState(c.index) : undefined}
						note={
							c
								? `${capitalise(c.index)} · today`
								: 'Waiting for NESO'
						}
						trend={carbon.data?.map((r) => r.value) ?? []}
					/>
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
					<div className="flex min-w-0 flex-col gap-2">
						<Text variant="label">Frequency, last hour</Text>
						<LineChart
							label="System frequency, last hour, Hz"
							loading={!frequency.data}
							categories={
								frequency.data?.map((r) => hhmm(r.time)) ?? []
							}
							series={[
								{
									id: 'hz',
									label: 'Frequency',
									values:
										frequency.data?.map((r) => r.value) ??
										[],
								},
							]}
							yDomain={[49.8, 50.2]}
							formatValue={(v) => v.toFixed(2)}
							showPoints={false}
							categoryLabel="Time (UTC)"
							height={MIX_HEIGHT}
						/>
					</div>
					<div className="flex min-w-0 flex-col gap-2">
						<Text variant="label">
							Generation mix, this half hour
						</Text>
						<BarChart
							label="Generation mix, percent"
							loading={!mix.data}
							orientation="horizontal"
							data={(mix.data?.mix ?? [])
								.filter((m) => m.percent > 0)
								.map((m) => ({
									label: capitalise(m.fuel),
									value: m.percent,
								}))}
							formatValue={(v) => `${String(v)}%`}
							categoryLabel="Fuel"
							height={MIX_HEIGHT}
						/>
					</div>
				</div>
			</PanelBody>
		</Panel>
	);
}
