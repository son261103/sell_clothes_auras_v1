import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import 'aos/dist/aos.css';
import AOS from 'aos';
import ToastProvider from './components/common/ToastProvider.tsx';

const App = () => {
    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 50,
            easing: 'ease-out-cubic'
        });
    }, []);

    return (
        <Router>
            <ToastProvider>
                <AppRoutes />
            </ToastProvider>
        </Router>
    );
};

export default App;