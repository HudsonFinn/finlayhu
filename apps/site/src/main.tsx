import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'chalkboard-ui/styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import VaultPage from './pages/VaultPage.tsx';
import PostPage from './pages/PostPage.tsx';
import '@fontsource/noto-sans-mono';
import AboutPage from './pages/AboutPage.tsx';
import NewTabPage from './pages/NewTabPage.tsx';
import ProjectsPage from './pages/ProjectsPage.tsx';
import SystemPage from './pages/SystemPage.tsx';
import AriaRouter from './components/AriaRouter/AriaRouter.tsx';
import ControlRoomLayout from './controlRoom/ControlRoomLayout.tsx';
import BoardPage from './pages/board/BoardPage.tsx';

const router = createBrowserRouter([
	{
		element: <AriaRouter />,
		errorElement: <ErrorPage />,
		children: [
			// Unlisted: the Single Line design system reference, outside the Chalkboard layout
			{
				path: '/system',
				element: <SystemPage />,
				errorElement: <ErrorPage />,
			},
			// Redesigned pages, in the control-room shell. Pages move here as they're rebuilt.
			{
				element: <ControlRoomLayout />,
				errorElement: <ErrorPage />,
				children: [
					{
						path: '/',
						element: <BoardPage />,
						errorElement: <ErrorPage />,
					},
				],
			},
			// Pages not yet rebuilt, still on Chalkboard
			{
				path: '/',
				element: <App />,
				errorElement: <ErrorPage />,
				children: [
					{
						path: 'about',
						element: <AboutPage />,
						errorElement: <ErrorPage />,
					},
					{
						path: 'vault',
						element: <VaultPage />,
						errorElement: <ErrorPage />,
					},
					{
						path: 'vault/:slug',
						element: <PostPage />,
						errorElement: <ErrorPage />,
					},
					{
						path: 'new-tab',
						element: <NewTabPage />,
						errorElement: <ErrorPage />,
					},
					{
						path: 'projects',
						element: <ProjectsPage />,
						errorElement: <ErrorPage />,
					},
					{
						path: '*',
						element: <NotFoundPage />,
						errorElement: <ErrorPage />,
					},
				],
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
