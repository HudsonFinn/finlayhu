import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { LineChart } from './LineChart';

const data = [
	{ label: '24 Sep', value: 75 },
	{ label: '25 Sep', value: 73 },
	{ label: '26 Sep', value: null },
	{ label: '27 Sep', value: 88 },
	{ label: '28 Sep', value: 80 },
	{ label: '29 Sep', value: null },
];

test('breaks the line at missing values', () => {
	const { container } = render(<LineChart data={data} label="Readiness" />);
	const lines = container.querySelectorAll(
		'path[stroke="var(--sl-verdigris)"]'
	);
	expect(lines).toHaveLength(2);
	// Square points for the four readings, and a cross for each of the two gaps
	expect(container.querySelectorAll('rect')).toHaveLength(4);
	expect(
		container.querySelectorAll('path[stroke="var(--sl-ink-muted)"]')
	).toHaveLength(2);
});

test('gives screen readers a table of the values', () => {
	render(<LineChart data={data} label="Readiness" />);
	expect(screen.getByRole('table', { name: 'Readiness' })).toBeTruthy();
	expect(screen.getAllByText('No data')).toHaveLength(2);
});

test('shows a no-data state when every value is missing', () => {
	render(
		<LineChart data={[{ label: 'a', value: null }]} label="Readiness" />
	);
	expect(screen.getByText('No data')).toBeTruthy();
});
