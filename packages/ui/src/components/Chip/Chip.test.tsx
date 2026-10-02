import { expect, mock, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip, ChipGroup } from './Chip';

test('chips toggle independently and report the selection', async () => {
	const onSelectionChange = mock();
	render(
		<ChipGroup
			aria-label="Filter by tag"
			onSelectionChange={onSelectionChange}
		>
			<Chip id="reviews">Reviews</Chip>
			<Chip id="principles">Principles</Chip>
		</ChipGroup>
	);
	await userEvent.click(screen.getByRole('button', { name: 'Reviews' }));
	await userEvent.click(screen.getByRole('button', { name: 'Principles' }));
	const last = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
	expect([...last].sort()).toEqual(['principles', 'reviews']);
	expect(
		screen
			.getByRole('button', { name: 'Reviews' })
			.getAttribute('aria-pressed')
	).toBe('true');
});
