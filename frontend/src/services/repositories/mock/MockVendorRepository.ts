/**
 * Mock Implementation of IVendorRepository for Initial Development
 */
import { IVendorRepository, VendorFilterOptions } from '../IVendorRepository';
import { Vendor, VendorCategory, VendorStatus } from '../../../types';

const INITIAL_MOCK_VENDORS: Vendor[] = [
  {
    id: 'v-101',
    businessName: 'Fresh Mart Supermarket',
    vendorName: 'Suresh Patel',
    phone: '9876543210',
    email: 'suresh@freshmart.com',
    category: VendorCategory.DAILY_NEEDS,
    businessType: 'Retail',
    subcategory: 'FMCG & Groceries',
    address: '12 MG Road, Indore, Madhya Pradesh - 452001',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452001',
    status: VendorStatus.ONBOARDED,
    outletCount: 5,
    issueCount: 0,
    visitCount: 12,
    gstNumber: '23ABCDE1234F1Z5',
    yearOfEstablishment: '2019',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'v-102',
    businessName: 'Sharma General Store',
    vendorName: 'Priya Sharma',
    phone: '9876543211',
    email: 'priya@sharmastore.com',
    category: VendorCategory.DAILY_NEEDS,
    businessType: 'Retail',
    subcategory: 'General Provisions',
    address: '45 AB Road, Indore, Madhya Pradesh - 452001',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452001',
    status: VendorStatus.ONBOARDED,
    outletCount: 3,
    issueCount: 1,
    visitCount: 8,
    gstNumber: '23BCDEF2345G2Z6',
    yearOfEstablishment: '2020',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
  },
  {
    id: 'v-103',
    businessName: 'Bharat Traders',
    vendorName: 'Ramesh Gupta',
    phone: '9876543212',
    email: 'ramesh@bharattraders.com',
    category: VendorCategory.PRODUCT,
    businessType: 'Wholesale',
    subcategory: 'Textiles & Garments',
    address: '78 Cloth Market, Indore, Madhya Pradesh - 452002',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452002',
    status: VendorStatus.VISITED,
    outletCount: 8,
    issueCount: 0,
    visitCount: 4,
    gstNumber: '23CDEFG3456H3Z7',
    yearOfEstablishment: '2016',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z',
  },
  {
    id: 'v-104',
    businessName: 'Indore Electronics',
    vendorName: 'Vikram Joshi',
    phone: '9876543213',
    email: 'vikram@indoreelec.in',
    category: VendorCategory.PRODUCT,
    businessType: 'Retail',
    subcategory: 'Consumer Electronics',
    address: '10 Jawahar Marg, Indore, Madhya Pradesh - 452003',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452003',
    status: VendorStatus.VISITED,
    outletCount: 2,
    issueCount: 2,
    visitCount: 6,
    gstNumber: '23DEFGH4567J4Z8',
    yearOfEstablishment: '2021',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-04T00:00:00Z',
    updatedAt: '2026-09-04T00:00:00Z',
  },
  {
    id: 'v-105',
    businessName: 'City Textiles',
    vendorName: 'Anil Mehta',
    phone: '9876543214',
    email: 'anil@citytextiles.com',
    category: VendorCategory.PRODUCT,
    businessType: 'Retail',
    subcategory: 'Fabrics & Silks',
    address: '99 Sitlamata Bazar, Indore, Madhya Pradesh - 452004',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452004',
    status: VendorStatus.LEAD,
    outletCount: 1,
    issueCount: 0,
    visitCount: 1,
    gstNumber: '23EFGHI5678K5Z9',
    yearOfEstablishment: '2022',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'v-106',
    businessName: 'Agrawal Sweets',
    vendorName: 'Sunil Agrawal',
    phone: '9876543215',
    email: 'sunil@agrawalsweets.com',
    category: VendorCategory.FOOD,
    businessType: 'Retail',
    subcategory: 'Confectionery',
    address: '22 Chhappan Dukan, Indore, Madhya Pradesh - 452001',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452001',
    status: VendorStatus.NOT_INTERESTED,
    outletCount: 4,
    issueCount: 0,
    visitCount: 2,
    gstNumber: '23FGHIJ6789L6Z0',
    yearOfEstablishment: '2015',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-06T00:00:00Z',
    updatedAt: '2026-09-06T00:00:00Z',
  },
];

export class MockVendorRepository implements IVendorRepository {
  private vendors: Vendor[] = [...INITIAL_MOCK_VENDORS];

  async getVendors(filters?: VendorFilterOptions): Promise<Vendor[]> {
    let result = [...this.vendors];

    if (filters?.searchQuery) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        v =>
          (v.businessName && v.businessName.toLowerCase().includes(q)) ||
          (v.vendorName && v.vendorName.toLowerCase().includes(q)) ||
          (v.phone && v.phone.includes(q)) ||
          (v.category && String(v.category).toLowerCase().includes(q)) ||
          (v.subcategory && v.subcategory.toLowerCase().includes(q)) ||
          (v.locationDistrict && v.locationDistrict.toLowerCase().includes(q)) ||
          (v.address && v.address.toLowerCase().includes(q))
      );
    }

    if (filters?.status) {
      result = result.filter(v => v.status === filters.status);
    }

    if (filters?.activeState && filters.activeState !== 'ALL') {
      if (filters.activeState === 'ACTIVE') {
        result = result.filter(
          v => v.status === VendorStatus.ONBOARDED || v.status === VendorStatus.VISITED
        );
      } else if (filters.activeState === 'INACTIVE') {
        result = result.filter(
          v => v.status === VendorStatus.LEAD || v.status === VendorStatus.NOT_INTERESTED
        );
      }
    }

    if (filters?.category) {
      result = result.filter(v => v.category === filters.category);
    }

    if (filters?.districtId) {
      result = result.filter(v => v.districtId === filters.districtId);
    }

    if (filters?.divisionId) {
      result = result.filter(v => v.divisionId === filters.divisionId);
    }

    if (filters?.pincodeId) {
      result = result.filter(v => v.pincodeId === filters.pincodeId);
    }

    return result;
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const found = this.vendors.find(v => v.id === id);
    return found || null;
  }

  async createVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendorData,
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.vendors.push(newVendor);
    return newVendor;
  }

  async recordVendorVisit(
    vendorId: string,
    interested: boolean,
    notes?: string
  ): Promise<{ activityId: string; reportRequired: boolean }> {
    const vendorIndex = this.vendors.findIndex(v => v.id === vendorId);
    if (vendorIndex !== -1) {
      this.vendors[vendorIndex].status = interested
        ? VendorStatus.VISITED
        : VendorStatus.NOT_INTERESTED;
    }
    return {
      activityId: `act-${Date.now()}`,
      reportRequired: !interested,
    };
  }
}
