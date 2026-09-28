/**
 * HTTP Implementation of ILeaderboardRepository
 */
import { ILeaderboardRepository, LeaderboardPeriod, LeaderboardResponse } from '../ILeaderboardRepository';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpLeaderboardRepository implements ILeaderboardRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getLeaderboard(managerId: string, period: LeaderboardPeriod = 'THIS_MONTH'): Promise<LeaderboardResponse> {
    const token = await this.getToken();
    const response = await apiClient.get<LeaderboardResponse>('/leaderboard', {
      token,
      params: { managerId, period },
    });
    return response.data;
  }
}
