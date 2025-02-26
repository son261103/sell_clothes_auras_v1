import { useState, useEffect } from 'react';
import AppRoutes from './routes';
import 'aos/dist/aos.css';
import AOS from 'aos';
import ToastProvider from './components/common/ToastProvider';
import { Toaster } from 'react-hot-toast';

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        // Kiểm tra localStorage hoặc mặc định là light mode
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 50,
            easing: 'ease-out-cubic',
        });
        // Cập nhật class cho body khi thay đổi dark mode
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    return (
        <ToastProvider>
            <AppRoutes isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <Toaster position="top-right" reverseOrder={false} />
        </ToastProvider>
    );
};

export default App;


