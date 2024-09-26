import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import { ConsoleLogger } from './logger';

function App() {
    const logger = new ConsoleLogger();

    logger.info('This is a basic log');
    logger.warn('This is a basic warn');
    logger.error('This is a basic error');
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    );
}

export default App;
