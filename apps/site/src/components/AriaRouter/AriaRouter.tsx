import { RouterProvider } from '@fhudson/ui';
import { Outlet, useHref, useNavigate } from 'react-router-dom';

/** Lets Single Line's Link (and other React Aria components) navigate with React Router. */
function AriaRouter() {
	const navigate = useNavigate();
	return (
		<RouterProvider
			navigate={(to) => {
				navigate(to);
			}}
			useHref={useHref}
		>
			<Outlet />
		</RouterProvider>
	);
}

export default AriaRouter;
