import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import AriaRouter from './components/AriaRouter/AriaRouter.tsx';
import ControlRoomLayout from './controlRoom/ControlRoomLayout.tsx';
import BoardPage from './pages/board/BoardPage.tsx';
import TripPage from './pages/faults/TripPage.tsx';

// Every page except the Board loads its code on demand, so the landing page stays light
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
	Component: (await load()).default,
});

const router = createBrowserRouter([
	{
		element: <AriaRouter />,
		errorElement: <TripPage />,
		children: [
			// Unlisted: the Single Line design system reference
			{
				path: '/system',
				lazy: page(() => import('./pages/SystemPage.tsx')),
			},
			{
				element: <ControlRoomLayout />,
				errorElement: <TripPage />,
				children: [
					{ path: '/', element: <BoardPage /> },
					{
						path: '/vault',
						lazy: page(() => import('./pages/log/LogPage.tsx')),
					},
					{
						path: '/vault/:slug',
						lazy: page(
							() => import('./pages/log/LogEntryPage.tsx')
						),
					},
					{
						path: '/projects',
						lazy: page(
							() => import('./pages/register/RegisterPage.tsx')
						),
					},
					{
						path: '/new-tab',
						lazy: page(
							() =>
								import('./pages/operator/OperatorDeskPage.tsx')
						),
					},
					{
						path: '/about',
						lazy: page(
							() => import('./pages/operator/OperatorPage.tsx')
						),
					},
					{
						path: '*',
						lazy: page(
							() => import('./pages/faults/OpenCircuitPage.tsx')
						),
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
