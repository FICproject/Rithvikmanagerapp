/**
 * Replaceable Base API Client Abstraction
 */
import { ENV } from '../../constants/env';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeoutMs?: number;
  token?: string | null;
}

export interface ApiResponseEnvelope<T> {
  data: T;
  status: number;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = ENV.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponseEnvelope<T>> {
    const { method = 'GET', headers = {}, body, params, token } = options;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          status: response.status,
          code: responseData?.error?.code || 'API_ERROR',
          message: responseData?.error?.message || 'API Request Failed',
          fieldErrors: responseData?.error?.fieldErrors || [],
        };
      }

      return responseData as ApiResponseEnvelope<T>;
    } catch (error) {
      if ((error as any).status) {
        throw error;
      }
      throw {
        status: 500,
        code: 'NETWORK_ERROR',
        message: 'Network connection failed or service unavailable.',
      };
    }
  }

  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponseEnvelope<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponseEnvelope<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  patch<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponseEnvelope<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponseEnvelope<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadMultipart<T>(endpoint: string, formData: FormData, token?: string): Promise<ApiResponseEnvelope<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: formData as any,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          status: response.status,
          code: responseData?.error?.code || 'API_ERROR',
          message: responseData?.error?.message || 'File upload failed',
          fieldErrors: responseData?.error?.fieldErrors || [],
        };
      }

      return responseData as ApiResponseEnvelope<T>;
    } catch (error) {
      if ((error as any).status) {
        throw error;
      }
      throw {
        status: 500,
        code: 'NETWORK_ERROR',
        message: 'Network connection failed during upload.',
      };
    }
  }
}

export const apiClient = new ApiClient();
