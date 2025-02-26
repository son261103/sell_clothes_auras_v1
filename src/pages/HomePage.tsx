import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromotionBanner from '../components/home/PromotionBanner';
import Newsletter from '../components/home/Newsletter';
import InstagramFeed from '../components/home/InstagramFeed';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <HeroSection/>
            {/* Main Content with Background */}
            <div>
                {/* Featured Categories */}
                <div >
                    <FeaturedCategories/>
                </div>

                {/* Background Divider */}
                <div>
                    {/* Featured Products */}
                    <FeaturedProducts/>
                </div>

                {/* Promotion Banner */}
                <div >
                    <PromotionBanner/>
                </div>

                {/* Newsletter */}
                <Newsletter/>

                {/* Instagram Feed */}
                <div >
                    <InstagramFeed/>
                </div>
            </div>
        </div>
    )
        ;
};

export default Home;