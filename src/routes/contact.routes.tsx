import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ContactPage from "../pages/contactPage/ContactPage.tsx";


/**
 * Order related routes
 */
const orderRoutes: RouteObject[] = [
    {
        path: '/contact',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <ContactPage />
            },
        ]
    }
];

export default orderRoutes;