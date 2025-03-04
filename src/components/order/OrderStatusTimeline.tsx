// src/components/order/OrderStatusTimeline.tsx
import React from 'react';
import { OrderResponseDTO, OrderStatus } from '../../types/order.types';
import { FiCheck, FiClock, FiPackage, FiTruck, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrderStatusTimelineProps {
    order: OrderResponseDTO;
}

interface TimelinePoint {
    status: OrderStatus;
    icon: React.ReactNode;
    title: string;
    description: string;
    date?: string;
    active: boolean;
    completed: boolean;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ order }) => {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
        } catch (error) {
            console.error('Error parsing date', error);
            return '';
        }
    };

    // Get all statuses in the correct order
    const statuses: OrderStatus[] = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPING,
        OrderStatus.COMPLETED
    ];

    // Map the current order status to figure out which steps are active/completed
    const getCurrentStatusIndex = () => {
        if (order.status === OrderStatus.CANCELLED) {
            return statuses.indexOf(OrderStatus.PENDING); // Just show pending as active if cancelled
        }
        return statuses.indexOf(order.status);
    };

    const currentStatusIndex = getCurrentStatusIndex();

    // Create timeline points
    const timelinePoints: TimelinePoint[] = [
        {
            status: OrderStatus.PENDING,
            icon: <FiClock />,
            title: 'Đặt hàng',
            description: 'Đơn hàng đã được đặt thành công',
            date: formatDate(order.createdAt),
            active: currentStatusIndex >= 0,
            completed: currentStatusIndex > 0
        },
        {
            status: OrderStatus.CONFIRMED,
            icon: <FiCheck />,
            title: 'Xác nhận',
            description: 'Đơn hàng đã được xác nhận',
            date: currentStatusIndex > 0 ? formatDate(order.updatedAt) : undefined,
            active: currentStatusIndex >= 1,
            completed: currentStatusIndex > 1
        },
        {
            status: OrderStatus.PROCESSING,
            icon: <FiPackage />,
            title: 'Đang xử lý',
            description: 'Đơn hàng đang được chuẩn bị',
            date: currentStatusIndex > 1 ? formatDate(order.updatedAt) : undefined,
            active: currentStatusIndex >= 2,
            completed: currentStatusIndex > 2
        },
        {
            status: OrderStatus.SHIPPING,
            icon: <FiTruck />,
            title: 'Đang giao hàng',
            description: 'Đơn hàng đang được giao',
            date: currentStatusIndex > 2 ? formatDate(order.updatedAt) : undefined,
            active: currentStatusIndex >= 3,
            completed: currentStatusIndex > 3
        },
        {
            status: OrderStatus.COMPLETED,
            icon: <FiCheckCircle />,
            title: 'Hoàn thành',
            description: 'Đơn hàng đã được giao thành công',
            date: order.status === OrderStatus.COMPLETED ? formatDate(order.updatedAt) : undefined,
            active: currentStatusIndex >= 4,
            completed: currentStatusIndex >= 4
        }
    ];

    return (
        <div className="flow-root">
            {/* Handle cancelled orders */}
            {order.status === OrderStatus.CANCELLED && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start">
                    <FiAlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0 w-5 h-5" />
                    <div>
                        <h4 className="font-medium text-red-800 dark:text-red-300">Đơn hàng đã bị hủy</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Đơn hàng này đã bị hủy vào {formatDate(order.updatedAt)}
                        </p>
                    </div>
                </div>
            )}

            <ul className="-mb-8">
                {timelinePoints.map((point, index) => (
                    <li key={point.status}>
                        <div className="relative pb-8">
                            {/* Connect line between dots (for all except the last item) */}
                            {index < timelinePoints.length - 1 && (
                                <span
                                    className={`absolute top-5 left-5 -ml-px h-full w-0.5 ${
                                        point.completed
                                            ? 'bg-primary'
                                            : point.active
                                                ? 'bg-gray-300 dark:bg-gray-600'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                    aria-hidden="true"
                                />
                            )}

                            <div className="relative flex items-start space-x-3">
                                {/* Status icon circle */}
                                <div>
                                    <div className={`
                    relative flex h-10 w-10 items-center justify-center rounded-full
                    ${point.completed
                                        ? 'bg-primary text-white'
                                        : point.active
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}
                  `}>
                                        {point.icon}
                                    </div>
                                </div>

                                {/* Status text */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between">
                                        <h3 className={`text-base font-medium ${
                                            point.active
                                                ? 'text-gray-900 dark:text-white'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {point.title}
                                        </h3>
                                        {point.date && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                        {point.date}
                      </span>
                                        )}
                                    </div>
                                    <p className={`mt-0.5 text-sm ${
                                        point.active
                                            ? 'text-gray-600 dark:text-gray-300'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                        {point.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderStatusTimeline;