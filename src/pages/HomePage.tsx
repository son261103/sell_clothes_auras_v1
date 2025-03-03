import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
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
    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 40
        });

        // Refresh AOS when component mounts
        AOS.refresh();

        return () => {
            // Clean up
        };
    }, []);

    return (
        <motion.div
            className="min-h-screen"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
        >
            {/* Hero Section */}
            <HeroSection/>

            {/* Main Content */}
            <div className="space-y-3 py-2 mt-1">
                {/* Featured Categories */}
                <section className="mb-3">
                    <FeaturedCategories/>
                </section>

                {/* Featured Products */}
                <section className=" py-2 mb-3">
                    <FeaturedProducts/>
                </section>

                {/* Promotion Banner */}
                <section className="mb-3">
                    <PromotionBanner/>
                </section>

                {/* Testimonials Section */}
                <section className="py-4">
                    <TestimonialSection/>
                </section>


                {/* Instagram Feed */}
                <section className="py-2">
                    <InstagramFeed/>
                </section>

                {/* Newsletter */}
                <section className="mb-3">
                    <Newsletter/>
                </section>
            </div>
        </motion.div>
    );
};

export default Home;