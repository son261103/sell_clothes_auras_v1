import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Handle dark mode toggle
    useEffect(() => {
        // Kiểm tra nếu user đã lưu chế độ dark mode trước đó
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);

        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Lưu trạng thái dark mode khi thay đổi
    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode.toString());

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen flex flex-col bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight">
            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: isDarkMode ? '#262626' : '#fcf4f4',
                        color: isDarkMode ? '#d8e2dc' : '#262626',
                        border: '1px solid #bd8790',
                    },
                    success: {
                        iconTheme: {
                            primary: '#bd8790',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#f5a623',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Header */}
            <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default MainLayout;