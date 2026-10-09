import { expect, mock, test } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { Slider } from './Slider';

test('Slider is labelled and moves with the keyboard', () => {
	const onChange = mock();
	render(
		<Slider
			label="Gas"
			unit="MW"
			minValue={0}
			maxValue={1000}
			step={50}
			defaultValue={500}
			onChange={onChange}
		/>
	);
	const input = screen.getByRole('slider', { name: 'Gas' });
	expect((input as HTMLInputElement).value).toBe('500');
	fireEvent.keyDown(input, { key: 'ArrowRight' });
	expect(onChange).toHaveBeenCalledWith(550);
	expect(screen.getByText('MW')).toBeTruthy();
});
