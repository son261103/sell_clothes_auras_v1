import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CheckoutPage from '../pages/CheckoutPage';

/**
 * Checkout related routes
 */
const checkoutRoutes: RouteObject[] = [
    {
        path: '/checkout',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <CheckoutPage />
            }
        ]
    }
];

export default checkoutRoutes;