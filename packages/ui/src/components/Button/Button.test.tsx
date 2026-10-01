import { describe, expect, mock, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
	test('calls onPress when clicked', async () => {
		const onPress = mock();
		render(<Button onPress={onPress}>Subscribe</Button>);
		await userEvent.click(
			screen.getByRole('button', { name: 'Subscribe' })
		);
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	test('calls onPress from the keyboard', async () => {
		const onPress = mock();
		render(<Button onPress={onPress}>Subscribe</Button>);
		await userEvent.tab();
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard(' ');
		expect(onPress).toHaveBeenCalledTimes(2);
	});

	test('does nothing when disabled', async () => {
		const onPress = mock();
		render(
			<Button onPress={onPress} isDisabled>
				Subscribe
			</Button>
		);
		const button = screen.getByRole('button');
		await userEvent.click(button);
		expect(onPress).not.toHaveBeenCalled();
		expect(button.hasAttribute('disabled')).toBe(true);
	});

	test('lets className override the variant', () => {
		render(
			<Button variant="ghost" className="border-fault">
				Delete
			</Button>
		);
		const classes = screen.getByRole('button').className;
		expect(classes).toContain('border-fault');
		expect(classes).not.toContain('border-ink');
	});
});
