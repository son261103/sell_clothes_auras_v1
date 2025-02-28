import {useRoutes} from 'react-router-dom';
import homeRoutes from './home.routes';
import cartRoutes from './cart.routes';
import checkoutRoutes from './checkout.routes';
import authRoutes from './auth.routes';
import productRoutes from "./product.routes.tsx";
import React from "react";
import orderRoutes from "./order.routes.tsx";

interface AppRoutesProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

const AppRoutes = ({isDarkMode, setIsDarkMode}: AppRoutesProps) => {
    const routes = useRoutes([
        ...homeRoutes,
        ...productRoutes,
        ...cartRoutes,
        ...orderRoutes,
        ...checkoutRoutes,
        ...authRoutes.map((route) => ({
            ...route,
            element: React.cloneElement(route.element as React.ReactElement, {
                isDarkMode,
                setIsDarkMode,
            }),
        })),
    ]);

    return routes;
};

export default AppRoutes;