/**
 * HTTP Implementation of IActivityRepository
 */
import { IActivityRepository } from '../IActivityRepository';
import { Activity, Report, ReportType } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpActivityRepository implements IActivityRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getActivityFeed(managerId: string): Promise<Activity[]> {
    const token = await this.getToken();
    const response = await apiClient.get<Activity[]>('/activities/feed', {
      token,
      params: { managerId },
    });
    return response.data || [];
  }

  async getReportsHistory(managerId: string): Promise<Report[]> {
    const token = await this.getToken();
    const response = await apiClient.get<Report[]>('/reports/history', {
      token,
      params: { managerId },
    });
    return response.data || [];
  }

  async submitExceptionReport(payload: {
    activityId: string;
    managerId: string;
    vendorId: string;
    reportType: ReportType;
    textNotes?: string;
    voiceUrl?: string;
    voiceDurationSeconds?: number;
  }): Promise<Report> {
    const token = await this.getToken();
    const response = await apiClient.post<Report>('/reports/exception', payload, { token });
    return response.data;
  }

  async logActivity(payload: {
    managerId: string;
    activityType: string;
    entityId: string;
    entityName: string;
    stateId?: string;
    districtId?: string;
    divisionId?: string;
    pincodeId?: string;
  }): Promise<Activity> {
    const token = await this.getToken();
    const response = await apiClient.post<Activity>('/activities', payload, { token });
    return response.data;
  }
}
