import { describe, expect, mock, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria-components';
import { Link } from './Link';

describe('Link', () => {
	test('renders an anchor with its href', () => {
		render(<Link href="/vault">Vault</Link>);
		expect(
			screen.getByRole('link', { name: 'Vault' }).getAttribute('href')
		).toBe('/vault');
	});

	test('navigates internal links through the router', async () => {
		const navigate = mock();
		render(
			<RouterProvider navigate={navigate}>
				<Link href="/vault">Vault</Link>
			</RouterProvider>
		);
		await userEvent.click(screen.getByRole('link'));
		expect(navigate).toHaveBeenCalledTimes(1);
		expect(navigate.mock.calls[0]?.[0]).toBe('/vault');
	});

	test('marks external links and adds rel', () => {
		render(<Link href="https://finlayhu.substack.com">Boundary Node</Link>);
		const link = screen.getByRole('link');
		expect(link.getAttribute('rel')).toBe('noopener');
		expect(link.textContent).toContain('↗');
	});

	test('can look like a button', () => {
		render(
			<Link href="/projects" variant="button" buttonVariant="ghost">
				Projects
			</Link>
		);
		expect(screen.getByRole('link').className).toContain('border-ink');
	});
});
