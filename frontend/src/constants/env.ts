/**
 * Environment Configuration Settings
 */

export interface AppEnvironment {
  envName: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  enableAnalytics: boolean;
  enablePushNotifications: boolean;
  apiTimeoutMs: number;
  useMockData: boolean;
}

// Development configuration placeholder (Base URL from environment / default)
export const ENV: AppEnvironment = {
  envName: 'development',
  apiBaseUrl: 'https://api-dev.forgeindia.in/api/v1',
  enableAnalytics: false,
  enablePushNotifications: false,
  apiTimeoutMs: 15000,
  useMockData: true,
};
