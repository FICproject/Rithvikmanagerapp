/**
 * HTTP Implementation of IDashboardRepository
 */
import { IDashboardRepository, DashboardSummaryData } from '../IDashboardRepository';
import { Activity } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpDashboardRepository implements IDashboardRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getDashboardSummary(managerId: string): Promise<DashboardSummaryData> {
    const token = await this.getToken();
    const response = await apiClient.get<DashboardSummaryData>('/dashboard/summary', {
      token,
      params: { managerId },
    });
    return response.data;
  }

  async getRecentActivities(managerId: string, limit: number = 10): Promise<Activity[]> {
    const token = await this.getToken();
    const response = await apiClient.get<Activity[]>('/activities/feed', {
      token,
      params: { managerId, limit },
    });
    return response.data || [];
  }
}
