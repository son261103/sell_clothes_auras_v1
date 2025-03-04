// src/hooks/useNotification.ts
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    createdAt: string;
    read: boolean;
}

const useNotification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { isAuthenticated, user } = useAuth();

    // Simulate polling for notifications
    useEffect(() => {
        if (!isAuthenticated || !user?.userId) return;

        const checkForNewNotifications = async () => {
            try {
                // Replace with actual API call to fetch notifications
                // const response = await api.get('/notifications/unread', {
                //    headers: { 'X-User-Id': user.userId }
                // });
                // const newNotifications = response.data;

                // Simulated notifications for development
                const mockNotifications: Notification[] = [
                    {
                        id: Date.now(),
                        title: 'Cập nhật thanh toán',
                        message: 'Đơn hàng #123 đã được thanh toán thành công.',
                        type: 'success',
                        createdAt: new Date().toISOString(),
                        read: false
                    }
                ];

                // In production, check if there are actually new notifications
                if (mockNotifications.length > 0) {
                    // Add to state
                    setNotifications(prev => [...mockNotifications, ...prev]);
                    setUnreadCount(prev => prev + mockNotifications.length);

                    // Show toast for the newest notification
                    toast.success(mockNotifications[0].message, {
                        duration: 5000,
                        position: 'top-right',
                        icon: '🔔'
                    });
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        // Initial check
        checkForNewNotifications();

        // Poll every 30 seconds
        const intervalId = setInterval(checkForNewNotifications, 30000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, user]);

    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };
};

export default useNotification;