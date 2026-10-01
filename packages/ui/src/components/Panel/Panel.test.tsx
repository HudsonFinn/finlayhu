import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Panel, PanelBody, PanelHeader } from './Panel';

describe('Panel', () => {
	test('is named by its header', () => {
		render(
			<Panel>
				<PanelHeader label="Health" meta="Today" />
				<PanelBody>Readiness 80</PanelBody>
			</Panel>
		);
		expect(screen.getByRole('region', { name: 'Health' })).toBeTruthy();
		expect(screen.getByText('Today')).toBeTruthy();
	});

	test('a header href makes the label a link', () => {
		render(
			<Panel>
				<PanelHeader label="Vault" href="/vault" />
			</Panel>
		);
		expect(
			screen.getByRole('link', { name: 'Vault' }).getAttribute('href')
		).toBe('/vault');
	});

	test('a div panel has no region role or name', () => {
		render(
			<Panel as="div" data-testid="panel">
				<PanelHeader label="Notes" />
			</Panel>
		);
		expect(
			screen.getByTestId('panel').hasAttribute('aria-labelledby')
		).toBe(false);
	});
});
