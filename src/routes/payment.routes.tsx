import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PaymentPage from '../pages/payment/PaymentPage';
import PaymentConfirmPage from '../pages/payment/PaymentConfirmPage';

/**
 * Payment related routes
 */
const paymentRoutes: RouteObject[] = [
    {
        path: '/payment',
        element: <MainLayout />,
        children: [
            {
                path: ':orderId', // Đường dẫn tương đối: /payment/:orderId
                element: <PaymentPage />,
            },
            {
                path: 'confirm', // Đường dẫn tương đối: /payment/confirm
                element: <PaymentConfirmPage />,
            },
        ],
    },
];

export default paymentRoutes;