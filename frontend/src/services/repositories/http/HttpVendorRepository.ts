/**
 * HTTP Implementation of IVendorRepository
 */
import { IVendorRepository, VendorFilterOptions } from '../IVendorRepository';
import { Vendor } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpVendorRepository implements IVendorRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getVendors(filters?: VendorFilterOptions): Promise<Vendor[]> {
    const token = await this.getToken();
    const params: Record<string, string | number | boolean> = {};

    if (filters?.searchQuery) params.search = filters.searchQuery;
    if (filters?.status) params.status = filters.status;
    if (filters?.activeState && filters.activeState !== 'ALL') params.activeState = filters.activeState;
    if (filters?.category) params.category = filters.category;
    if (filters?.districtId) params.districtId = filters.districtId;
    if (filters?.divisionId) params.divisionId = filters.divisionId;
    if (filters?.pincodeId) params.pincodeId = filters.pincodeId;

    const response = await apiClient.get<Vendor[]>('/vendors', { token, params });
    return response.data || [];
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const token = await this.getToken();
    try {
      const response = await apiClient.get<Vendor>(`/vendors/${id}`, { token });
      return response.data || null;
    } catch {
      return null;
    }
  }

  async createVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
    const token = await this.getToken();
    const response = await apiClient.post<Vendor>('/vendors', vendorData, { token });
    return response.data;
  }

  async recordVendorVisit(
    vendorId: string,
    interested: boolean,
    notes?: string
  ): Promise<{ activityId: string; reportRequired: boolean }> {
    const token = await this.getToken();
    const response = await apiClient.post<{ visitId: string; activityId: string; reportRequired: boolean }>(
      `/vendors/${vendorId}/visits`,
      { interested, notes },
      { token }
    );
    return {
      activityId: response.data.activityId,
      reportRequired: response.data.reportRequired,
    };
  }
}
