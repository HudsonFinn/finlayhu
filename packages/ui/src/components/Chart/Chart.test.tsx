import { describe, expect, test } from 'bun:test';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AreaChart } from './AreaChart';
import { BarChart } from './BarChart';
import { Heatmap } from './Heatmap';
import { LineChart } from './LineChart';
import { Meter } from './Meter';
import { ScatterChart } from './ScatterChart';
import { Sparkline } from './Sparkline';

const readiness = [
	{ label: '24 Sep', value: 75 },
	{ label: '25 Sep', value: 73 },
	{ label: '26 Sep', value: null },
	{ label: '27 Sep', value: 88 },
	{ label: '28 Sep', value: 80 },
	{ label: '29 Sep', value: null },
];

const live = () =>
	document.querySelector('[aria-live="polite"]')?.textContent ?? '';

describe('LineChart', () => {
	test('breaks the line at gaps and marks them on the axis', () => {
		const { container } = render(
			<LineChart label="Readiness" data={readiness} />
		);
		expect(
			container.querySelectorAll(
				'path[stroke="var(--sl-series-1)"][fill="none"]'
			).length
		).toBe(2);
		expect(
			container.querySelectorAll('path[stroke="var(--sl-ink-muted)"]')
				.length
		).toBe(2);
	});

	test('arrow keys read values aloud and show the tooltip', async () => {
		render(<LineChart label="Readiness" data={readiness} />);
		await userEvent.tab();
		expect(document.activeElement?.getAttribute('aria-label')).toContain(
			'arrow keys'
		);
		await userEvent.keyboard('{ArrowRight}');
		expect(live()).toBe('24 Sep: 75');
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		expect(live()).toBe('26 Sep: No data');
		await userEvent.keyboard('{End}');
		expect(live()).toBe('29 Sep: No data');
	});

	test('the tooltip lists every series, with a legend for several', async () => {
		render(
			<LineChart
				label="Scores"
				categories={['Mon', 'Tue']}
				series={[
					{ id: 'r', label: 'Readiness', values: [75, 80] },
					{ id: 's', label: 'Sleep', values: [70, null] },
				]}
			/>
		);
		expect(
			within(screen.getByRole('list', { name: 'Legend' })).getByText(
				'Sleep'
			)
		).toBeTruthy();
		await userEvent.tab();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		expect(live()).toBe('Tue: Readiness 80, Sleep No data');
	});

	test('step curves hold each value until the next', () => {
		const { container } = render(
			<LineChart
				label="Price"
				curve="step"
				data={[
					{ label: '1', value: 50 },
					{ label: '2', value: 70 },
				]}
			/>
		);
		expect(
			container
				.querySelector('path[stroke="var(--sl-series-1)"]')
				?.getAttribute('d')
		).toContain('H');
	});

	test('the data table can be shown', async () => {
		render(<LineChart label="Readiness" data={readiness} />);
		await userEvent.click(
			screen.getByRole('button', { name: 'Show table' })
		);
		const table = screen.getByRole('table', { name: 'Readiness' });
		expect(within(table).getByText('88')).toBeTruthy();
		expect(within(table).getAllByText('No data')).toHaveLength(2);
	});
});

describe('BarChart', () => {
	test('draws one bar per value and labels single-series tips', () => {
		const { container } = render(
			<BarChart
				label="Peak MVA"
				data={[
					{ label: 'A', value: 19 },
					{ label: 'B', value: -4 },
					{ label: 'C', value: 12 },
				]}
			/>
		);
		expect(
			container.querySelectorAll('rect[fill="var(--sl-series-1)"]').length
		).toBe(3);
		expect(container.textContent).toContain('-4');
	});

	test('stacked bars report a total', async () => {
		render(
			<BarChart
				label="Generation"
				layout="stacked"
				categories={['Mon']}
				series={[
					{ id: 'wind', label: 'Wind', values: [10] },
					{ id: 'gas', label: 'Gas', values: [6] },
				]}
			/>
		);
		await userEvent.tab();
		await userEvent.keyboard('{ArrowRight}');
		expect(live()).toBe('Mon: Wind 10, Gas 6, Total 16');
	});
});

test('AreaChart reads every band and the total', async () => {
	render(
		<AreaChart
			label="Mix"
			categories={['00:00', '00:30']}
			series={[
				{ id: 'wind', label: 'Wind', values: [10, 12] },
				{ id: 'gas', label: 'Gas', values: [6, 5] },
			]}
		/>
	);
	await userEvent.tab();
	await userEvent.keyboard('{ArrowRight}');
	expect(live()).toBe('00:00: Gas 6, Wind 10, Total 16');
});

test('Heatmap moves in two dimensions', async () => {
	const { container } = render(
		<Heatmap
			label="Demand"
			rows={['Mon', 'Tue']}
			columns={['1', '2', '3']}
			values={[
				[1, 2, 3],
				[4, null, 6],
			]}
		/>
	);
	expect(container.querySelectorAll('svg rect').length).toBe(5);
	await userEvent.tab();
	await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
	expect(live()).toBe('Tue · 2: No data');
});

test('ScatterChart gives each series its own marker shape', async () => {
	render(
		<ScatterChart
			label="Price against demand"
			xLabel="Demand"
			yLabel="Price"
			series={[
				{
					id: 'a',
					label: 'Winter',
					points: [{ x: 30, y: 90, label: 'Jan' }],
				},
				{
					id: 'b',
					label: 'Summer',
					points: [{ x: 22, y: 60, label: 'Jul' }],
				},
			]}
		/>
	);
	await userEvent.tab();
	await userEvent.keyboard('{ArrowRight}');
	expect(live()).toBe('Jul, Summer: Demand 22, Price 60');
});

test('Sparkline summarises its values in its name', () => {
	render(<Sparkline label="Readiness" values={[75, 73, null, 88, 80]} />);
	expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
		'Readiness: from 75 to 80, low 73, high 88'
	);
});

test('Meter exposes its value as a meter', () => {
	render(<Meter label="Loading" value={19.4} max={24} unit="MVA" />);
	expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe(
		'19.4 MVA of 24 MVA'
	);
});

test('count bars get whole-number ticks', () => {
	const { container } = render(
		<BarChart
			label="Activities"
			data={[
				{ label: 'Hike', value: 2 },
				{ label: 'Swim', value: 1 },
			]}
		/>
	);
	const ticks = [...container.querySelectorAll('svg text')].map(
		(t) => t.textContent
	);
	expect(ticks).not.toContain('0.5');
	expect(ticks).not.toContain('1.5');
});
