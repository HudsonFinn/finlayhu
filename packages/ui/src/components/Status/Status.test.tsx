import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Status } from './Status';
import { Stat } from '../Stat';
import { Spinner } from '../Spinner';
import { List, ListItem } from '../List';

test('Status uses the state label by default and can be live', () => {
	render(<Status state="isolated" live />);
	const status = screen.getByRole('status');
	expect(status.textContent).toBe('Isolated');
	expect(status.className).toContain('text-amber');
});

test('Stat shows a dash and no unit when there is no reading', () => {
	render(<Stat label="Activity" value={null} unit="pts" />);
	expect(screen.getByText('–')).toBeTruthy();
	expect(screen.queryByText('pts')).toBeNull();
});

test('Spinner is an indeterminate progress bar with a label', () => {
	render(<Spinner label="Loading posts" />);
	const bar = screen.getByRole('progressbar', { name: 'Loading posts' });
	expect(bar.hasAttribute('aria-valuenow')).toBe(false);
});

test('List renders an ordered list for the number variant', () => {
	render(
		<List variant="number">
			<ListItem>One</ListItem>
		</List>
	);
	expect(screen.getByRole('list').tagName).toBe('OL');
});
