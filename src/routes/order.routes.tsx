import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import OrderPage from "../pages/order/OrderPage.tsx";


/**
 * Cart related routes
 */
const orderRoutes: RouteObject[] = [
    {
        path: '/order',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <OrderPage />
            }
        ]
    }
];

export default orderRoutes;