import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
    children: ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#262626', // darkBackground from your theme
                        color: '#d8e2dc', // textLight from your theme
                        border: '1px solid #bd8790', // primary color border
                    },
                    success: {
                        iconTheme: {
                            primary: '#bd8790', // primary color
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#f5a623', // accent color
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
};

export default ToastProvider;