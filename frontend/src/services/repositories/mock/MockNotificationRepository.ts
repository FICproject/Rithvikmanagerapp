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
      title: 'High Priority Task Assigned',
      body: 'Complete merchant verification for Sri Foods & Groceries in Parrys, Chennai.',
      category: NotificationCategory.SYSTEM,
      priority: Priority.CRITICAL,
      targetManagerId: 'mgr-000',
      isRead: false,
      deepLinkScreen: 'TaskDetail',
      deepLinkParams: { taskId: 't-301' },
      createdAt: today930.toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Issue Escalation Alert',
      body: 'UPI payment settlement delay reported for Sri Foods (#TN-4402).',
      category: NotificationCategory.ISSUE_UPDATE,
      priority: Priority.HIGH,
      targetManagerId: 'mgr-000',
      isRead: false,
      deepLinkScreen: 'IssueDetail',
      deepLinkParams: { issueId: 'iss-401' },
      createdAt: today845.toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Daily Field Report Reminder',
      body: 'Your state managerial summary for today is ready for final review.',
      category: NotificationCategory.DAILY_REPORT,
      priority: Priority.MEDIUM,
      targetManagerId: 'mgr-000',
      isRead: false,
      deepLinkScreen: 'DailyReport',
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'notif-4',
      title: 'New Merchant Onboarded',
      body: 'Kovai Spices & Organics was approved and added to Tamil Nadu vendor directory.',
      category: NotificationCategory.VENDOR_UPDATE,
      priority: Priority.LOW,
      targetManagerId: 'mgr-000',
      isRead: true,
      deepLinkScreen: 'Vendors',
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'notif-5',
      title: 'Subordinate Report Received',
      body: 'District Manager Suresh Menon submitted field report for Chennai District.',
      category: NotificationCategory.DAILY_REPORT,
      priority: Priority.LOW,
      targetManagerId: 'mgr-000',
      isRead: true,
      deepLinkScreen: 'SubordinateReports',
      createdAt: threeDaysAgo.toISOString(),
    },
  ];
};

export class MockNotificationRepository implements INotificationRepository {
  private notifications: AppNotification[] = getDynamicMockNotifications();

  async getNotifications(managerId: string): Promise<AppNotification[]> {
    return this.notifications
      .filter(n => n.targetManagerId === managerId || managerId === 'mgr-000')
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
