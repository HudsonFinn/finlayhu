import { expect, mock, test } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { TextField } from './TextField';
import { TextArea } from '../TextArea';

test('TextField is labelled, described and reports changes', () => {
	const onChange = mock();
	render(
		<TextField
			label="Title"
			description="Shown at the top of the post."
			onChange={onChange}
		/>
	);
	const input = screen.getByRole('textbox', { name: 'Title' });
	expect(input.getAttribute('aria-describedby')).toBeTruthy();
	fireEvent.change(input, { target: { value: 'On dogs' } });
	expect(onChange).toHaveBeenCalledWith('On dogs');
});

test('TextArea renders a multi-line box with its label', () => {
	render(<TextArea label="Draft" defaultValue={'one\ntwo'} rows={6} />);
	const box = screen.getByRole('textbox', { name: 'Draft' });
	expect(box.tagName).toBe('TEXTAREA');
	expect((box as HTMLTextAreaElement).value).toBe('one\ntwo');
	expect(box.getAttribute('rows')).toBe('6');
});

test('TextField shows its error when invalid', () => {
	render(<TextField label="Slug" isInvalid errorMessage="Use lower case" />);
	expect(screen.getByText('Use lower case')).toBeTruthy();
});

test('TextArea highlights ranges of its value behind the text', () => {
	const { container } = render(
		<TextArea
			label="Draft"
			value="It was very fun."
			highlights={[
				{ start: 7, end: 11, id: 'h1', className: 'bg-fault/20' },
			]}
		/>
	);
	const mark = container.querySelector('[data-highlight="h1"]');
	expect(mark?.textContent).toBe('very');
	expect(screen.getByRole('textbox', { name: 'Draft' })).toBeTruthy();
});
