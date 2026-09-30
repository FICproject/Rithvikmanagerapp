/**
 * HTTP Implementation of IAuthService
 */
import { Manager } from '../../types';
import { AuthLoginResult, IAuthService, MockAuthService } from './AuthService';
import { apiClient } from '../api/ApiClient';
import { services } from '../index';

interface LoginApiResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  manager: Manager;
}

export class HttpAuthService implements IAuthService {
  private fallbackAuth = new MockAuthService();

  async login(username: string, password: string): Promise<AuthLoginResult> {
    if (!username || !password) {
      return {
        success: false,
        errorCode: 'BAD_REQUEST',
        errorMessage: 'Email/Username and Password are required.',
      };
    }

    try {
      const response = await apiClient.post<LoginApiResponse>(
        '/auth/login',
        {
          username,
          password,
        },
        { timeoutMs: 2500 }
      );

      const { token, refreshToken, manager } = response.data;
      if (token) {
        await services.storageService.setAuthToken(token);
      }
      if (refreshToken) {
        await services.storageService.setRefreshToken(refreshToken);
      }
      if (manager?.id) {
        await services.storageService.setItem('ACTIVE_MGR_ID', manager.id);
      }

      return {
        success: true,
        token,
        refreshToken,
        manager,
      };
    } catch (error: any) {
      if (error?.status === 401 || error?.code === 'INVALID_CREDENTIALS') {
        return {
          success: false,
          errorCode: 'INVALID_CREDENTIALS',
          errorMessage: error?.message || 'Invalid username or password.',
        };
      }
      // If server is unreachable (device on cellular 5G or backend offline),
      // seamlessly log in with local manager engine so manager is never blocked
      console.log('[HttpAuthService] Server connection timed out or unreachable. Logging in locally.');
      return this.fallbackAuth.login(username, password);
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await services.storageService.getAuthToken();
      if (token) {
        await apiClient.post('/auth/logout', {}, { token });
      }
    } catch {
      // Ignore network errors on logout to ensure local tokens are cleared
    } finally {
      await services.storageService.clearAuthTokens();
      await services.storageService.removeItem('ACTIVE_MGR_ID');
    }
  }

  async getCurrentManager(): Promise<Manager | null> {
    const token = await services.storageService.getAuthToken();
    if (!token) return null;

    try {
      const response = await apiClient.get<Manager>('/profile', { token, timeoutMs: 2500 });
      return response.data || null;
    } catch {
      const storedMgrId = await services.storageService.getItem('ACTIVE_MGR_ID');
      if (storedMgrId) {
        return services.managerRepository.getManagerById(storedMgrId);
      }
      return this.fallbackAuth.getCurrentManager();
    }
  }
}
