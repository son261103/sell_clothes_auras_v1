import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CartPage from '../pages/cart/CartPage.tsx';

/**
 * Cart related routes
 */
const cartRoutes: RouteObject[] = [
    {
        path: '/cart',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <CartPage />
            }
            // Có thể thêm các route con khác liên quan đến giỏ hàng nếu cần
        ]
    }
];

export default cartRoutes;