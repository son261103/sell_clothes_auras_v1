import { RouteObject } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
// import ProfilePage from '../pages/auth/ProfilePage'; // Giả sử bạn có trang này

const authRoutes: RouteObject[] = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    // {
    //     path: '/profile',
    //     element: <ProfilePage />,
    // },
];

export default authRoutes;