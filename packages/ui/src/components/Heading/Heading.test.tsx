import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import { Text } from '../Text';

test('Heading renders the level and lets size differ', () => {
	render(
		<Heading level={2} size="h3">
			Recent
		</Heading>
	);
	const heading = screen.getByRole('heading', { level: 2, name: 'Recent' });
	expect(heading.className).toContain('text-h3');
	expect(heading.className).not.toContain('font-display');
});

test('Text defaults lead to muted and renders the chosen element', () => {
	render(
		<Text as="span" variant="lead">
			Intro
		</Text>
	);
	const text = screen.getByText('Intro');
	expect(text.tagName).toBe('SPAN');
	expect(text.className).toContain('text-ink-muted');
});
