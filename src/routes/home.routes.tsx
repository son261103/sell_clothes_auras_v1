import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/HomePage';

/**
 * Home related routes
 */
const homeRoutes: RouteObject[] = [
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />
            }
            // Add other home-related routes here
        ]
    }
];

export default homeRoutes;