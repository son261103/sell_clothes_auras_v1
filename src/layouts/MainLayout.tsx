import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion, Variants } from 'framer-motion';

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

// Cherry Blossom SVG component - Beautiful realistic design
const CherryBlossomIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="60"
        height="60"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Center of flower */}
        <circle cx="50" cy="50" r="8" fill="url(#centerGradient)" />

        {/* Stamens/filaments in center */}
        {[...Array(12)].map((_, i) => (
            <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + Math.cos(i * Math.PI/6) * 10}
                y2={50 + Math.sin(i * Math.PI/6) * 10}
                stroke="#FFDD00"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        ))}
        {[...Array(12)].map((_, i) => (
            <circle
                key={i}
                cx={50 + Math.cos(i * Math.PI/6) * 10}
                cy={50 + Math.sin(i * Math.PI/6) * 10}
                r="1.5"
                fill="#FF9E40"
            />
        ))}

        {/* Five main petals */}
        <path d="M50 15C56 15 62 24 62 33C62 42 56 45 50 45C44 45 38 42 38 33C38 24 44 15 50 15Z" fill="url(#petalGradient)" />
        <path d="M15 50C15 44 24 38 33 38C42 38 45 44 45 50C45 56 42 62 33 62C24 62 15 56 15 50Z" fill="url(#petalGradient)" />
        <path d="M50 85C44 85 38 76 38 67C38 58 44 55 50 55C56 55 62 58 62 67C62 76 56 85 50 85Z" fill="url(#petalGradient)" />
        <path d="M85 50C85 56 76 62 67 62C58 62 55 56 55 50C55 44 58 38 67 38C76 38 85 44 85 50Z" fill="url(#petalGradient)" />
        <path d="M26 26C30 22 43 24 48 33C53 42 50 48 46 52C42 56 36 59 27 54C18 49 22 30 26 26Z" fill="url(#petalGradient)" />

        {/* Subtle petal vein lines */}
        <path d="M50 15C50 15 50 30 50 45" stroke="#FFAFC5" strokeWidth="0.7" strokeOpacity="0.6" />
        <path d="M15 50C15 50 30 50 45 50" stroke="#FFAFC5" strokeWidth="0.7" strokeOpacity="0.6" />
        <path d="M50 85C50 85 50 70 50 55" stroke="#FFAFC5" strokeWidth="0.7" strokeOpacity="0.6" />
        <path d="M85 50C85 50 70 50 55 50" stroke="#FFAFC5" strokeWidth="0.7" strokeOpacity="0.6" />
        <path d="M26 26C26 26 36 36 46 52" stroke="#FFAFC5" strokeWidth="0.7" strokeOpacity="0.6" />

        {/* Gradients */}
        <defs>
            <radialGradient id="petalGradient" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#FFDDF0" />
                <stop offset="60%" stopColor="#FFCDEB" />
                <stop offset="100%" stopColor="#FFAFC5" />
            </radialGradient>

            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFEE99" />
                <stop offset="100%" stopColor="#FFCC33" />
            </radialGradient>
        </defs>
    </svg>
);

// Enhanced Sunshine rays animation with more dynamic light effects
const SunshineRays = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const rayCount = 36; // Increased number of rays for fuller effect

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
            {[...Array(rayCount)].map((_, i) => {
                const angle = (i * 360 / rayCount) % 360;
                const delay = i * (8 / rayCount);
                const length = 160 + Math.random() * 70; // Longer rays
                const thickness = i % 4 === 0 ? 4 : i % 3 === 0 ? 2.5 : 1.5; // More varied thicknesses

                return (
                    <motion.div
                        key={i}
                        className={`absolute origin-center ${isDarkMode ? 'opacity-20' : 'opacity-40'}`}
                        style={{
                            height: `${length}px`,
                            width: `${thickness}px`,
                            background: isDarkMode
                                ? 'linear-gradient(to top, rgba(255, 175, 204, 0), rgba(255, 200, 220, 0.9))'
                                : 'linear-gradient(to top, rgba(255, 175, 204, 0), rgba(255, 230, 240, 0.9))',
                            borderRadius: '999px',
                            transformOrigin: 'bottom center',
                            transform: `rotate(${angle}deg) translateY(-50%)`,
                            filter: 'blur(0.6px)'
                        }}
                        animate={{
                            height: [`${length * 0.9}px`, `${length * 1.2}px`, `${length * 0.9}px`],
                            opacity: [0.3, 0.8, 0.3],
                            // Subtle pulsing effect for rays
                            width: [`${thickness * 0.8}px`, `${thickness * 1.2}px`, `${thickness * 0.8}px`]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            ease: "easeInOut",
                            delay: delay,
                            repeat: Infinity,
                            repeatType: "mirror" as const
                        }}
                    />
                );
            })}

            {/* Add circular glow behind the flower */}
            <motion.div
                className="absolute rounded-full z-0"
                style={{
                    background: isDarkMode
                        ? 'radial-gradient(circle, rgba(255,175,204,0.15) 0%, rgba(255,175,204,0) 70%)'
                        : 'radial-gradient(circle, rgba(255,175,204,0.3) 0%, rgba(255,175,204,0) 70%)',
                    width: '180px',
                    height: '180px'
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.9, 0.7]
                }}
                transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />
        </div>
    );
};

