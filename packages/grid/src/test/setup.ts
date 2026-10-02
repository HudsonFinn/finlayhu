import { GlobalRegistrator } from '@happy-dom/global-registrator';

// A real URL, so same-origin checks (such as client-side link navigation) work
GlobalRegistrator.register({ url: 'http://localhost/' });

// Imported after the DOM exists, so Testing Library binds to it
const { afterEach } = await import('bun:test');
const { cleanup } = await import('@testing-library/react');

afterEach(() => {
	cleanup();
});
