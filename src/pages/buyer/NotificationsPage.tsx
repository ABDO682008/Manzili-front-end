import { useEffect, useState } from 'react';
import { Bell, Package, DollarSign, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../../api';
import { Spinner, EmptyState, Button } from '../../components/common';
import { useNotificationStore } from '../../stores';
import { formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import type { Notification, NotificationType } from '../../types';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  RequestAccepted: <Package className="w-5 h-5" style={{ color: '#769E66' }} />,
  RequestRejected: <Package className="w-5 h-5" style={{ color: '#DD643C' }} />,
  RequestRepriced: <DollarSign className="w-5 h-5" style={{ color: '#ED8E3C' }} />,
  PaymentApproved: <DollarSign className="w-5 h-5" style={{ color: '#769E66' }} />,
  PaymentRejected: <DollarSign className="w-5 h-5" style={{ color: '#DD643C' }} />,
  OrderStatusChanged: <Package className="w-5 h-5" style={{ color: '#6B7B8C' }} />,
  DeliveryCodeGenerated: <Package className="w-5 h-5" style={{ color: '#769E66' }} />,
  OrderCompleted: <Check className="w-5 h-5" style={{ color: '#769E66' }} />,
  AdminAnnouncement: <Bell className="w-5 h-5" style={{ color: '#6B7B8C' }} />,
  System: <MessageSquare className="w-5 h-5" style={{ color: '#9BA8B4' }} />,
};

const tabs = ['الكل', 'الطلبات', 'الطلبات', 'المدفوعات', 'النظام'];

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('الكل');
  const { markAllAsRead, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.items);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await notificationsApi.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        markAllAsRead();
        toast.success('All notifications marked as read');
      }
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      const response = await notificationsApi.markAsRead(id);
      if (response.success) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ));
        fetchUnreadCount();
      }
    } catch {
      // Silent fail
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'الكل') return true;
    if (activeTab === 'الطلبات') return ['OrderStatusChanged', 'DeliveryCodeGenerated', 'OrderCompleted'].includes(n.type);
    if (activeTab === 'الطلبات') return ['RequestAccepted', 'RequestRejected', 'RequestRepriced'].includes(n.type);
    if (activeTab === 'المدفوعات') return ['PaymentApproved', 'PaymentRejected'].includes(n.type);
    if (activeTab === 'النظام') return ['AdminAnnouncement', 'System'].includes(n.type);
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>الإشعارات</h1>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck className="w-4 h-4 mr-1" />
          تحديد الكل كمقروء
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-white'
                : 'bg-white text-heading-600 hover:bg-surface-50 border border-surface-200'
            }`}
            style={activeTab === tab ? { backgroundColor: '#DD643C' } : undefined}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد إشعارات"
          message="كله تمام! رجع تاني بعدين."
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleMarkRead(notification.id)}
              className={`w-full flex items-start gap-4 p-4 bg-white rounded-xl text-left hover:shadow-sm transition-all ${
                !notification.isRead ? 'border-r-4 border-primary' : ''
              }`}
            >
              <div className="w-10 h-10 bg-surface-50 rounded-full flex items-center justify-center flex-shrink-0">
                {notificationIcons[notification.type] || <Bell className="w-5 h-5" style={{ color: '#9BA8B4' }} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-medium ${!notification.isRead ? 'text-heading-600' : 'text-neutral'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs whitespace-nowrap" style={{ color: '#9BA8B4' }}>
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#9BA8B4' }}>{notification.message}</p>
              </div>
              
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#DD643C' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
