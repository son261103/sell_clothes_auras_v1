// src/pages/order/OrderListPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useOrder from '../../hooks/useOrder';
import useAuth from '../../hooks/useAuth';
import { OrderStatus, OrderSummaryDTO } from '../../types/order.types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPackage, FiFilter, FiChevronLeft, FiChevronRight,
    FiSearch, FiEye, FiShoppingBag, FiRefreshCw, FiCalendar,
    FiArrowLeft, FiAlertCircle
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

const statusFilters = [
    { label: 'Tất cả', value: null },
    { label: 'Chờ xác nhận', value: OrderStatus.PENDING },
    { label: 'Đã xác nhận', value: OrderStatus.CONFIRMED },
    { label: 'Đang xử lý', value: OrderStatus.PROCESSING },
    { label: 'Đang giao hàng', value: OrderStatus.SHIPPING },
    { label: 'Hoàn thành', value: OrderStatus.COMPLETED },
    { label: 'Đã hủy', value: OrderStatus.CANCELLED }
];

// Component for a single order card in the list
const OrderCard: React.FC<{ order: OrderSummaryDTO; onViewDetails: () => void }> = ({ order, onViewDetails }) => {
    const { getOrderStatusText } = useOrder();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy - HH:mm', { locale: vi });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getStatusBadgeColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case OrderStatus.CONFIRMED:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case OrderStatus.PROCESSING:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case OrderStatus.SHIPPING:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case OrderStatus.COMPLETED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case OrderStatus.CANCELLED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-lg transition-all"
            data-aos="fade-up"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Đơn hàng #{order.orderId}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <FiCalendar className="mr-1" />
                        {formatDate(order.createdAt)}
                    </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                    {getOrderStatusText(order.status)}
                </span>
            </div>

            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm">
                    <div className="text-gray-500 dark:text-gray-400">
                        <p>Sản phẩm: <span className="font-medium text-gray-900 dark:text-white">{order.totalItems}</span></p>
                        {order.shippingMethodName && (
                            <p className="mt-1">Vận chuyển: <span className="font-medium text-gray-900 dark:text-white">{order.shippingMethodName}</span></p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 dark:text-gray-400">Tổng tiền:</p>
                        <p className="text-primary dark:text-accent font-semibold">{formatPrice(order.totalAmount)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order.paymentStatus && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                            order.paymentStatus === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : order.paymentStatus === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                            {order.paymentStatus === 'COMPLETED'
                                ? 'Đã thanh toán'
                                : order.paymentStatus === 'PENDING'
                                    ? 'Chờ thanh toán'
                                    : 'Thanh toán thất bại'
                            }
                        </span>
                    )}
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onViewDetails}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white rounded-lg inline-flex items-center transition-colors shadow-sm"
                >
                    <FiEye className="mr-2" /> Chi tiết
                </motion.button>
            </div>
        </motion.div>
    );
};

const OrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const {
        getUserOrders,
        orderList,
        pagination,
        loading,
        error,
    } = useOrder();

    const [currentPage, setCurrentPage] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            easing: 'ease-out-cubic',
            delay: 50
        });
        return () => AOS.refresh();
    }, []);

    // Fetch orders on component mount and when filters change
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                await getUserOrders(currentPage, 10, selectedStatus || undefined);
                setIsInitialized(true);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error('Không thể tải danh sách đơn hàng', {
                    icon: <FiAlertCircle className="text-red-500" />,
                });
            }
        };

        fetchOrders();
    }, [isAuthenticated, navigate, getUserOrders, currentPage, selectedStatus]);

    // Handle status filter change
    const handleStatusChange = (status: OrderStatus | null) => {
        setSelectedStatus(status);
        setCurrentPage(0); // Reset to first page when changing filters
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);

        // Scroll to top of the page with smooth animation
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Handle search (client-side filtering for now)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Note: For simplicity, we're just setting the search term here
        // In a real app, you might want to call an API with search parameters
    };

    // Filter orders client-side based on search term (order ID)
    const filteredOrders = orderList.filter(order =>
        searchTerm ? order.orderId.toString().includes(searchTerm) : true
    );

    // Handle view details click
    const handleViewOrderDetails = (orderId: number) => {
        navigate(`/order/order-detail/${orderId}`);
    };

    // Render loading state
    if (loading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <EmptyState
                title="Không thể tải danh sách đơn hàng"
                description="Đã xảy ra lỗi khi tải danh sách đơn hàng. Vui lòng thử lại sau."
                action={{ label: 'Thử lại', onClick: () => window.location.reload() }}
                icon={<FiRefreshCw className="w-12 h-12 text-primary dark:text-accent" />}
            />
        );
    }

    // Render empty state if no orders
    if (isInitialized && orderList.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
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

                        <span className="text-gray-900 dark:text-white font-medium">
                            Đơn hàng của tôi
                        </span>
                    </motion.nav>

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <div className="bg-primary/10 dark:bg-accent/20 p-2 rounded-full mr-3">
                                <FiPackage className="w-6 h-6 text-primary dark:text-accent" />
                            </div>
                            Đơn hàng của tôi
                        </h1>
                    </div>

                    <EmptyState
                        title="Bạn chưa có đơn hàng nào"
                        description="Bạn chưa có đơn hàng nào. Hãy mua sắm và quay lại sau."
                        action={{ label: 'Mua sắm ngay', onClick: () => navigate('/products') }}
                        icon={<FiShoppingBag className="w-16 h-16 text-primary dark:text-accent" />}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
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

                    <span className="text-gray-900 dark:text-white font-medium">
                        Đơn hàng của tôi
                    </span>
                </motion.nav>

                {/* Back Button for Mobile */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => navigate('/')}
                    className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline transition-colors"
                    data-aos="fade-right"
                >
                    <FiArrowLeft className="mr-2 w-5 h-5" /> Quay lại trang chủ
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    data-aos="fade-up"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <div className="bg-primary/10 dark:bg-accent/20 p-2 rounded-full mr-3">
                                <FiPackage className="w-6 h-6 text-primary dark:text-accent" />
                            </div>
                            Đơn hàng của tôi
                        </h1>

                        <div className="mt-3 sm:mt-0">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white rounded-lg transition-colors shadow-sm"
                            >
                                <FiShoppingBag className="mr-2" /> Tiếp tục mua sắm
                            </motion.button>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Status Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FiFilter className="inline mr-1" /> Lọc theo trạng thái
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {statusFilters.map(filter => (
                                        <button
                                            key={filter.value || 'all'}
                                            onClick={() => handleStatusChange(filter.value)}
                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                                selectedStatus === filter.value
                                                    ? 'bg-primary dark:bg-accent text-white border-primary dark:border-accent'
                                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search */}
                            <div className="md:w-64">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FiSearch className="inline mr-1" /> Tìm kiếm theo mã đơn hàng
                                </label>
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Nhập mã đơn hàng..."
                                        className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                    >
                                        <FiSearch />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4 mb-8" data-aos="fade-up" data-aos-delay="150">
                        <AnimatePresence>
                            {loading && isInitialized ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner size="medium" />
                                </div>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <OrderCard
                                        key={order.orderId}
                                        order={order}
                                        onViewDetails={() => handleViewOrderDetails(order.orderId)}
                                    />
                                ))
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-lg">
                                    <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không tìm thấy đơn hàng</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Không có đơn hàng nào phù hợp với bộ lọc bạn đã chọn</p>
                                    <button
                                        onClick={() => {
                                            setSelectedStatus(null);
                                            setSearchTerm('');
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white rounded-lg shadow-sm"
                                    >
                                        <FiRefreshCw className="mr-2" /> Xóa bộ lọc
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 rounded-xl shadow-lg" data-aos="fade-up" data-aos-delay="200">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Trang {currentPage + 1} / {pagination.totalPages}
                                </span>
                            </div>
                            <div className="flex space-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
                                        currentPage === 0
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <FiChevronLeft className="mr-1" /> Trước
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= pagination.totalPages - 1}
                                    className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
                                        currentPage >= pagination.totalPages - 1
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Tiếp <FiChevronRight className="ml-1" />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default OrderListPage;