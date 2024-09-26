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

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '',
                element: <LandingPage />,
            },
            {
                path: 'vault',
                element: <VaultPage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
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
