import { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProductsPage from '../pages/product/ProductsPage.tsx';
import ProductDetailPage from '../pages/product/ProductDetailPage.tsx';

/**
 * Product related routes
 */
const productRoutes: RouteObject[] = [
    {
        path: '/products',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <ProductsPage />
            },
            {
                path: ':slug',
                element: <ProductDetailPage />
            }
        ]
    }
];

export default productRoutes;