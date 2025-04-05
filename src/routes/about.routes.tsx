import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AboutPage from "../pages/aboutPage/AboutPage.tsx";


/**
 * Order related routes
 */
const orderRoutes: RouteObject[] = [
    {
        path: '/about',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <AboutPage />
            },
        ]
    }
];

export default orderRoutes;