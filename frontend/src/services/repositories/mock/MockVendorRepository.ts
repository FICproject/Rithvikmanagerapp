/**
 * Mock Implementation of IVendorRepository for Initial Development
 */
import { IVendorRepository, VendorFilterOptions } from '../IVendorRepository';
import { Vendor, VendorCategory, VendorStatus } from '../../../types';

const INITIAL_MOCK_VENDORS: Vendor[] = [
  // Tamil Nadu - Chennai District (dt-chn-01) - Chennai North (div-chn-north) - Parrys (600001)
  {
    id: 'v-101',
    businessName: 'Sri Foods & Groceries',
    vendorName: 'K. Rajagopal',
    phone: '9840112233',
    email: 'rajagopal@srifoods.com',
    category: VendorCategory.DAILY_NEEDS,
    businessType: 'Retail',
    subcategory: 'FMCG & Groceries',
    address: '15 NSC Bose Road, Parrys, Chennai, Tamil Nadu - 600001',
    locationDistrict: 'Chennai, Tamil Nadu',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600001',
    status: VendorStatus.ONBOARDED,
    outletCount: 4,
    issueCount: 0,
    visitCount: 14,
    gstNumber: '33AABCS1429B1ZB',
    yearOfEstablishment: '2018',
    assignedManager: 'M. Selvi (Pincode Manager)',
    createdById: 'mgr-tn-pin1',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'v-102',
    businessName: 'ABC Traders & Textiles',
    vendorName: 'S. Ramanathan',
    phone: '9840223344',
    email: 'raman@abctraders.in',
    category: VendorCategory.PRODUCT,
    businessType: 'Wholesale',
    subcategory: 'Textiles & Silk',
    address: '42 Godown Street, Parrys, Chennai, Tamil Nadu - 600001',
    locationDistrict: 'Chennai, Tamil Nadu',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600001',
    status: VendorStatus.ONBOARDED,
    outletCount: 2,
    issueCount: 1,
    visitCount: 9,
    gstNumber: '33BBCDE2345C1ZC',
    panNumber: 'BBCDE2345C',
    aadhaarNumber: '987654321098',
    panUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    aadhaarUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    yearOfEstablishment: '2015',
    assignedManager: 'M. Selvi (Pincode Manager)',
    createdById: 'mgr-tn-pin1',
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
  },
  // Tamil Nadu - Chennai North (div-chn-north) - Kilpauk (600010)
  {
    id: 'v-103',
    businessName: 'Fresh Mart Supermarket',
    vendorName: 'N. Subramanian',
    phone: '9840334455',
    email: 'freshmart.chennai@gmail.com',
    category: VendorCategory.FOOD,
    businessType: 'Retail',
    subcategory: 'Supermarket & Produce',
    address: '88 Poonamallee High Road, Kilpauk, Chennai, Tamil Nadu - 600010',
    locationDistrict: 'Chennai, Tamil Nadu',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600010',
    status: VendorStatus.VISITED,
    outletCount: 3,
    issueCount: 0,
    visitCount: 5,
    gstNumber: '33CDEFG3456D1ZD',
    yearOfEstablishment: '2021',
    assignedManager: 'S. Vijay (Pincode Manager)',
    createdById: 'mgr-tn-pin2',
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z',
  },
  // Tamil Nadu - Chennai South (div-chn-south) - Adyar (600020)
  {
    id: 'v-104',
    businessName: 'Royal Electronics & Mobile',
    vendorName: 'V. Prakash',
    phone: '9840445566',
    email: 'prakash@royalelec.com',
    category: VendorCategory.PRODUCT,
    businessType: 'Retail',
    subcategory: 'Consumer Electronics',
    address: '24 Sardar Patel Road, Adyar, Chennai, Tamil Nadu - 600020',
    locationDistrict: 'Chennai, Tamil Nadu',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-south',
    pincodeId: '600020',
    status: VendorStatus.LEAD,
    outletCount: 1,
    issueCount: 0,
    visitCount: 2,
    gstNumber: '33DEFGH4567E1ZE',
    yearOfEstablishment: '2022',
    assignedManager: 'V. Karthik (Pincode Manager)',
    createdById: 'mgr-tn-pin3',
    createdAt: '2026-09-04T00:00:00Z',
    updatedAt: '2026-09-04T00:00:00Z',
  },
  {
    id: 'v-105',
    businessName: 'Anand Bhavan Sweets & Cafe',
    vendorName: 'M. Anand',
    phone: '9840556677',
    email: 'anand@anandbhavan.com',
    category: VendorCategory.FOOD,
    businessType: 'Retail',
    subcategory: 'Dining & Sweets',
    address: '11 LB Road, Adyar, Chennai, Tamil Nadu - 600020',
    locationDistrict: 'Chennai, Tamil Nadu',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-south',
    pincodeId: '600020',
    status: VendorStatus.NOT_INTERESTED,
    outletCount: 2,
    issueCount: 0,
    visitCount: 1,
    gstNumber: '33EFGHI5678F1ZF',
    yearOfEstablishment: '2017',
    assignedManager: 'V. Karthik (Pincode Manager)',
    createdById: 'mgr-tn-pin3',
    createdAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  // Tamil Nadu - Coimbatore District (dt-cbe-01)
  {
    id: 'v-106',
    businessName: 'Kovai Spices & Organics',
    vendorName: 'G. Balaji',
    phone: '9840667788',
    email: 'balaji@kovaispices.com',
    category: VendorCategory.FOOD,
    businessType: 'Wholesale',
    subcategory: 'Organic Spices',
    address: '77 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
    locationDistrict: 'Coimbatore, Tamil Nadu',
    stateId: 'st-tn-01',
    districtId: 'dt-cbe-01',
    divisionId: 'div-cbe-central',
    pincodeId: '641012',
    status: VendorStatus.ONBOARDED,
    outletCount: 6,
    issueCount: 1,
    visitCount: 11,
    gstNumber: '33FGHIJ6789G1ZG',
    yearOfEstablishment: '2016',
    assignedManager: 'R. Venkatesh (District Manager)',
    createdById: 'mgr-tn-dt2',
    createdAt: '2026-09-06T00:00:00Z',
    updatedAt: '2026-09-06T00:00:00Z',
  },
  // Madhya Pradesh Vendors for Cross-territory and Subordinate testing
  {
    id: 'v-107',
    businessName: 'Indore Daily Fresh',
    vendorName: 'Suresh Patel',
    phone: '9876543210',
    email: 'suresh@indoredaily.com',
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
    id: 'v-108',
    businessName: 'Malwa Cloth Emporium',
    vendorName: 'Ramesh Gupta',
    phone: '9876543212',
    email: 'ramesh@malwacloth.com',
    category: VendorCategory.PRODUCT,
    businessType: 'Wholesale',
    subcategory: 'Textiles & Fabrics',
    address: '78 Cloth Market, Indore, Madhya Pradesh - 452002',
    locationDistrict: 'Indore, Madhya Pradesh',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452002',
    status: VendorStatus.VISITED,
    outletCount: 3,
    issueCount: 0,
    visitCount: 4,
    gstNumber: '23CDEFG3456H3Z7',
    yearOfEstablishment: '2016',
    assignedManager: 'Rajesh Kumar (Division Manager)',
    createdById: 'mgr-001',
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z',
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
