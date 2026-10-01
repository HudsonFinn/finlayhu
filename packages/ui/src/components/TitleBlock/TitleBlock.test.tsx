import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { TitleBlock } from './TitleBlock';
import { NodeMark } from '../NodeMark';
import { SkipLink } from '../SkipLink';

test('TitleBlock renders each field as a term and value', () => {
	render(
		<TitleBlock
			fields={[
				{ label: 'Drawn', value: 'FH' },
				{ label: 'Rev', value: 'C' },
			]}
		/>
	);
	expect(screen.getByText('Drawn').tagName).toBe('DT');
	expect(screen.getByText('C').tagName).toBe('DD');
});

test('NodeMark is hidden unless it has a label', () => {
	const { container, rerender } = render(<NodeMark />);
	expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
		'true'
	);
	rerender(<NodeMark label="Boundary Node" />);
	expect(screen.getByRole('img', { name: 'Boundary Node' })).toBeTruthy();
});

test('SkipLink points at main by default', () => {
	render(<SkipLink />);
	expect(
		screen
			.getByRole('link', { name: 'Skip to content' })
			.getAttribute('href')
	).toBe('#main');
});
