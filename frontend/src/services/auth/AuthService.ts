/**
 * Authentication Service Abstraction & Mock Authentication Engine
 */
import { Manager, ManagerRole } from '../../types';
import { services } from '../index';

export interface AuthLoginResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  manager?: Manager;
  errorCode?: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'BAD_REQUEST';
  errorMessage?: string;
}

export interface IAuthService {
  login(username: string, password: string): Promise<AuthLoginResult>;
  logout(): Promise<void>;
  getCurrentManager(): Promise<Manager | null>;
}

export class MockAuthService implements IAuthService {
  private activeManagerId: string = 'mgr-001';

  async login(username: string, password: string): Promise<AuthLoginResult> {
    // Simulate network latency (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Validate inputs
    if (!username || !password) {
      return {
        success: false,
        errorCode: 'BAD_REQUEST',
        errorMessage: 'Email/Username and Password are required.',
      };
    }

    // Simulate invalid credentials test case
    if (password === 'wrongpassword' || password === 'invalid') {
      return {
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        errorMessage: 'Invalid username or password. Please verify your credentials.',
      };
    }

    // Simulate network error test case
    if (username.includes('networkerror')) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Network connection failed. Please check your internet connectivity.',
      };
    }

    const lowerUsername = username.toLowerCase().trim();

    // Determine mock manager profile based on input role hint or email
    let mockManager: Manager;

    if (lowerUsername.includes('ramesh') || lowerUsername.includes('state')) {
      mockManager = {
        id: 'mgr-000',
        name: 'Ramesh',
        email: username.includes('@') ? username : 'ramesh.state@forgeindia.in',
        phone: '9876543200',
        role: ManagerRole.STATE_MANAGER,
        stateId: 'st-tn-01',
        districtId: 'dt-chn-01',
        employeeId: 'FM1000',
        territoryName: 'Tamil Nadu',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
    } else if (lowerUsername.includes('priya')) {
      mockManager = {
        id: 'mgr-002',
        name: 'Priya Sharma',
        email: username.includes('@') ? username : 'priya.division@forgeindia.in',
        phone: '9876543211',
        role: ManagerRole.DIVISION_MANAGER,
        stateId: 'st-mp-01',
        districtId: 'dt-indore-01',
        employeeId: 'FM1002',
        territoryName: 'Madhya Pradesh State',
        status: 'ACTIVE',
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };
    } else if (lowerUsername.includes('division') || lowerUsername.includes('vikram')) {
      mockManager = {
        id: 'mgr-003',
        name: 'Vikram Singh',
        email: username.includes('@') ? username : 'vikram.division@forgeindia.in',
        phone: '9876543212',
        role: ManagerRole.DIVISION_MANAGER,
        stateId: 'st-mp-01',
        districtId: 'dt-indore-01',
        divisionId: 'div-north-01',
        employeeId: 'FM1003',
        territoryName: 'Indore East Division',
        status: 'ACTIVE',
        createdAt: '2025-01-05T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z',
      };
    } else if (lowerUsername.includes('district') || lowerUsername.includes('suresh')) {
      mockManager = {
        id: 'mgr-004',
        name: 'Suresh Menon',
        email: username.includes('@') ? username : 'suresh.district@forgeindia.in',
        phone: '9876543213',
        role: ManagerRole.DISTRICT_MANAGER,
        stateId: 'st-tn-01',
        state: 'Tamil Nadu',
        districtId: 'dt-chn-01',
        districts: ['Chennai'],
        employeeId: 'FM1004',
        territoryName: 'Chennai District',
        status: 'ACTIVE',
        createdAt: '2025-01-05T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z',
      };
    } else if (lowerUsername.includes('pincode') || lowerUsername.includes('amitabh') || lowerUsername.includes('rahul')) {
      mockManager = {
        id: 'mgr-005',
        name: 'Rahul Kumar',
        email: username.includes('@') ? username : 'rahul.pincode@forgeindia.in',
        phone: '9876543214',
        role: ManagerRole.PINCODE_MANAGER,
        stateId: 'st-mp-01',
        districtId: 'dt-indore-01',
        pincodeId: '452001',
        employeeId: 'FM1025',
        territoryName: 'Indore Rural Pincode 452001',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
    } else {
      // Default: Division Manager Rajesh Kumar (mgr-001)
      mockManager = {
        id: 'mgr-001',
        name: 'Rajesh Kumar',
        email: username.includes('@') ? username : 'rajesh.division@forgeindia.in',
        phone: '9876543210',
        role: ManagerRole.DIVISION_MANAGER,
        stateId: 'st-mp-01',
        districtId: 'dt-indore-01',
        divisionId: 'div-north-01',
        employeeId: 'FM1001',
        territoryName: 'Indore District',
        status: 'ACTIVE',
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };
    }

    const mockToken = `fic_jwt_${Date.now()}_mock`;
    const mockRefreshToken = `fic_ref_${Date.now()}_mock`;

    await services.storageService.setAuthToken(mockToken);
    await services.storageService.setRefreshToken(mockRefreshToken);
    await services.storageService.setItem('ACTIVE_MGR_ID', mockManager.id);
    this.activeManagerId = mockManager.id;

    return {
      success: true,
      token: mockToken,
      refreshToken: mockRefreshToken,
      manager: mockManager,
    };
  }

  async logout(): Promise<void> {
    await services.storageService.clearAuthTokens();
    await services.storageService.removeItem('ACTIVE_MGR_ID');
    this.activeManagerId = 'mgr-001';
  }

  async getCurrentManager(): Promise<Manager | null> {
    const token = await services.storageService.getAuthToken();
    if (!token) return null;
    const storedMgrId = await services.storageService.getItem('ACTIVE_MGR_ID');
    const targetId = storedMgrId || this.activeManagerId;
    return services.managerRepository.getManagerById(targetId);
  }
}

import { ENV } from '../../constants/env';
import { HttpAuthService } from './HttpAuthService';

export const authService: IAuthService = ENV.useMockData ? new MockAuthService() : new HttpAuthService();
