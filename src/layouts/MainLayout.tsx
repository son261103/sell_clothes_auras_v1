import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Initialize theme from localStorage, system preference, or default
const initializeTheme = () => {
    // First check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        // Apply the saved theme immediately to avoid flash
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        return savedTheme === 'dark';
    }
    // Otherwise check system preference
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Apply dark mode immediately
        document.documentElement.classList.add('dark');
        return true;
    }

    // Default to light mode
    document.documentElement.classList.remove('dark');
    return false;
};

const MainLayout = () => {
    const [isDarkMode, setIsDarkMode] = useState(initializeTheme());
    const [isLoading, setIsLoading] = useState(true);

    // Set up listener for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            // Only change theme based on system preference if user hasn't explicitly set a preference
            if (!localStorage.getItem('theme')) {
                const newDarkMode = event.matches;
                document.documentElement.classList.toggle('dark', newDarkMode);
                setIsDarkMode(newDarkMode);
            }
        };

        // Add listener (with compatibility for older browsers)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            mediaQuery.addListener(handleChange);
        }

        // Simulate loading for a smoother entry experience
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        // Cleanup functions
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
            clearTimeout(timer);
        };
    }, []);

    // Handle dark mode changes and save to localStorage
    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;

            // Update classList on document
            document.documentElement.classList.toggle('dark', newMode);

            // Save to localStorage
            localStorage.setItem('theme', newMode ? 'dark' : 'light');

            return newMode;
        });
    };

    return (
        <>
            {/* Initial loader */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-lightBackground dark:bg-darkBackground"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-primary text-4xl font-bold"
                        >
                            AURAS
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-screen flex flex-col bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight transition-colors duration-300">
                {/* Toast notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: isDarkMode ? '#262626' : '#fcf4f4',
                            color: isDarkMode ? '#d8e2dc' : '#262626',
                            border: '1px solid #bd8790',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
                <Header isDarkMode={isDarkMode} setIsDarkMode={toggleDarkMode} />

                {/* Main Content */}
                <main className="flex-grow">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoading ? 0 : 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>

                {/* Footer */}
                <Footer />

                {/* Scroll to top button */}
                <ScrollToTopButton />
            </div>
        </>
    );
};

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 z-20"
                    aria-label="Scroll to top"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6"/>
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default MainLayout;