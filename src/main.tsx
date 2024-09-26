import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import NotFoundPage from './pages/NotFound.tsx';
import VaultPage from './pages/VaultPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import '@fontsource/noto-sans-mono';
import AboutPage from './pages/AboutPage.tsx';
import NewTabPage from './pages/NewTabPage.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '',
				element: <LandingPage />,
				errorElement: <ErrorPage />,
			},
			{
				path: 'vault',
				element: <VaultPage />,
				errorElement: <ErrorPage />,
			},
			{
				path: 'about',
				element: <AboutPage />,
				errorElement: <ErrorPage />,
			},
			{
				path: 'new-tab',
				element: <NewTabPage />,
				errorElement: <ErrorPage />,
			},
			{
				path: '*',
				element: <NotFoundPage />,
				errorElement: <ErrorPage />,
			},
		],
	},
]);

const root = document.getElementById('root');

if (root) {
	createRoot(root).render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>
	);
} else {
	console.error('Root element missing');
}
