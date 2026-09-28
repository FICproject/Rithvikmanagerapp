/**
 * HTTP Implementation of IDailyReportRepository
 */
import { IDailyReportRepository, SubmitDailyReportPayload, ReportPeriodFilter } from '../IDailyReportRepository';
import { DailyReport } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpDailyReportRepository implements IDailyReportRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getTodayReport(managerId: string, dateStr: string): Promise<DailyReport | null> {
    const token = await this.getToken();
    try {
      const response = await apiClient.get<DailyReport>('/reports/daily/today', {
        token,
        params: { managerId, date: dateStr },
      });
      return response.data || null;
    } catch {
      return null;
    }
  }

  async getReportById(id: string): Promise<DailyReport | null> {
    const token = await this.getToken();
    try {
      const response = await apiClient.get<DailyReport>(`/reports/daily/${id}`, { token });
      return response.data || null;
    } catch {
      return null;
    }
  }

  async submitDailyReport(payload: SubmitDailyReportPayload): Promise<DailyReport> {
    const token = await this.getToken();
    const response = await apiClient.post<DailyReport>('/reports/daily', payload, { token });
    return response.data;
  }

  async getReports(
    managerId: string,
    period?: ReportPeriodFilter,
    searchQuery?: string
  ): Promise<DailyReport[]> {
    const token = await this.getToken();
    const params: Record<string, string | number | boolean> = { managerId };
    if (period && period !== 'ALL') params.period = period;
    if (searchQuery) params.search = searchQuery;

    const response = await apiClient.get<DailyReport[]>('/reports/daily', { token, params });
    return response.data || [];
  }
}
