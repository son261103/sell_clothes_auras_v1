import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import HeroSection from '../components/home/HeroSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromotionBanner from '../components/home/PromotionBanner';
import Newsletter from '../components/home/Newsletter';
import InstagramFeed from '../components/home/InstagramFeed';
import TestimonialSection from '../components/home/TestimonialSection';

const Home: React.FC = () => {
    const [activeSection, setActiveSection] = useState('hero');
    const [showNavIndicator, setShowNavIndicator] = useState(false);

    const homeRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({
        hero: useRef<HTMLDivElement>(null),
        categories: useRef<HTMLDivElement>(null),
        products: useRef<HTMLDivElement>(null),
        promotion: useRef<HTMLDivElement>(null),
        testimonials: useRef<HTMLDivElement>(null),
        instagram: useRef<HTMLDivElement>(null),
        newsletter: useRef<HTMLDivElement>(null),
    });

    const { scrollY } = useScroll();

    // Parallax effect values
    const heroParallax = useTransform(scrollY, [0, 500], [0, -150]);
    const categoriesParallax = useTransform(scrollY, [300, 1000], [0, -100]);
    const productsParallax = useTransform(scrollY, [600, 1500], [0, -80]);
    const promotionParallax = useTransform(scrollY, [1000, 2000], [0, -60]);
    const testimonialParallax = useTransform(scrollY, [1500, 2500], [0, -40]);
    const instagramParallax = useTransform(scrollY, [2000, 3000], [0, -30]);
    const newsletterParallax = useTransform(scrollY, [2500, 3500], [0, -20]);

    // Opacity effects for fade in/out
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
    const newsletterOpacity = useTransform(scrollY, [2500, 3300], [0.3, 1]);

    // Initialize AOS animation library with enhanced settings
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
            offset: 50,
            easing: 'ease-in-out',
            delay: 100
        });

        // Refresh AOS when component mounts
        AOS.refresh();

        return () => {
            // Clean up
        };
    }, []);

    // Handle scroll for active section detection and section navigation
    useEffect(() => {
        const handleScroll = () => {
            // Show navigation indicator after scrolling past hero section
            if (window.scrollY > window.innerHeight * 0.5) {
                setShowNavIndicator(true);
            } else {
                setShowNavIndicator(false);
            }

            // Determine active section
            const scrollPosition = window.scrollY + window.innerHeight * 0.3;

            for (const [section, ref] of Object.entries(sectionRefs.current)) {
                if (ref.current) {
                    const element = ref.current;
                    const offsetTop = element.offsetTop;
                    const height = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Function to scroll to a specific section
    const scrollToSection = (section: string) => {
        const ref = sectionRefs.current[section];
        if (ref.current) {
            window.scrollTo({
                top: ref.current.offsetTop - 80, // Adjust for header height
                behavior: 'smooth'
            });
        }
    };

    return (
        <motion.div
            ref={homeRef}
            className="min-h-screen overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Side navigation indicator */}
            <AnimatePresence>
                {showNavIndicator && (
                    <motion.div
                        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden md:block"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col gap-3">
                            {Object.keys(sectionRefs.current).map((section) => (
                                <motion.button
                                    key={section}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        activeSection === section
                                            ? 'bg-primary scale-125'
                                            : 'bg-primary/30 hover:bg-primary/50'
                                    }`}
                                    onClick={() => scrollToSection(section)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={section.charAt(0).toUpperCase() + section.slice(1)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section with parallax effect */}
            <motion.div
                ref={sectionRefs.current.hero}
                style={{ y: heroParallax, opacity: heroOpacity }}
            >
                <HeroSection />
            </motion.div>

            {/* Main Content with staggered sections and parallax effects */}
            <motion.div className="space-y-6 py-4">
                {/* Featured Categories */}
                <motion.section
                    ref={sectionRefs.current.categories}
                    className="mb-6 mx-4 relative z-10"
                    style={{ y: categoriesParallax }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                >
                    <FeaturedCategories />
                </motion.section>

                {/* Featured Products */}
                <motion.section
                    ref={sectionRefs.current.products}
                    className="py-6 mx-4 relative z-20"
                    style={{ y: productsParallax }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    <FeaturedProducts />
                </motion.section>

                {/* Promotion Banner */}
                <motion.section
                    ref={sectionRefs.current.promotion}
                    className="mb-6 mx-4 relative z-10"
                    style={{ y: promotionParallax }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <PromotionBanner />
                </motion.section>

                {/* Testimonials Section */}
                <motion.section
                    ref={sectionRefs.current.testimonials}
                    className="py-6 mx-4 relative z-20"
                    style={{ y: testimonialParallax }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <TestimonialSection />
                </motion.section>

                {/* Instagram Feed */}
                <motion.section
                    ref={sectionRefs.current.instagram}
                    className="py-6 mx-4 relative z-10"
                    style={{ y: instagramParallax }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <InstagramFeed />
                </motion.section>

                {/* Newsletter */}
                <motion.section
                    ref={sectionRefs.current.newsletter}
                    className="mb-6 mx-4 relative z-20"
                    style={{ y: newsletterParallax, opacity: newsletterOpacity }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <Newsletter />
                </motion.section>
            </motion.div>

            {/* Background decorative elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />

                <motion.div
                    className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 2
                    }}
                />

                <motion.div
                    className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full bg-primary/10 blur-3xl"
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 4
                    }}
                />
            </div>
        </motion.div>
    );
};

export default Home;