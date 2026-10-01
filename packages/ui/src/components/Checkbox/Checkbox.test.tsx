import { expect, mock, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, CheckboxGroup } from './Checkbox';

test('Checkbox toggles and reports changes', async () => {
	const onChange = mock();
	render(<Checkbox onChange={onChange}>Email me new posts</Checkbox>);
	const box = screen.getByRole('checkbox', { name: 'Email me new posts' });
	await userEvent.click(box);
	expect(onChange).toHaveBeenCalledWith(true);
	expect((box as HTMLInputElement).checked).toBe(true);
});

test('CheckboxGroup labels its options as a group', () => {
	render(
		<CheckboxGroup label="Feeds" description="Choose what to follow">
			<Checkbox value="ltds">LTDS</Checkbox>
			<Checkbox value="cim">CIM</Checkbox>
		</CheckboxGroup>
	);
	expect(screen.getByRole('group', { name: 'Feeds' })).toBeTruthy();
	expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});
