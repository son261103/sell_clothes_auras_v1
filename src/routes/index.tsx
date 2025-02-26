import { useRoutes } from 'react-router-dom';
import homeRoutes from './home.routes';

/**
 * Main application routes
 */
const AppRoutes = () => {
    const routes = useRoutes([
        ...homeRoutes,
        // Add other route groups here as needed
    ]);

    return routes;
};

export default AppRoutes;