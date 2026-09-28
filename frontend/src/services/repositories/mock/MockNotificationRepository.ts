/**
 * Mock Implementation of INotificationRepository
 */
import { INotificationRepository } from '../INotificationRepository';
import { AppNotification, NotificationCategory, Priority } from '../../../types';

const getDynamicMockNotifications = (): AppNotification[] => {
  const now = new Date();
  
  // Today 09:30 AM
  const today930 = new Date(now);
  today930.setHours(9, 30, 0, 0);

  // Today 08:45 AM
  const today845 = new Date(now);
  today845.setHours(8, 45, 0, 0);

  // Yesterday 18:30 PM
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  yesterday.setHours(18, 30, 0, 0);

  // 2 days ago
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  twoDaysAgo.setHours(14, 15, 0, 0);

  // 3 days ago
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  threeDaysAgo.setHours(10, 0, 0, 0);

  return [
    {
      id: 'notif-1',
      title: 'Daily Report Reminder',
      body: 'Your daily report for today is pending submission.',
      category: NotificationCategory.DAILY_REPORT,
      priority: Priority.HIGH,
      targetManagerId: 'mgr-001',
      isRead: false,
      deepLinkScreen: 'DailyReport',
      createdAt: today930.toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Issue Updated',
      body: 'Payment issue for Fresh Mart Supermarket was marked resolved.',
      category: NotificationCategory.ISSUE_UPDATE,
      priority: Priority.MEDIUM,
      targetManagerId: 'mgr-001',
      isRead: false,
      deepLinkScreen: 'IssueDetail',
      deepLinkParams: { issueId: 'iss-401' },
      createdAt: today845.toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Report Submitted',
      body: 'Your daily report for yesterday was submitted successfully.',
      category: NotificationCategory.DAILY_REPORT,
      priority: Priority.LOW,
      targetManagerId: 'mgr-001',
      isRead: true,
      deepLinkScreen: 'Reports',
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'notif-4',
      title: 'Vendor Scope Update',
      body: 'Apex Wholesalers was added to your authorized territory scope.',
      category: NotificationCategory.VENDOR_UPDATE,
      priority: Priority.MEDIUM,
      targetManagerId: 'mgr-001',
      isRead: true,
      deepLinkScreen: 'Vendors',
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'notif-5',
      title: 'System Broadcast',
      body: 'Monthly operational metrics updated for District Manager role.',
      category: NotificationCategory.SYSTEM,
      priority: Priority.LOW,
      targetManagerId: 'mgr-001',
      isRead: true,
      createdAt: threeDaysAgo.toISOString(),
    },
  ];
};

export class MockNotificationRepository implements INotificationRepository {
  private notifications: AppNotification[] = getDynamicMockNotifications();

  async getNotifications(managerId: string): Promise<AppNotification[]> {
    return this.notifications
      .filter(n => n.targetManagerId === managerId)
      .map(n => ({ ...n }));
  }

  async getUnreadCount(managerId: string): Promise<number> {
    const list = await this.getNotifications(managerId);
    return list.filter(n => !n.isRead).length;
  }

  async markAsRead(notificationId: string): Promise<AppNotification> {
    const found = this.notifications.find(n => n.id === notificationId);
    if (!found) {
      throw new Error('Notification not found');
    }
    found.isRead = true;
    return { ...found };
  }

  async markAllAsRead(managerId: string): Promise<void> {
    this.notifications.forEach(n => {
      if (n.targetManagerId === managerId) {
        n.isRead = true;
      }
    });
  }

  async registerFCMToken(_managerId: string, _fcmToken: string): Promise<boolean> {
    return true;
  }

  async unregisterFCMToken(_managerId: string, _fcmToken: string): Promise<boolean> {
    return true;
  }
}
