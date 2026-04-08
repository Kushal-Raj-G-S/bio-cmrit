import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  userId: string;
  type: 'IMAGE_VERIFIED' | 'IMAGE_FLAGGED' | 'IMAGE_APPEAL' | 'BATCH_VERIFIED' | 'BATCH_REJECTED' | 'STAGE_COMPLETE' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    imageUrl?: string;
    stageId?: string;
    batchId?: string;
    verificationId?: string;
    rejectionReason?: string;
    appealId?: string;
    farmerId?: string;
    farmerName?: string;
    appealReason?: string;
    appealStatus?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationsProps {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const useNotifications = ({ 
  userId, 
  autoRefresh = false, // DISABLED by default - only fetch when user clicks bell
  refreshInterval = 60000 // 60 seconds (reduced frequency)
}: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showToast = false) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      
      const unread = (data.notifications || []).filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);

      if (showToast && unread > 0) {
        toast.info(`You have ${unread} unread notification${unread > 1 ? 's' : ''}`);
      }

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mark notification(s) as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!userId || notificationIds.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notificationIds
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));

    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, [userId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          markAllAsRead: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');

    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications?id=${notificationId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast.success('Notification deleted');

    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [userId, notifications]);

  // Auto-refresh notifications
  useEffect(() => {
    if (!userId || !autoRefresh) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [userId, autoRefresh, refreshInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => fetchNotifications(false)
  };
};