// Enhanced floating cherry blossom petals with perfectly round petals
const FloatingPetals = ({ isDarkMode }: { isDarkMode: boolean }) => {
    // Increased number of petals for more visual impact
    const petals = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        size: Math.random() * 22 + 10, // Slightly larger petals
        left: Math.random() * 100,
        delay: Math.random() * 10, // More varied delays
        duration: Math.random() * 20 + 15, // Longer floating durations
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2, // Random rotation direction and speed
        swayFactor: Math.random() * 40 + 10 // How much the petal sways side to side
    }));

    // Perfect round petals for better visual appearance
    const renderPetal = () => {
        return (
            <circle cx="7.5" cy="3.5" r="3.5" fill="currentColor" />
        );
    };

    const petalVariants: Variants = {
        initial: (petal) => ({
            top: -50,
            left: `${petal.left}%`,
            opacity: 0,
            rotate: petal.rotation,
            scale: 0.6
        }),
        animate: (petal) => ({
            top: "120%",
            left: [
                `${petal.left}%`,
                `${petal.left + (Math.random() * petal.swayFactor - petal.swayFactor/2)}%`,
                `${petal.left + (Math.random() * petal.swayFactor - petal.swayFactor/2)}%`,
                `${petal.left + (Math.random() * petal.swayFactor - petal.swayFactor/2)}%`,
                `${petal.left + (Math.random() * petal.swayFactor - petal.swayFactor/2)}%`,
                `${petal.left + (Math.random() * petal.swayFactor - petal.swayFactor/2)}%`
            ],
            opacity: [0, 0.8, 0.8, 0.8, 0.5, 0],
            rotate: [
                petal.rotation,
                petal.rotation + 120 * petal.rotationSpeed,
                petal.rotation + 240 * petal.rotationSpeed,
                petal.rotation + 360 * petal.rotationSpeed,
                petal.rotation + 480 * petal.rotationSpeed
            ],
            scale: [0.6, 1, 1, 0.9, 0.7],
            transition: {
                duration: petal.duration,
                delay: petal.delay,
                ease: "easeInOut",
                repeat: Infinity,
                times: [0, 0.2, 0.4, 0.6, 0.8, 1]
            }
        })
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {petals.map((petal) => (
                <motion.div
                    key={petal.id}
                    custom={petal}
                    variants={petalVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute"
                >
                    <svg
                        width={petal.size}
                        height={petal.size}
                        viewBox="0 0 15 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${isDarkMode ? "opacity-40" : "opacity-70"} text-pink-200`}
                    >
                        {renderPetal()}
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// Enhanced subtle shimmer effect for the background
const ShimmerEffect = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const shimmerVariants: Variants = {
        animate: {
            background: isDarkMode
                ? ['linear-gradient(45deg, rgba(255,175,204,0) 0%, rgba(255,175,204,0.04) 50%, rgba(255,175,204,0) 100%)',
                    'linear-gradient(45deg, rgba(255,175,204,0.04) 0%, rgba(255,175,204,0) 50%, rgba(255,175,204,0.04) 100%)',
                    'linear-gradient(45deg, rgba(255,175,204,0) 0%, rgba(255,175,204,0.04) 50%, rgba(255,175,204,0) 100%)']
                : ['linear-gradient(45deg, rgba(255,175,204,0) 0%, rgba(255,175,204,0.15) 50%, rgba(255,175,204,0) 100%)',
                    'linear-gradient(45deg, rgba(255,175,204,0.15) 0%, rgba(255,175,204,0) 50%, rgba(255,175,204,0.15) 100%)',
                    'linear-gradient(45deg, rgba(255,175,204,0) 0%, rgba(255,175,204,0.15) 50%, rgba(255,175,204,0) 100%)'],
            backgroundSize: '200% 200%',
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            transition: {
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror" as const
            }
        }
    };

    return (
        <motion.div
            className="absolute inset-0 z-0 pointer-events-none"
            variants={shimmerVariants}
            animate="animate"
        />
    );
};

// UPDATED: Cherry Blossom Rain Effect - Continuous flow of petals that fall faster
const CherryBlossomRain = ({ isDarkMode, intensity = "medium" }: { isDarkMode: boolean, intensity?: "light" | "medium" | "heavy" }) => {
    // Adjusted petal counts - slightly reduced
    const getPetalCount = () => {
        switch (intensity) {
            case "light": return 45;  // Reduced from 60 to 45
            case "medium": return 90; // Reduced from 120 to 90
            case "heavy": return 140; // Reduced from 180 to 140
            default: return 90;
        }
    };

    // Create petals array with various properties
    const petals = Array.from({ length: getPetalCount() }, (_, i) => ({
        id: i,
        size: Math.random() * 18 + 8, // Various sizes
        left: Math.random() * 100, // Horizontal position
        // UPDATED: Minimal delay to create a continuous flow of petals
        delay: Math.random() * 0.2, // UPDATED: Drastically reduced from 3.0 to 0.2 for much faster appearance
        // Slightly slowed down the falling speed
        duration: Math.random() * 12 + 10, // Slightly increased from (Math.random() * 10 + 8) to (Math.random() * 12 + 10)
        rotation: Math.random() * 360, // Initial rotation
        rotationSpeed: (Math.random() - 0.5) * 1.5, // Rotation speed
        swayFactor: Math.random() * 15 + 5, // Slight increase in sway for more natural movement
        petalType: Math.floor(Math.random() * 4) // 0-3 for different petal shapes
    }));

    // Render different petal shapes for variety
    const renderPetal = (petalType: number) => {
        switch (petalType) {
            case 0: // Round petal
                return <circle cx="7.5" cy="3.5" r="3.5" fill="currentColor" />;
            case 1: // Oval petal
                return <ellipse cx="7.5" cy="3.5" rx="4.5" ry="3" fill="currentColor" />;
            case 2: // Heart-shaped petal
                return (
                    <path d="M7.5 7C7.5 7 0 3.5 0 1.5C0 0 1.5 0 2.5 0.5C3.5 1 4 1.5 4.5 2C5 1.5 5.5 1 6.5 0.5C7.5 0 9 0 9 1.5C9 3.5 7.5 7 7.5 7Z"
                          fill="currentColor" transform="translate(3, 0) scale(0.8)" />
                );
            case 3: // Classic cherry blossom petal
                return (
                    <path d="M7.5 0C9 0 11 1 12 3C13 5 12 7 7.5 7C3 7 2 5 3 3C4 1 6 0 7.5 0Z"
                          fill="currentColor" transform="scale(0.9)" />
                );
            default:
                return <circle cx="7.5" cy="3.5" r="3.5" fill="currentColor" />;
        }
    };

    // UPDATED: Rain animation with faster falling and quicker repetition
    const rainVariants: Variants = {
        initial: (petal) => ({
            top: -50 - Math.random() * 300, // Distribute petals across a larger vertical range
            left: `${petal.left}%`,
            opacity: 0.8, // Start more visible immediately
            rotate: petal.rotation,
            scale: 0.8
        }),
        animate: (petal) => ({
            top: "120%", // Fall below viewport
            left: [
                `${petal.left}%`,
                `${petal.left + petal.swayFactor/2}%`,
                `${petal.left - petal.swayFactor/2}%`,
                `${petal.left + petal.swayFactor/3}%`,
                `${petal.left}%`
            ],
            opacity: [0, 0.9, 0.9, 0.7, 0],
            rotate: [
                petal.rotation,
                petal.rotation + 90 * petal.rotationSpeed,
                petal.rotation + 180 * petal.rotationSpeed,
                petal.rotation + 270 * petal.rotationSpeed,
                petal.rotation + 360 * petal.rotationSpeed
            ],
            scale: [0.6, 1, 1, 0.9, 0.8],
            transition: {
                duration: petal.duration,
                delay: petal.delay,
                ease: "linear",
                repeat: Infinity,
                // UPDATED: Zero delay between repetitions for continuous flow
                repeatDelay: 0, // UPDATED: Removed delay entirely (from 1 to 0)
                times: [0, 0.2, 0.4, 0.7, 1]
            }
        })
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {petals.map((petal) => (
                <motion.div
                    key={petal.id}
                    custom={petal}
                    variants={rainVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute"
                >
                    <svg
                        width={petal.size}
                        height={petal.size}
                        viewBox="0 0 15 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${isDarkMode ? "opacity-40" : "opacity-80"} text-pink-200`}
                    >
                        {renderPetal(petal.petalType)}
                    </svg>
                </motion.div>
            ))}
        </div>
    );
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

        // Reduced loading time for quicker app startup
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500); // Reduced from 3500ms to 1500ms for faster loading

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

    // Animation variants for smoother transitions
    const containerVariants: Variants = {
        initial: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const logoVariants: Variants = {
        initial: { scale: 0.8, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 1.2, opacity: 0, y: -20 }
    };

    // Enhanced animations for the flower with rotation
    const flowerContainerVariants: Variants = {
        initial: {
            scale: 0.9,
            opacity: 0,
            filter: "blur(10px)",
            rotate: 0
        },
        animate: {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            rotate: 0, // Start at 0 degrees - rotation will be handled by continuous animation
            transition: {
                duration: 1.2,
                ease: [0.34, 1.56, 0.64, 1], // Spring-like ease
                delay: 0.3
            }
        }
    };

    // Enhanced float animation with gentle continuous rotation for the cherry blossom
    const floatVariants: Variants = {
        animate: {
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0], // Gentle rotation back and forth
            transition: {
                y: {
                    duration: 5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror" as const
                },
                rotate: {
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror" as const,
                    times: [0, 0.33, 0.66, 1]
                }
            }
        }
    };

    // New continuous rotation animation for the cherry blossom
    const spinVariants: Variants = {
        animate: {
            rotate: [0, 360],
            transition: {
                duration: 30,
                ease: "linear",
                repeat: Infinity
            }
        }
    };

    // Color scheme based on dark mode
    const getBackgroundStyle = () => {
        return isDarkMode
            ? {
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                backgroundSize: "cover"
            }
            : {
                background: "linear-gradient(135deg, #fff1f2 0%, #fff8f8 100%)",
                backgroundSize: "cover"
            };
    };

    return (
        <>
            {/* Enhanced full-page loading screen with cherry blossom and sunshine rays */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
                        style={{
                            ...getBackgroundStyle(),
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9999
                        }}
                        variants={containerVariants}
                        initial="initial"
                        exit="exit"
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    >
                        {/* Shimmer background effect */}
                        <ShimmerEffect isDarkMode={isDarkMode} />

                        {/* Floating petals with enhanced animation and round shape */}
                        <FloatingPetals isDarkMode={isDarkMode} />

                        {/* Updated cherry blossom rain with faster, continuous petals */}
                        <CherryBlossomRain isDarkMode={isDarkMode} intensity="heavy" />

                        {/* Central container for flower and text */}
                        <motion.div
                            className="relative flex flex-col items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Enhanced sunrays behind flower */}
                            <div className="absolute z-0" style={{ transform: "scale(1.8)" }}>
                                <SunshineRays isDarkMode={isDarkMode} />
                            </div>

                            {/* Spinning cherry blossom animation with two layers of motion */}
                            <motion.div
                                variants={flowerContainerVariants}
                                initial="initial"
                                animate="animate"
                                className="relative z-10 mb-10"
                                style={{
                                    filter: "drop-shadow(0 0 15px rgba(255, 175, 204, 0.6))"
                                }}
                            >
                                {/* First layer: Gentle floating motion */}
                                <motion.div
                                    variants={floatVariants}
                                    animate="animate"
                                    className="transform-gpu"
                                >
                                    {/* Second layer: Continuous slow rotation */}
                                    <motion.div
                                        variants={spinVariants}
                                        animate="animate"
                                        className="transform-gpu"
                                    >
                                        <CherryBlossomIcon className="w-32 h-32" />
                                    </motion.div>
                                </motion.div>
                            </motion.div>

                            {/* Logo text with enhanced styling & animated gradient */}
                            <motion.div
                                variants={logoVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{
                                    duration: 0.8,
                                    delay: 0.6,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 12
                                }}
                                className="relative text-6xl font-bold tracking-wider z-10"
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-br from-pink-400 via-pink-500 to-pink-400 bg-size-200 animate-gradient-x"
                                      style={{
                                          textShadow: isDarkMode
                                              ? "0 0 30px rgba(244, 114, 182, 0.4)"
                                              : "0 0 30px rgba(244, 114, 182, 0.2)"
                                      }}
                                >
                                    AURAS
                                </span>
                            </motion.div>

                            {/* Enhanced loading text with elegant typing animation */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="mt-8 flex items-center justify-center z-10"
                            >
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-pink-200' : 'text-pink-600'}`}>
                                    Đang tải
                                </span>
                                <motion.div
                                    className="ml-1 overflow-hidden"
                                    animate={{
                                        width: ["0px", "24px", "0px"]
                                    }}
                                    transition={{
                                        duration: 1.8,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeInOut",
                                        times: [0, 0.5, 1]
                                    }}
                                >
                                    <span className={`${isDarkMode ? 'text-pink-300' : 'text-pink-500'} inline-block`}>
                                        ...
                                    </span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Only render the main content when not loading */}
            {!isLoading && (
                <div className="min-h-screen flex flex-col bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight transition-colors duration-500 relative overflow-hidden">
                    {/* Updated cherry blossom rain with continuous flow for main page */}
                    <CherryBlossomRain isDarkMode={isDarkMode} intensity="heavy" />

                    {/* Toast notifications with refined styling */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: isDarkMode ? 'rgba(38, 38, 38, 0.95)' : 'rgba(252, 244, 244, 0.95)',
                                color: isDarkMode ? '#d8e2dc' : '#262626',
                                border: '1px solid #ff9eb6',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)'
                            },
                            success: {
                                iconTheme: {
                                    primary: '#ff9eb6',
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

                    {/* Header with higher z-index to stay above petals */}
                    <Header isDarkMode={isDarkMode} setIsDarkMode={toggleDarkMode} />

                    {/* Main Content with improved animation and higher z-index */}
                    <main className="flex-grow relative z-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1,
                                delay: 0.3,
                                ease: [0.25, 0.1, 0.25, 1.0] // Cubic bezier for smoother motion
                            }}
                        >
                            <Outlet />
                        </motion.div>
                    </main>

                    {/* Footer with higher z-index */}
                    <Footer />

                    {/* Enhanced Scroll to top button with cherry blossom animations */}
                    <ScrollToTopButton isDarkMode={isDarkMode} />
                </div>
            )}
        </>
    );
};

// Enhanced scroll to top button with cherry blossom theme and spinning animation
const ScrollToTopButton = ({ isDarkMode }: { isDarkMode: boolean }) => {
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

    // Enhanced button animations with smoother transitions
    const buttonVariants: Variants = {
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: 20 },
        hover: {
            scale: 1.1,
            boxShadow: "0 10px 25px rgba(255, 158, 182, 0.4)"
        },
        tap: { scale: 0.95 }
    };

    // Cherry blossom spin animation
    const cherryBlossomVariants: Variants = {
        animate: {
            rotate: [0, 360],
            transition: {
                duration: 6,
                ease: "linear",
                repeat: Infinity
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-4 rounded-full text-white z-50 overflow-hidden group"
                    style={{
                        background: "linear-gradient(135deg, #ff9eb6 0%, #ff7eb9 100%)",
                        boxShadow: isDarkMode
                            ? "0 8px 25px rgba(255, 158, 182, 0.3)"
                            : "0 8px 25px rgba(255, 158, 182, 0.5)"
                    }}
                    aria-label="Scroll to top"
                    transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 15
                    }}
                >
                    {/* Spinning Cherry blossom icon appears on hover */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        variants={cherryBlossomVariants}
                        animate="animate"
                    >
                        <span className="text-white">🌸</span>
                    </motion.div>

                    {/* Arrow icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         className="group-hover:opacity-50 transition-opacity duration-300"
                    >
                        <path d="M18 15l-6-6-6 6"/>
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default MainLayout;