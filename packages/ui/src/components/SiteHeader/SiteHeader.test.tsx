import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from './SiteHeader';

const items = [
	{ label: 'Home', href: '/' },
	{ label: 'Vault', href: '/vault' },
	{ label: 'Projects', href: '/projects' },
];

describe('SiteHeader', () => {
	test('marks the current section, including its sub-pages', () => {
		render(
			<SiteHeader
				title="Finlay Hudson"
				items={items}
				currentHref="/vault/why-qin"
			/>
		);
		expect(
			screen
				.getByRole('link', { name: 'Vault' })
				.getAttribute('aria-current')
		).toBe('page');
		expect(
			screen
				.getByRole('link', { name: 'Home' })
				.hasAttribute('aria-current')
		).toBe(false);
	});

	test('the menu button toggles the navigation', async () => {
		render(
			<SiteHeader title="Finlay Hudson" items={items} currentHref="/" />
		);
		const button = screen.getByRole('button', { name: 'Menu' });
		expect(button.getAttribute('aria-expanded')).toBe('false');
		await userEvent.click(button);
		expect(
			screen
				.getByRole('button', { name: 'Close' })
				.getAttribute('aria-expanded')
		).toBe('true');
	});

	test('the site name links home', () => {
		render(
			<SiteHeader title="Finlay Hudson" items={items} currentHref="/" />
		);
		expect(
			screen
				.getByRole('link', { name: 'Finlay Hudson' })
				.getAttribute('href')
		).toBe('/');
	});
});
