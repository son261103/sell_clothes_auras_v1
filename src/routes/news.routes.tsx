import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import NewsPage from "../pages/news/NewsPage.tsx";


/**
 * Order related routes
 */
const orderRoutes: RouteObject[] = [
    {
        path: '/news',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <NewsPage />
            },
        ]
    }
];

export default orderRoutes;