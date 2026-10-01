import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Breaker, Busbar, Transformer } from './Symbols';

test('Breaker names its position and state when labelled', () => {
	render(<Breaker closed={false} label="Feeder 2" state="isolated" />);
	expect(
		screen.getByRole('img', { name: 'Feeder 2, open, isolated' })
	).toBeTruthy();
});

test('symbols are decorative without a label', () => {
	const { container } = render(
		<>
			<Busbar />
			<Transformer ratio="33/11 kV" />
		</>
	);
	container.querySelectorAll('svg').forEach((svg) => {
		expect(svg.getAttribute('aria-hidden')).toBe('true');
	});
	expect(container.textContent).toContain('33/11 kV');
});
