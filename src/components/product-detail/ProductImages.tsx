import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { FiZoomIn, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Lightbox from 'react-spring-lightbox';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

interface ProductImagesProps {
    images: string[];
    activeImageIndex: number;
    setActiveImageIndex: (index: number) => void;
    discount?: number | null;
    productName: string;
}

const ProductImages: React.FC<ProductImagesProps> = ({
                                                         images,
                                                         activeImageIndex,
                                                         setActiveImageIndex,
                                                         discount,
                                                         productName,
                                                     }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const [sliderRef, instanceRef] = useKeenSlider({
        initial: activeImageIndex,
        slides: {
            perView: 'auto' as const,
            spacing: 10,
        },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });

    const [currentSlide, setCurrentSlide] = useState(0);

    const handlePrevImage = () => setActiveImageIndex(activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1);
    const handleNextImage = () => setActiveImageIndex(activeImageIndex === images.length - 1 ? 0 : activeImageIndex + 1);
    const openLightbox = () => setLightboxOpen(true);
    const closeLightbox = () => setLightboxOpen(false);

    const renderHeader = () => (
        <div className="absolute top-0 right-0 p-4 z-10">
            <button onClick={closeLightbox} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );

    const renderPrevButton = ({ canPrev }: { canPrev?: boolean }) => (
        <button
            onClick={handlePrevImage}
            disabled={!canPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 ${!canPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <FiChevronLeft className="w-6 h-6" />
        </button>
    );

    const renderNextButton = ({ canNext }: { canNext?: boolean }) => (
        <button
            onClick={handleNextImage}
            disabled={!canNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 ${!canNext ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <FiChevronRight className="w-6 h-6" />
        </button>
    );

    return (
        <div className="w-full">
            {/* Main large image display */}
            <div className="relative group flex justify-center">
                {images.length > 0 ? (
                    <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={3}
                        centerOnInit
                    >
                        <TransformComponent wrapperClass="w-full max-w-[500px]">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square relative flex items-center justify-center w-full h-[400px]">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={images[activeImageIndex]}
                                        alt={`${productName} - Image ${activeImageIndex + 1}`}
                                        className="object-contain w-full h-full"
                                        style={{
                                            maxHeight: '95%',
                                            maxWidth: '95%',
                                            minHeight: '95%',
                                            minWidth: '95%',
                                        }}
                                    />
                                </div>
                                {discount && (
                                    <div className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                                        -{discount}%
                                    </div>
                                )}
                            </div>
                        </TransformComponent>
                    </TransformWrapper>
                ) : (
                    <div className="w-full max-w-[500px] h-[350px] aspect-square flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        Không có hình ảnh
                    </div>
                )}
                <button
                    onClick={openLightbox}
                    className="absolute top-4 right-4 bg-gray-800/70 hover:bg-gray-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <FiZoomIn className="w-5 h-5" />
                </button>
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail carousel */}
            {images.length > 1 && (
                <div className="mt-6 relative" data-aos="fade-up" data-aos-delay="200">
                    <div ref={sliderRef} className="keen-slider thumbnail-container">
                        {images.map((image, index) => (
                            <div key={`thumb-${index}`} className="keen-slider__slide thumb-slide">
                                <button
                                    onClick={() => {
                                        setActiveImageIndex(index);
                                        instanceRef.current?.moveToIdx(index);
                                    }}
                                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-50 dark:bg-gray-800 ${
                                        activeImageIndex === index
                                            ? 'border-primary dark:border-accent'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-accent/50'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${productName} - Thumbnail ${index + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ maxHeight: '85%', maxWidth: '85%' }}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Navigation arrows */}
                    {instanceRef.current && (
                        <>
                            <button
                                onClick={() => instanceRef.current?.prev()}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2"
                                disabled={currentSlide === 0}
                            >
                                <FiChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                            </button>
                            <button
                                onClick={() => instanceRef.current?.next()}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2"
                                disabled={
                                    currentSlide ===
                                    instanceRef.current.track.details.slides.length - 4
                                }
                            >
                                <FiChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                            </button>
                        </>
                    )}

                    {/* Dots indicators */}
                    {instanceRef.current && (
                        <div className="flex justify-center gap-2 mt-4">
                            {[...Array(Math.ceil(images.length / 4))].map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => instanceRef.current?.moveToIdx(idx * 4)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        currentSlide >= idx * 4 && currentSlide < (idx + 1) * 4
                                            ? 'bg-primary dark:bg-accent w-4'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && images.length > 0 && (
                <Lightbox
                    isOpen={lightboxOpen}
                    onClose={closeLightbox}
                    images={images.map((src, index) => ({
                        src,
                        alt: `${productName} - Image ${index + 1}`,
                    }))}
                    currentIndex={activeImageIndex}
                    onNext={handleNextImage}
                    onPrev={handlePrevImage}
                    renderHeader={renderHeader}
                    renderPrevButton={renderPrevButton}
                    renderNextButton={renderNextButton}
                    style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                />
            )}

            {/* Custom styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .thumbnail-container {
                    padding: 10px 25px;
                }
                .thumb-slide {
                    min-width: 80px;
                    max-width: 80px;
                    display: flex;
                    justify-content: center;
                }
                .keen-slider:focus, 
                .keen-slider__slide:focus,
                .thumb-slide:focus,
                .thumb-slide button:focus {
                    outline: none;
                }
                .react-spring-lightbox-image {
                    max-width: 85% !important;
                    max-height: 85% !important;
                    object-fit: contain !important;
                }
                `
            }} />
        </div>
    );
};

export default ProductImages;