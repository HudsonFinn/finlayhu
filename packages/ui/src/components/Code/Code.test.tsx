import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { CodeBlock } from './Code';

test('highlights known languages with token colours', () => {
	const { container } = render(
		<CodeBlock language="TypeScript">{`const count = 4812; // circuits`}</CodeBlock>
	);
	const keyword = [...container.querySelectorAll('span')].find(
		(s) => s.textContent === 'const'
	);
	expect(keyword?.getAttribute('style')).toContain('var(--sl-verdigris)');
	const comment = [...container.querySelectorAll('span')].find((s) =>
		s.textContent.includes('// circuits')
	);
	expect(comment?.getAttribute('style')).toContain('var(--sl-ink-muted)');
});

test('renders unknown languages as plain text', () => {
	const { container } = render(
		<CodeBlock language="Bash">{'bun run dev'}</CodeBlock>
	);
	expect(container.textContent).toContain('bun run dev');
	expect(container.textContent).toContain('Bash');
});
