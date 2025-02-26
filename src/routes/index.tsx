import { useRoutes } from 'react-router-dom';
import homeRoutes from './home.routes';
import cartRoutes from './cart.routes';
import checkoutRoutes from './checkout.routes';

/**
 * Main application routes
 */
const AppRoutes = () => {
    const routes = useRoutes([
        ...homeRoutes,
        ...cartRoutes,
        ...checkoutRoutes,
        // Add other route groups here as needed
    ]);

    return routes;
};

export default AppRoutes;