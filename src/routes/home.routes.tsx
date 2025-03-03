import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/HomePage';
import ProfilePage from "../pages/UserProfile/UserProfilePage.tsx";

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
            },
            {
                path: '/profile',
                element: <ProfilePage />,
            },
        ]
    }
];

export default homeRoutes;