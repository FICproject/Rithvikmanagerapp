/**
 * HTTP Implementation of INotificationRepository
 */
import { INotificationRepository } from '../INotificationRepository';
import { AppNotification } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpNotificationRepository implements INotificationRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getNotifications(managerId: string): Promise<AppNotification[]> {
    const token = await this.getToken();
    const response = await apiClient.get<AppNotification[]>('/notifications', {
      token,
      params: { managerId },
    });
    return response.data || [];
  }

  async getUnreadCount(managerId: string): Promise<number> {
    const token = await this.getToken();
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count', {
      token,
      params: { managerId },
    });
    return response.data?.count ?? 0;
  }

  async markAsRead(notificationId: string): Promise<AppNotification> {
    const token = await this.getToken();
    const response = await apiClient.patch<AppNotification>(`/notifications/${notificationId}/read`, {}, { token });
    return response.data;
  }

  async markAllAsRead(managerId: string): Promise<void> {
    const token = await this.getToken();
    await apiClient.patch('/notifications/read-all', { managerId }, { token });
  }

  async registerFCMToken(managerId: string, fcmToken: string, role?: string, territory?: any): Promise<boolean> {
    const token = await this.getToken();
    const response = await apiClient.post<{ success: boolean }>('/notifications/register-token', {
      managerId,
      fcmToken,
      role,
      territory,
    }, { token });
    return response.data?.success ?? true;
  }

  async unregisterFCMToken(managerId: string, fcmToken: string): Promise<boolean> {
    const token = await this.getToken();
    const response = await apiClient.post<{ success: boolean }>('/notifications/unregister-token', {
      managerId,
      fcmToken,
    }, { token });
    return response.data?.success ?? true;
  }
}
