import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import AriaRouter from './components/AriaRouter/AriaRouter.tsx';
import ControlRoomLayout from './controlRoom/ControlRoomLayout.tsx';
import BoardPage from './pages/board/BoardPage.tsx';
import OpenCircuitPage from './pages/faults/OpenCircuitPage.tsx';
import TripPage from './pages/faults/TripPage.tsx';
import LogEntryPage from './pages/log/LogEntryPage.tsx';
import LogPage from './pages/log/LogPage.tsx';
import OperatorDeskPage from './pages/operator/OperatorDeskPage.tsx';
import OperatorPage from './pages/operator/OperatorPage.tsx';
import RegisterPage from './pages/register/RegisterPage.tsx';
import SystemPage from './pages/SystemPage.tsx';

const router = createBrowserRouter([
	{
		element: <AriaRouter />,
		errorElement: <TripPage />,
		children: [
			// Unlisted: the Single Line design system reference
			{ path: '/system', element: <SystemPage /> },
			{
				element: <ControlRoomLayout />,
				errorElement: <TripPage />,
				children: [
					{ path: '/', element: <BoardPage /> },
					{ path: '/vault', element: <LogPage /> },
					{ path: '/vault/:slug', element: <LogEntryPage /> },
					{ path: '/projects', element: <RegisterPage /> },
					{ path: '/new-tab', element: <OperatorDeskPage /> },
					{ path: '/about', element: <OperatorPage /> },
					{ path: '*', element: <OpenCircuitPage /> },
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
