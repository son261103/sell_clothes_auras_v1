import React from 'react';

interface AuthFormContainerProps {
    title: string;
    children: React.ReactNode;
    error?: string | null;
    loading?: boolean;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({
                                                                 title,
                                                                 children,
                                                                 error,
                                                                 loading,
                                                             }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-lightBackground dark:bg-darkBackground">
            <div className="p-8 bg-white dark:bg-secondary rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-textDark dark:text-textLight">
                    {title}
                </h2>
                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}
                {loading && (
                    <p className="text-accent text-center mb-4">Loading...</p>
                )}
                {children}
            </div>
        </div>
    );
};

export default AuthFormContainer;