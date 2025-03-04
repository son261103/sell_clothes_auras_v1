import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import OrderPage from "../pages/order/OrderPage.tsx";
import OrderDetailPage from "../pages/order/OrderDetailPage.tsx";
import OrderListPage from "../pages/order/OrderListPage.tsx";

/**
 * Order related routes
 */
const orderRoutes: RouteObject[] = [
    {
        path: '/order',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <OrderPage />
            },
            {
                path: 'order-detail/:orderId',
                element: <OrderDetailPage />
            },
            {
                path: 'list',
                element: <OrderListPage/>
            }
        ]
    }
];

export default orderRoutes;