import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiRefreshCw, FiChevronRight, FiGrid, FiList, FiArrowLeft, FiAlertCircle, FiX, FiCheck } from 'react-icons/fi';
import useProduct from '../../hooks/useProduct';
import useBrandCategory from '../../hooks/useBrandCategory';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSorting from '../../components/products/ProductSorting';
import ProductPagination from '../../components/products/ProductPagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProductQuickView from '../../components/products/ProductQuickView';
import { ProductFilterParams, ProductResponseDTO } from '../../types/product.types';
import { BrandResponseDTO } from "../../types/brand.types";
import { CategoryResponseDTO } from "../../types/category.types";
import AOS from 'aos';
import 'aos/dist/aos.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const { categorySlug, brandSlug } = useParams<{ categorySlug?: string; brandSlug?: string }>();
    const [searchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isSorting, setIsSorting] = useState(false);

    // Refs for tracking state and preventing redundant operations
    const initialLoadComplete = useRef(false);
    const lastSearchParams = useRef('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevCategorySlug = useRef<string | undefined>(categorySlug);
    const prevBrandSlug = useRef<string | undefined>(brandSlug);
    const isUpdatingUrlRef = useRef(false);
    const isApplyingFiltersRef = useRef(false);
    const debounceTimerRef = useRef<number | null>(null);
    const scrollPositionRef = useRef(0); // Store scroll position when locking

    // Category state
    const [allCategories, setAllCategories] = useState<CategoryResponseDTO[]>([]);
    const [categoriesFullyLoaded, setCategoriesFullyLoaded] = useState(false);
    const processedCategoryIdsRef = useRef(new Set<number>());

    // Temporary filters for popup
    const [tempFilters, setTempFilters] = useState<{
        categoryIds: number[];
        brandIds: number[];
        minPrice: number | null;
        maxPrice: number | null;
    }>({
        categoryIds: [],
        brandIds: [],
        minPrice: null,
        maxPrice: null
    });

    // Product quick view state
    const [selectedProduct, setSelectedProduct] = useState<ProductResponseDTO | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Get product data from hook
    const {
        products,
        loading,
        totalProducts,
        error,
        currentPage,
        pageSize,
        totalPages,
        searchTerm,
        selectedCategory,
        selectedBrand,
        selectedCategories = [],
        selectedBrands = [],
        selectedCategoryNames = [],
        selectedBrandNames = [],
        priceRange,
        sortBy,
        sortDir,
        updatePage,
        resetFilters,
        applyFilters,
        DEFAULT_PAGE_SIZE
    } = useProduct();

    // Function to check if any filters are actively applied - improved to handle all cases
    const hasActiveFilters = useCallback(() => {
        const hasCategories = selectedCategories && selectedCategories.length > 0;
        const hasBrands = selectedBrands && selectedBrands.length > 0;
        const hasCategory = selectedCategory !== null && selectedCategory !== undefined;
        const hasBrand = selectedBrand !== null && selectedBrand !== undefined;
        const hasMinPrice = priceRange && priceRange.min !== null && priceRange.min !== undefined;
        const hasMaxPrice = priceRange && priceRange.max !== null && priceRange.max !== undefined;
        const hasSearch = searchTerm !== null && searchTerm !== undefined && searchTerm.trim() !== '';

        return hasCategories || hasBrands || hasCategory || hasBrand || hasMinPrice || hasMaxPrice || hasSearch;
    }, [selectedCategories, selectedBrands, selectedCategory, selectedBrand, priceRange, searchTerm]);

    // Get category and brand information
    const {
        getCategoryBySlug,
        getBrandBySlug,
        selectedCategory: categoryDetail,
        selectedBrand: brandDetail,
        activeParentCategories,
        activeBrands,
        loadInitialData,
        getCategoryWithSubcategories
    } = useBrandCategory();

    // Enhanced scroll locking functionality
    const lockScroll = useCallback(() => {
        // Save current scroll position
        scrollPositionRef.current = window.pageYOffset;

        // Add styles to body to prevent scrolling
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = '100%';

        // Add a class for additional styling if needed
        document.body.classList.add('body-scroll-lock');
    }, []);

    const unlockScroll = useCallback(() => {
        // Remove styles from body
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);

        // Remove class
        document.body.classList.remove('body-scroll-lock');
    }, []);

    // Lock/unlock body scroll when filter drawer is opened/closed - enhanced version
    useEffect(() => {
        if (filtersOpen) {
            lockScroll();
        } else {
            unlockScroll();
        }

        // Cleanup function to ensure we restore scrolling if component unmounts while drawer is open
        return () => {
            if (filtersOpen) {
                unlockScroll();
            }
        };
    }, [filtersOpen, lockScroll, unlockScroll]);

    // Prevent touch events when drawer is open
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (filtersOpen) {
                // Allow scrolling inside the drawer itself
                let targetElement = e.target as Node;
                const filterDrawer = document.querySelector('.filter-drawer-content');

                // Check if the target is within the filter drawer content
                while (targetElement !== null) {
                    if (targetElement === filterDrawer) {
                        return; // Allow scrolling, it's inside the drawer content
                    }
                    if (targetElement.parentNode) {
                        targetElement = targetElement.parentNode;
                    } else {
                        break;
                    }
                }

                // Prevent scrolling for elements outside the drawer
                e.preventDefault();
            }
        };

        // Add event listener with passive: false to allow preventDefault()
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [filtersOpen]);

    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            easing: 'ease-out-cubic',
            delay: 50
        });
        return () => {
            if (typeof AOS.refresh === 'function') {
                AOS.refresh();
            }
        };
    }, []);

    // Add some additional styling for proper z-index management
    useEffect(() => {
        // Add style to ensure header has higher z-index than filter drawer
        const style = document.createElement('style');
        style.textContent = `
            header, nav.sticky {
                z-index: 50 !important;
                position: relative;
            }
            
            .filter-drawer-backdrop {
                z-index: 40;
            }
            
            .filter-drawer {
                z-index: 41;
            }
            
            /* Additional styles for scroll lock */
            body.body-scroll-lock {
                height: 100%;
                overflow: hidden !important;
                touch-action: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Initialize with CSS variables to handle header height properly
    useEffect(() => {
        // Set header height CSS variable
        const headerElement = document.querySelector('header');
        if (headerElement) {
            const headerHeight = headerElement.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

            // Update on resize
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    document.documentElement.style.setProperty('--header-height', `${entry.contentRect.height}px`);
                }
            });

            resizeObserver.observe(headerElement);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    // Update temporary filters when opening the popup
    useEffect(() => {
        if (filtersOpen) {
            setTempFilters({
                categoryIds: [...selectedCategories],
                brandIds: [...selectedBrands],
                minPrice: priceRange.min,
                maxPrice: priceRange.max
            });
        }
    }, [filtersOpen, selectedCategories, selectedBrands, priceRange]);

    // Handle URL params change
    useEffect(() => {
        // Only trigger if URL params actually changed
        if (categorySlug === prevCategorySlug.current && brandSlug === prevBrandSlug.current) {
            return;
        }

        // Update refs for the next render
        prevCategorySlug.current = categorySlug;
        prevBrandSlug.current = brandSlug;

        // Set flags to prevent concurrent operations
        let isInitializing = true;
        isApplyingFiltersRef.current = true;

        const initFromUrl = async () => {
            try {
                // Category page handling
                if (categorySlug) {
                    // Skip if already loaded
                    if (categoryDetail && categoryDetail.slug === categorySlug) {
                        console.log('Category already loaded, skipping fetch');
                        isApplyingFiltersRef.current = false;
                        return;
                    }

                    console.log(`Fetching category by slug: ${categorySlug}`);
                    const category = await getCategoryBySlug(categorySlug) as CategoryResponseDTO | null;

                    if (category && isInitializing) {
                        // Create filter params
                        const filterParams: ProductFilterParams = {
                            categoryId: category.categoryId,
                            page: 0,
                            size: DEFAULT_PAGE_SIZE
                        };

                        await applyFilters(filterParams);
                        initialLoadComplete.current = true;
                    }
                }
                // Brand page handling
                else if (brandSlug) {
                    // Skip if already loaded
                    if (brandDetail && brandDetail.slug === brandSlug) {
                        console.log('Brand already loaded, skipping fetch');
                        isApplyingFiltersRef.current = false;
                        return;
                    }

                    console.log(`Fetching brand by slug: ${brandSlug}`);
                    const brand = await getBrandBySlug(brandSlug) as BrandResponseDTO | null;

                    if (brand && isInitializing) {
                        // Create filter params
                        const filterParams: ProductFilterParams = {
                            brandId: brand.brandId,
                            page: 0,
                            size: DEFAULT_PAGE_SIZE
                        };

                        await applyFilters(filterParams);
                        initialLoadComplete.current = true;
                    }
                }
                // Default products page with no slugs
                else if (!searchParams.toString()) {
                    // Load all products
                    await applyFilters({
                        page: 0,
                        size: DEFAULT_PAGE_SIZE,
                        sortBy: 'createdAt',
                        sortDir: 'desc'
                    });
                    initialLoadComplete.current = true;
                }
            } catch (error) {
                console.error('Error initializing from URL:', error);
                toast.error('Đã xảy ra lỗi khi tải dữ liệu', {
                    icon: <FiAlertCircle className="text-red-500" />,
                });
            } finally {
                // Reset filter application flag
                isApplyingFiltersRef.current = false;
            }
        };

        initFromUrl();

        return () => {
            // Cleanup function to prevent state updates after unmount
            isInitializing = false;
        };
    }, [categorySlug, brandSlug, getCategoryBySlug, getBrandBySlug, applyFilters, resetFilters, searchParams, categoryDetail, brandDetail, DEFAULT_PAGE_SIZE]);

    // Track data loading state
    const isLoadingInitialData = useRef(false);

    // Initial data load with better protection against recursive calls
    useEffect(() => {
        // Multiple guards against unnecessary loading
        if (
            isLoadingInitialData.current ||
            categoriesFullyLoaded ||
            (allCategories.length > 0 && activeParentCategories && activeParentCategories.length > 0)
        ) {
            return;
        }

        // Set loading flag
        isLoadingInitialData.current = true;

        const effectId = Date.now();
        let effectCancelled = false;

        const loadInitialDataOnce = async () => {
            try {
                console.log(`[${effectId}] Loading initial category and brand data...`);

                if (effectCancelled) return;

                // Load initial data
                const { categories } = await loadInitialData();

                if (effectCancelled) return;

                if (categories && categories.length > 0) {
                    const allCategoriesArray: CategoryResponseDTO[] = [...categories];
                    const processedIds = processedCategoryIdsRef.current;

                    // Add parent categories to processed set
                    categories.forEach(cat => processedIds.add(cat.categoryId));

                    // Load subcategories gradually to avoid overwhelming the server
                    const priorityCategories = categories.slice(0, 3);

                    for (const category of priorityCategories) {
                        if (effectCancelled) break;

                        try {
                            // Add a small delay between requests
                            await new Promise(resolve => setTimeout(resolve, 300));

                            const hierarchy = await getCategoryWithSubcategories(category.categoryId);

                            if (effectCancelled) break;

                            if (hierarchy && hierarchy.subcategories && hierarchy.subcategories.length > 0) {
                                // Only add new subcategories
                                hierarchy.subcategories.forEach(subcat => {
                                    if (!processedIds.has(subcat.categoryId)) {
                                        allCategoriesArray.push(subcat);
                                        processedIds.add(subcat.categoryId);
                                    }
                                });
                            }
                        } catch (error) {
                            console.error(`Error loading subcategories for ${category.name}:`, error);
                        }
                    }

                    if (!effectCancelled) {
                        console.log(`[${effectId}] Loaded ${allCategoriesArray.length} total categories`);
                        setAllCategories(allCategoriesArray);
                        setCategoriesFullyLoaded(true);
                    }
                }

                // Load all products if no filters are applied
                if (!categorySlug && !brandSlug && !hasActiveFilters() && !initialLoadComplete.current && !isApplyingFiltersRef.current) {
                    console.log('Loading all products initially');
                    isApplyingFiltersRef.current = true;
                    try {
                        await applyFilters({
                            page: 0,
                            size: DEFAULT_PAGE_SIZE,
                            sortBy: 'createdAt',
                            sortDir: 'desc'
                        });
                        initialLoadComplete.current = true;
                    } finally {
                        isApplyingFiltersRef.current = false;
                    }
                }
            } catch (error) {
                console.error(`Error loading initial data:`, error);
            } finally {
                if (!effectCancelled) {
                    isLoadingInitialData.current = false;
                }
            }
        };

        // Small delay before loading to prevent rapid initialization
        const initTimeout = setTimeout(loadInitialDataOnce, 300);

        // Cleanup function
        return () => {
            effectCancelled = true;
            clearTimeout(initTimeout);
            isLoadingInitialData.current = false;
        };
    }, [loadInitialData, getCategoryWithSubcategories, activeParentCategories, categoriesFullyLoaded, allCategories.length, hasActiveFilters, applyFilters, categorySlug, brandSlug, DEFAULT_PAGE_SIZE]);

    // Improved search params handling
    useEffect(() => {
        // Skip if already applying filters or updating URL
        if (isApplyingFiltersRef.current || isUpdatingUrlRef.current) {
            return;
        }

        const currentSearchString = searchParams.toString();

        // Skip if unchanged or initial load complete
        if (currentSearchString === lastSearchParams.current && initialLoadComplete.current) {
            return;
        }

        lastSearchParams.current = currentSearchString;

        // Skip for category or brand pages
        if (categorySlug || brandSlug) {
            initialLoadComplete.current = true;
            return;
        }

        // If no search params, load all products
        if (!currentSearchString) {
            if (!initialLoadComplete.current && !isApplyingFiltersRef.current) {
                console.log('Loading all products from URL handling');
                isApplyingFiltersRef.current = true;
                applyFilters({
                    page: 0,
                    size: DEFAULT_PAGE_SIZE,
                    sortBy: 'createdAt',
                    sortDir: 'desc'
                })
                    .then(() => {
                        initialLoadComplete.current = true;
                    })
                    .finally(() => {
                        isApplyingFiltersRef.current = false;
                    });
            }
            return;
        }

        // Extract search parameters
        const search = searchParams.get('search') || '';

        // Support for multiple category and brand IDs in URL
        let categoryIds: number[] = [];
        let brandIds: number[] = [];

        // Parse category IDs
        const categoryParam = searchParams.get('category');
        const categoriesParam = searchParams.get('categories');

        if (categoriesParam) {
            // Parse comma-separated list
            categoryIds = categoriesParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        } else if (categoryParam) {
            const categoryId = parseInt(categoryParam);
            if (!isNaN(categoryId)) {
                categoryIds = [categoryId];
            }
        }

        // Parse brand IDs
        const brandParam = searchParams.get('brand');
        const brandsParam = searchParams.get('brands');

        if (brandsParam) {
            // Parse comma-separated list
            brandIds = brandsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        } else if (brandParam) {
            const brandId = parseInt(brandParam);
            if (!isNaN(brandId)) {
                brandIds = [brandId];
            }
        }

        // Parse other parameters
        const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') || '0') : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') || '0') : undefined;
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '0') : 0;
        const urlSortBy = searchParams.get('sortBy') || 'createdAt';
        const urlSortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';
        const size = searchParams.get('size') ? parseInt(searchParams.get('size') || '15') : DEFAULT_PAGE_SIZE;

        // Build filter parameters
        const filterParams: ProductFilterParams = {
            page,
            size,
            sortBy: urlSortBy,
            sortDir: urlSortDir,
        };

        if (search) filterParams.search = search;

        // Apply category IDs
        if (categoryIds.length > 0) {
            filterParams.categoryIds = categoryIds;
        } else if (categoryParam) {
            const categoryId = parseInt(categoryParam);
            if (!isNaN(categoryId)) filterParams.categoryId = categoryId;
        }

        // Apply brand IDs
        if (brandIds.length > 0) {
            filterParams.brandIds = brandIds;
        } else if (brandParam) {
            const brandId = parseInt(brandParam);
            if (!isNaN(brandId)) filterParams.brandId = brandId;
        }

        // Apply price range
        if (minPrice) filterParams.minPrice = minPrice;
        if (maxPrice) filterParams.maxPrice = maxPrice;

        // Apply filters with debouncing
        isApplyingFiltersRef.current = true;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = window.setTimeout(() => {
            applyFilters(filterParams)
                .then(() => {
                    initialLoadComplete.current = true;
                })
                .catch((err) => {
                    console.error('Error applying filters from search params:', err);
                    toast.error('Đã xảy ra lỗi khi tải sản phẩm', {
                        icon: <FiAlertCircle className="text-red-500" />,
                    });
                })
                .finally(() => {
                    isApplyingFiltersRef.current = false;
                    debounceTimerRef.current = null;
                });
        }, 300);
    }, [searchParams, applyFilters, categorySlug, brandSlug, hasActiveFilters, DEFAULT_PAGE_SIZE]);

    // Update URL based on filters - with better throttling
    useEffect(() => {
        // Skip if initial load isn't complete
        if (!initialLoadComplete.current) return;

        // Skip URL updates if on a category or brand page
        if (categorySlug || brandSlug) return;

        // Skip if currently applying filters from URL
        if (isApplyingFiltersRef.current) return;

        // Use a timeout to batch URL updates
        const updateUrlTimer = setTimeout(() => {
            isUpdatingUrlRef.current = true;

            try {
                const params = new URLSearchParams();
                if (currentPage > 0) params.set('page', currentPage.toString());
                if (pageSize !== DEFAULT_PAGE_SIZE) params.set('size', pageSize.toString());
                if (searchTerm) params.set('search', searchTerm);

                // Handle multiple selection of categories
                if (selectedCategories.length > 0) {
                    params.set('categories', selectedCategories.join(','));
                } else if (selectedCategory) {
                    params.set('category', selectedCategory.toString());
                }

                // Handle multiple selection of brands
                if (selectedBrands.length > 0) {
                    params.set('brands', selectedBrands.join(','));
                } else if (selectedBrand) {
                    params.set('brand', selectedBrand.toString());
                }

                // Handle price range
                if (priceRange.min) params.set('minPrice', priceRange.min.toString());
                if (priceRange.max) params.set('maxPrice', priceRange.max.toString());

                // Handle sorting
                if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
                if (sortDir !== 'desc') params.set('sortDir', sortDir);

                const currentSearch = searchParams.toString();
                const newSearch = params.toString();

                // Only navigate if there's a real change and not already applying filters
                if (currentSearch !== newSearch && !isApplyingFiltersRef.current) {
                    lastSearchParams.current = newSearch;
                    navigate({ search: newSearch }, { replace: true });
                }
            } finally {
                // Always reset the flag
                setTimeout(() => {
                    isUpdatingUrlRef.current = false;
                }, 100);
            }
        }, 300); // Debounce URL updates

        return () => clearTimeout(updateUrlTimer);
    }, [currentPage, pageSize, searchTerm, selectedCategories, selectedBrands, selectedCategory, selectedBrand, priceRange, sortBy, sortDir, navigate, searchParams, categorySlug, brandSlug, DEFAULT_PAGE_SIZE]);

    // Scroll to top when changing page
    const handlePageChange = useCallback((page: number) => {
        updatePage(page);

        // Scroll to top of product section with smooth animation
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [updatePage]);

    // Reset all filters - enhanced with better user feedback
    const handleFilterReset = useCallback(() => {
        if (isApplyingFiltersRef.current) return; // Prevent multiple resets

        isApplyingFiltersRef.current = true;
        setIsSorting(true);

        try {
            // Show loading toast
            const loadingToast = toast.loading('Đang xóa bộ lọc...');

            // Reset filter state
            resetFilters();
            lastSearchParams.current = '';

            // Reset temp filters
            setTempFilters({
                categoryIds: [],
                brandIds: [],
                minPrice: null,
                maxPrice: null
            });

            // If on a category or brand page, navigate to products page
            if (categorySlug || brandSlug) {
                navigate('/products', { replace: true });

                // Show success message after navigation
                setTimeout(() => {
                    toast.success('Đã xóa tất cả bộ lọc', {
                        id: loadingToast,
                        icon: <FiRefreshCw className="text-green-500" />,
                        duration: 3000
                    });
                }, 300);
            } else {
                // Load all products
                applyFilters({
                    page: 0,
                    size: DEFAULT_PAGE_SIZE,
                    sortBy: 'createdAt',
                    sortDir: 'desc'
                })
                    .then(() => {
                        navigate('/products', { replace: true });

                        toast.success('Đã xóa tất cả bộ lọc', {
                            id: loadingToast,
                            icon: <FiRefreshCw className="text-green-500" />,
                            duration: 3000
                        });
                    })
                    .catch(err => {
                        console.error('Error resetting filters:', err);
                        toast.error('Đã xảy ra lỗi khi xóa bộ lọc', {
                            id: loadingToast,
                            icon: <FiAlertCircle className="text-red-500" />,
                            duration: 3000
                        });
                    });
            }
        } finally {
            // Reset the flags after a delay to ensure UI updates properly
            setTimeout(() => {
                isApplyingFiltersRef.current = false;
                setIsSorting(false);
            }, 300);
        }
    }, [resetFilters, navigate, categorySlug, brandSlug, applyFilters, DEFAULT_PAGE_SIZE]);

    // Handle temporary filter changes in popup
    const handleTempFilterChange = useCallback((filters: {
        categoryId?: number | null;
        brandId?: number | null;
        categoryIds?: number[] | null;
        brandIds?: number[] | null;
        minPrice?: number | null;
        maxPrice?: number | null;
        searchTerm?: string;
    }) => {
        const updatedTempFilters = { ...tempFilters };

        // Handle categories
        if (filters.categoryIds !== undefined) {
            updatedTempFilters.categoryIds = filters.categoryIds || [];
        } else if (filters.categoryId !== undefined) {
            const categoryId = filters.categoryId;
            if (categoryId !== null) {
                if (!updatedTempFilters.categoryIds.includes(categoryId)) {
                    updatedTempFilters.categoryIds = [...updatedTempFilters.categoryIds, categoryId];
                }
            }
        }

        // Handle brands
        if (filters.brandIds !== undefined) {
            updatedTempFilters.brandIds = filters.brandIds || [];
        } else if (filters.brandId !== undefined) {
            const brandId = filters.brandId;
            if (brandId !== null) {
                if (!updatedTempFilters.brandIds.includes(brandId)) {
                    updatedTempFilters.brandIds = [...updatedTempFilters.brandIds, brandId];
                }
            }
        }

        // Handle price range
        if (filters.minPrice !== undefined) {
            updatedTempFilters.minPrice = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
            updatedTempFilters.maxPrice = filters.maxPrice;
        }

        setTempFilters(updatedTempFilters);
    }, [tempFilters]);

    // Apply filters when confirming from popup - with better error handling and feedback
    const handleApplyFilters = useCallback(() => {
        // Prevent multiple simultaneous filter applications
        if (isApplyingFiltersRef.current) return;

        setIsSorting(true);
        isApplyingFiltersRef.current = true;

        // Show feedback to user
        toast.dismiss(); // Clear any existing toasts
        const loadingToast = toast.loading('Đang áp dụng bộ lọc...');

        // Create filter params from temp filters
        const filterParams: ProductFilterParams = {
            page: 0,
            size: DEFAULT_PAGE_SIZE,
            sortBy,
            sortDir,
            categoryIds: tempFilters.categoryIds.length > 0 ? tempFilters.categoryIds : undefined,
            brandIds: tempFilters.brandIds.length > 0 ? tempFilters.brandIds : undefined,
            minPrice: tempFilters.minPrice,
            maxPrice: tempFilters.maxPrice
        };

        // Clear any existing timers
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Apply filters with a short delay to allow UI to update
        debounceTimerRef.current = window.setTimeout(() => {
            applyFilters(filterParams)
                .then(() => {
                    toast.success('Đã áp dụng bộ lọc thành công', {
                        id: loadingToast,
                        icon: <FiCheck className="text-green-500" />,
                    });
                })
                .catch((err) => {
                    console.error('Error applying filters:', err);
                    toast.error('Đã xảy ra lỗi khi lọc sản phẩm', {
                        id: loadingToast,
                        icon: <FiAlertCircle className="text-red-500" />,
                    });
                })
                .finally(() => {
                    setIsSorting(false);
                    setFiltersOpen(false);
                    isApplyingFiltersRef.current = false;
                    debounceTimerRef.current = null;
                });
        }, 100);
    }, [applyFilters, tempFilters, sortBy, sortDir, DEFAULT_PAGE_SIZE]);

    // Handle filter changes - for direct filter changes outside popup - improved debouncing
    const handleFilterChange = useCallback((filters: {
        categoryId?: number | null;
        brandId?: number | null;
        categoryIds?: number[] | null;
        brandIds?: number[] | null;
        minPrice?: number | null;
        maxPrice?: number | null;
        searchTerm?: string;
    }) => {
        if (loading || isSorting || isApplyingFiltersRef.current) return;

        // Show subtle loading indication
        setIsSorting(true);

        // Create filter params with default values
        const filterParams: ProductFilterParams = {
            page: 0,
            size: DEFAULT_PAGE_SIZE
        };

        // Handle search term
        if (filters.searchTerm !== undefined) {
            filterParams.search = filters.searchTerm;
        }

        // Handle categories with improved handling
        if (filters.categoryIds !== undefined) {
            // Use empty array if null to properly clear filters
            filterParams.categoryIds = filters.categoryIds || [];
        } else if (filters.categoryId !== undefined) {
            if (filters.categoryId !== null) {
                filterParams.categoryId = filters.categoryId;
            }
        }

        // Handle brands with improved handling
        if (filters.brandIds !== undefined) {
            // Use empty array if null to properly clear filters
            filterParams.brandIds = filters.brandIds || [];
        } else if (filters.brandId !== undefined) {
            if (filters.brandId !== null) {
                filterParams.brandId = filters.brandId;
            }
        }

        // Handle price range
        if (filters.minPrice !== undefined) {
            filterParams.minPrice = filters.minPrice !== null ? filters.minPrice : undefined;
        }
        if (filters.maxPrice !== undefined) {
            filterParams.maxPrice = filters.maxPrice !== null ? filters.maxPrice : undefined;
        }

        // Include sort settings
        if (sortBy) filterParams.sortBy = sortBy;
        if (sortDir) filterParams.sortDir = sortDir;

        // Apply filters with better debouncing - mark as applying
        isApplyingFiltersRef.current = true;

        // Clear any existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timer with shorter delay for better responsiveness
        debounceTimerRef.current = window.setTimeout(() => {
            // Log filter parameters for debugging
            console.log('Applying filters with params:', filterParams);

            applyFilters(filterParams)
                .then(() => {
                    // Success - no need for toast on individual filter changes
                    console.log('Filters applied successfully');
                })
                .catch((err) => {
                    console.error('Error applying filters:', err);
                    toast.error('Đã xảy ra lỗi khi lọc sản phẩm', {
                        icon: <FiAlertCircle className="text-red-500" />,
                        duration: 3000
                    });
                })
                .finally(() => {
                    setIsSorting(false);
                    isApplyingFiltersRef.current = false;
                    debounceTimerRef.current = null;
                });
        }, 100); // Reduced from 300ms to 100ms for faster feedback

        // Return cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        };
    }, [applyFilters, sortBy, sortDir, loading, isSorting, DEFAULT_PAGE_SIZE]);

    // Handle category click (navigate to category page)
    const handleCategoryClick = useCallback((category: CategoryResponseDTO) => {
        navigate(`/category/${category.slug}`);
    }, [navigate]);

    // Handle brand click (navigate to brand page)
    const handleBrandClick = useCallback((brand: BrandResponseDTO) => {
        navigate(`/brand/${brand.slug}`);
    }, [navigate]);

    // Handle view mode change
    const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
        setViewMode(mode);
    }, []);

    // Open product quick view
    const handleOpenQuickView = useCallback((product: ProductResponseDTO) => {
        console.log("Opening quick view for product:", product);
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    }, []);

    // Close product quick view
    const handleCloseQuickView = useCallback(() => {
        console.log("Closing quick view");
        setIsQuickViewOpen(false);
        // Clear selected product after animation completes
        setTimeout(() => {
            setSelectedProduct(null);
        }, 300);
    }, []);

    // Handle closing the filter drawer
    const handleCloseFilterDrawer = useCallback(() => {
        setFiltersOpen(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Ensure scrolling is restored when component unmounts
            unlockScroll();

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        };
    }, [unlockScroll]);

    // Show loading spinner when first loading products
    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Product Quick View Modal */}
            {selectedProduct && (
                <ProductQuickView
                    product={selectedProduct}
                    isOpen={isQuickViewOpen}
                    onClose={handleCloseQuickView}
                />
            )}

            {/* Filters Popup - Fixed positioning to appear below header */}
            <AnimatePresence>
                {filtersOpen && (
                    <>
                        {/* Backdrop - use higher z-index but lower than header */}
                        <motion.div
                            className="fixed inset-0 z-[40] bg-black bg-opacity-60 filter-drawer-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={handleCloseFilterDrawer}
                        />
                        {/* Filter panel - positioned with absolute top coordinate to clear header */}
                        <motion.div
                            className="fixed top-[var(--header-height,72px)] inset-y-auto bottom-0 left-0 z-[41] w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex flex-col filter-drawer"
                            style={{ height: 'calc(100vh - var(--header-height, 72px))' }}
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="flex-shrink-0 px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bộ lọc sản phẩm</h2>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
                                    onClick={handleCloseFilterDrawer}
                                >
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {/* Filter content - with flex-grow to fill available space and custom class for allowing scroll */}
                            <div className="flex-grow overflow-y-auto p-6 filter-drawer-content">
                                <ProductFilters
                                    selectedCategories={tempFilters.categoryIds}
                                    selectedBrands={tempFilters.brandIds}
                                    priceRange={{
                                        min: tempFilters.minPrice,
                                        max: tempFilters.maxPrice
                                    }}
                                    onFilterChange={handleTempFilterChange}
                                    onResetFilters={() => setTempFilters({
                                        categoryIds: [],
                                        brandIds: [],
                                        minPrice: null,
                                        maxPrice: null
                                    })}
                                    isMobile
                                    onClose={handleCloseFilterDrawer}
                                    categories={activeParentCategories || []}
                                    brands={activeBrands || []}
                                    allCategories={allCategories}
                                    isLoading={loading || isSorting}
                                    dontApplyFiltersImmediately
                                />
                            </div>
                            {/* Footer buttons - with flex-shrink-0 to maintain size */}
                            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setTempFilters({
                                            categoryIds: [],
                                            brandIds: [],
                                            minPrice: null,
                                            maxPrice: null
                                        })}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FiX className="inline-block mr-1.5" />
                                        Xóa
                                    </button>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition-colors font-medium"
                                        disabled={loading || isSorting}
                                    >
                                        {loading || isSorting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang áp dụng...
                                            </span>
                                        ) : (
                                            <>
                                                <FiCheck className="inline-block mr-1.5" />
                                                Áp dụng
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-screen-7xl">
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center text-sm mb-8 text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm"
                    data-aos="fade-down"
                >
                    <Link to="/" className="hover:text-primary dark:hover:text-accent transition-colors">
                        Trang chủ
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                    <Link to="/products" className={`hover:text-primary dark:hover:text-accent transition-colors ${!categorySlug && !brandSlug ? 'text-primary dark:text-accent font-medium' : ''}`}>
                        Sản phẩm
                    </Link>

                    {/* Show category in breadcrumb if explicitly set via URL */}
                    {categorySlug && categoryDetail && (
                        <>
                            <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                            <span className="text-primary dark:text-accent font-medium">
                                {categoryDetail.name}
                            </span>
                        </>
                    )}

                    {/* Show brand in breadcrumb if explicitly set via URL */}
                    {brandSlug && brandDetail && (
                        <>
                            <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                            <span className="text-primary dark:text-accent font-medium">
                                {brandDetail.name}
                            </span>
                        </>
                    )}

                    {/* Show active filter breadcrumbs when user has explicitly applied filters */}
                    {!categorySlug && !brandSlug && hasActiveFilters() && (
                        <>
                            {selectedCategoryNames.length > 0 && (
                                <>
                                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                                    <div className="flex items-center space-x-2 flex-wrap">
                                        {selectedCategoryNames.map((name, index) => (
                                            <span key={`cat-${index}`} className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent px-2 py-0.5 rounded-md text-xs">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {selectedBrandNames.length > 0 && (
                                <>
                                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                                    <div className="flex items-center space-x-2 flex-wrap">
                                        {selectedBrandNames.map((name, index) => (
                                            <span key={`brand-${index}`} className="bg-accent/10 dark:bg-accent/20 text-accent px-2 py-0.5 rounded-md text-xs">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </motion.nav>

                {/* Back Button for Mobile */}
                {(categoryDetail || brandDetail) && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => navigate(-1)}
                        className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline transition-colors"
                        data-aos="fade-right"
                    >
                        <FiArrowLeft className="mr-2 w-5 h-5" /> Quay lại
                    </motion.button>
                )}

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    data-aos="fade-up"
                    ref={scrollRef}
                >
                    <div className="flex flex-col">
                        {/* Main Content Area */}
                        <div
                            className="flex-1 p-6"
                            data-aos="fade-left"
                            data-aos-delay="200"
                        >
                            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Filter button */}
                                <div>
                                    <motion.button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                        onClick={() => setFiltersOpen(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={loading || isSorting}
                                    >
                                        <FiFilter className="mr-2 h-5 w-5" />
                                        Bộ lọc {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                                    {selectedCategories.length + selectedBrands.length}
                                                </span>
                                    )}
                                    </motion.button>
                                </div>

                                {/* Controls: View Mode Toggle + Reset Filters */}
                                <div className="flex items-center space-x-3">
                                    {/* View mode toggle */}
                                    <div className="flex shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            type="button"
                                            className={`p-2 ${
                                                viewMode === 'grid'
                                                    ? 'bg-primary text-white shadow-inner'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed`}
                                            onClick={() => handleViewModeChange('grid')}
                                            title="Chế độ lưới"
                                            disabled={loading || isSorting}
                                        >
                                            <FiGrid className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`p-2 ${
                                                viewMode === 'list'
                                                    ? 'bg-primary text-white shadow-inner'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed`}
                                            onClick={() => handleViewModeChange('list')}
                                            title="Chế độ danh sách"
                                            disabled={loading || isSorting}
                                        >
                                            <FiList className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Reset filters button */}
                                    {hasActiveFilters() && (
                                        <motion.button
                                            type="button"
                                            className="inline-flex items-center p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                            onClick={handleFilterReset}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Đặt lại bộ lọc"
                                            disabled={loading || isSorting}
                                        >
                                            <FiRefreshCw className={`h-5 w-5 ${loading || isSorting ? 'animate-spin' : ''}`} />
                                        </motion.button>
                                    )}
                                </div>

                                {/* Sorting */}
                                <div className="w-full sm:w-auto">
                                    <ProductSorting isLoading={loading || isSorting} />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters() && (
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Bộ lọc đang dùng:</span>

                                    {/* Selected categories with remove option */}
                                    {selectedCategoryNames.map((name, index) => (
                                        <span key={`cat-${index}`} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent">
                                            {name}
                                            <button
                                                onClick={() => handleFilterChange({
                                                    categoryIds: selectedCategories.filter(id => id !== selectedCategories[index])
                                                })}
                                                className="ml-1.5 h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-primary/20"
                                            >
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}

                                    {/* Selected brands with remove option */}
                                    {selectedBrandNames.map((name, index) => (
                                        <span key={`brand-${index}`} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 dark:bg-accent/20 text-accent">
                                            {name}
                                            <button
                                                onClick={() => handleFilterChange({
                                                    brandIds: selectedBrands.filter(id => id !== selectedBrands[index])
                                                })}
                                                className="ml-1.5 h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-accent/20"
                                            >
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}

                                    {/* Price range filter */}
                                    {(priceRange.min !== null || priceRange.max !== null) && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            Giá: {priceRange.min !== null ? new Intl.NumberFormat('vi-VN').format(priceRange.min) : '0'}
                                            {' - '}
                                            {priceRange.max !== null ? new Intl.NumberFormat('vi-VN').format(priceRange.max) : '∞'}
                                            <button
                                                onClick={() => handleFilterChange({
                                                    minPrice: null,
                                                    maxPrice: null
                                                })}
                                                className="ml-1.5 h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    )}

                                    {/* Clear all filters button */}
                                    <button
                                        onClick={handleFilterReset}
                                        className="text-xs text-primary dark:text-accent hover:underline ml-2"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            )}

                            {/* Product Content */}
                            {loading || isSorting ? (
                                <div className="flex justify-center items-center py-16">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center"
                                    >
                                        <LoadingSpinner size="large" />
                                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                                            {isSorting ? 'Đang sắp xếp sản phẩm...' : 'Đang tải sản phẩm...'}
                                        </p>
                                    </motion.div>
                                </div>
                            ) : error ? (
                                <EmptyState
                                    title="Đã xảy ra lỗi"
                                    description="Không thể tải sản phẩm. Vui lòng thử lại sau."
                                    action={{ label: 'Thử lại', onClick: () => window.location.reload() }}
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    }
                                />
                            ) : products.length > 0 ? (
                                <>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-inner border border-gray-100 dark:border-gray-700 p-4">
                                        <ProductGrid
                                            products={products}
                                            loading={loading || isSorting}
                                            viewMode={viewMode}
                                            onViewModeChange={handleViewModeChange}
                                            categories={activeParentCategories || []}
                                            brands={activeBrands || []}
                                            onOpenQuickView={handleOpenQuickView}
                                            onCategoryClick={handleCategoryClick}
                                            onBrandClick={handleBrandClick}
                                        />
                                    </div>

                                    {/* Pagination - Only shown at the bottom */}
                                    {totalPages > 1 && (
                                        <div className="mt-8">
                                            <ProductPagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                                isLoading={loading || isSorting}
                                            />
                                        </div>
                                    )}

                                    {/* Products count summary */}
                                    {totalProducts > 0 && (
                                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Hiển thị {Math.min(currentPage * pageSize + 1, totalProducts)} - {Math.min((currentPage + 1) * pageSize, totalProducts)} trên tổng số {totalProducts} sản phẩm
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EmptyState
                                    title="Không tìm thấy sản phẩm"
                                    description="Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn."
                                    action={{ label: 'Xóa bộ lọc', onClick: handleFilterReset }}
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            <path d="M15 15l-4-4" />
                                        </svg>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default React.memo(ProductsPage);