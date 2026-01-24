import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';

function App() {
	return (
		<div className="flex min-h-screen bg-chalkboard-background">
			<div className="flex flex-col grow">
				<NavBar />
				<Outlet />
			</div>
		</div>
	);
}

export default App;
