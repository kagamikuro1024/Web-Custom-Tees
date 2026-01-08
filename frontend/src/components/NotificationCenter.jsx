import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiTrash2, FiPackage, FiStar, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../stores/useAuthStore';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { isAuthenticated } = useAuthStore();
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (show && isAuthenticated) {
      fetchNotifications();
    }
  }, [show, isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications', {
        params: { limit: 15 }
      });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    
    try {
      await api.delete('/notifications/read/all');
      setNotifications(notifications.filter(n => !n.isRead));
      toast.success('All read notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
      case 'order_status_updated':
      case 'order_cancelled':
        return <FiPackage className="text-blue-600" />;
      case 'review_added':
      case 'review_replied':
        return <FiStar className="text-yellow-600" />;
      case 'new_review_admin':
        return <FiStar className="text-yellow-500" />;
      case 'product_low_stock':
        return <FiAlertCircle className="text-red-600" />;
      default:
        return <FiBell className="text-gray-600" />;
    }
  };

  const getNotificationLink = (notification) => {
    // Use link field from backend if available
    if (notification.link) {
      return notification.link;
    }
    
    // Fallback to old logic with validation
    if (notification.relatedOrder?.orderNumber) {
      return `/orders/${notification.relatedOrder.orderNumber}`;
    }
    if (notification.relatedProduct?.slug) {
      return `/products/${notification.relatedProduct.slug}`;
    }
    
    // If no valid link, return null to prevent navigation
    return null;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShow(!show)}
        className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
      >
        <FiBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {show && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShow(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    <FiCheck className="inline mr-1" />
                    Đọc hết
                  </button>
                )}
                {notifications.some(n => n.isRead) && (
                  <button
                    onClick={handleDeleteAllRead}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 className="inline mr-1" />
                    Xóa đã đọc
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <FiBell className="text-4xl mx-auto mb-2 text-gray-400" />
                  <p>Không có thông báo</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const link = getNotificationLink(notification);
                  const NotificationWrapper = link ? Link : 'div';
                  
                  return (
                    <NotificationWrapper
                      key={notification._id}
                      to={link || undefined}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification._id);
                        }
                        if (link) {
                          setShow(false);
                        }
                      }}
                      className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      } ${link ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 mb-0.5">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 leading-snug">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timeAgo}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        >
                          <FiX className="text-lg" />
                        </button>
                      </div>
                    </NotificationWrapper>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
