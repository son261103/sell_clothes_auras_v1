import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PaymentPage from '../pages/payment/PaymentPage';

/**
 * Payment related routes
 */
const paymentRoutes: RouteObject[] = [
    {
        path: '/payment',
        element: <MainLayout />,
        children: [
            {
                path: ':orderId',
                element: <PaymentPage />
            }
        ]
    }
];

export default paymentRoutes;