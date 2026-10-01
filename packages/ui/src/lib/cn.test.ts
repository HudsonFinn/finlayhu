import { expect, test } from 'bun:test';
import { cn } from './cn';

test('keeps a Single Line colour and size together', () => {
	expect(cn('text-ink', 'text-h1')).toBe('text-ink text-h1');
});

test('later classes of the same kind win', () => {
	expect(cn('text-ink', 'text-verdigris')).toBe('text-verdigris');
	expect(cn('text-h1', 'text-small')).toBe('text-small');
	expect(cn('font-display', 'font-data')).toBe('font-data');
	expect(cn('bg-paper', 'bg-sheet')).toBe('bg-sheet');
});

test('drops falsy values', () => {
	expect(cn('a', false, undefined, 'b')).toBe('a b');
});
