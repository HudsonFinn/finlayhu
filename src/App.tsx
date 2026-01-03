import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import SideBar from './components/SideBar/SideBar';

function App() {
	return (
		<div className="flex">
			<div className="flex flex-col grow">
				<NavBar />
				<Outlet />
			</div>
			<div className="flex-none">
				<SideBar />
			</div>
		</div>
	);
}

export default App;
