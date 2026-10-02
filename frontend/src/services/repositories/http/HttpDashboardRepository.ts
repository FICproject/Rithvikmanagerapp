/**
 * HTTP Implementation of IDashboardRepository
 */
import { IDashboardRepository, DashboardSummaryData } from '../IDashboardRepository';
import { Activity } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

import { MockDashboardRepository } from '../mock/MockDashboardRepository';

export class HttpDashboardRepository implements IDashboardRepository {
  private fallback = new MockDashboardRepository();

  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getDashboardSummary(managerId: string): Promise<DashboardSummaryData> {
    try {
      const token = await this.getToken();
      const response = await apiClient.get<DashboardSummaryData>('/dashboard/summary', {
        token,
        params: { managerId },
      });
      return response.data;
    } catch {
      return this.fallback.getDashboardSummary(managerId);
    }
  }

  async getRecentActivities(managerId: string, limit: number = 10): Promise<Activity[]> {
    try {
      const token = await this.getToken();
      const response = await apiClient.get<Activity[]>('/activities/feed', {
        token,
        params: { managerId, limit },
      });
      return response.data || [];
    } catch {
      return this.fallback.getRecentActivities(managerId, limit);
    }
  }
}
