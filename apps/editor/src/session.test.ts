import { expect, test } from 'bun:test';
import { nextPass, resume, startSession } from './session';

test('a run steps through its passes, then finishes', () => {
	let session = startSession(['long-sentences', 'hedges']);
	session = nextPass({
		...session,
		stage: 'fixing',
		marks: [{ start: 0, end: 2 }],
	});
	expect(session.index).toBe(1);
	expect(session.stage).toBe('brief');
	expect(session.marks).toEqual([]);
	expect(nextPass(session).stage).toBe('done');
});

test('resuming restarts a pass whose marks were made on other text', () => {
	const marking = {
		...startSession(['hedges']),
		stage: 'marking' as const,
		marks: [{ start: 0, end: 4 }],
		markedBody: 'Very good.',
	};
	expect(resume(marking, 'Very good.')?.stage).toBe('marking');
	expect(resume(marking, 'Changed.')?.stage).toBe('brief');
	// Fixing works on live text, so edits don't matter
	expect(resume({ ...marking, stage: 'fixing' }, 'Changed.')?.stage).toBe(
		'fixing'
	);
});

test('resuming drops rules that no longer exist', () => {
	expect(resume(startSession(['gone']), '')).toBeNull();
	expect(resume(startSession(['gone', 'hedges']), '')?.queue).toEqual([
		'hedges',
	]);
});
