/**
 * Mock Implementation of IIssueRepository
 */
import { IIssueRepository } from '../IIssueRepository';
import { Issue, IssueStatus, Priority } from '../../../types';

const INITIAL_MOCK_ISSUES: Issue[] = [
  {
    id: 'iss-401',
    title: 'Payment Settlement Delay',
    description: 'UPI settlement batch #TN-4402 failed to reflect in vendor account. Vendor requesting urgent payment verification.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-000',
    vendorId: 'v-101',
    vendorName: 'Sri Foods & Groceries',
    location: 'Parrys, Chennai',
    contactName: 'K. Rajagopal',
    contactPhone: '9840112233',
    address: '15 NSC Bose Road, Parrys, Chennai - 600001',
    latitude: 13.0878,
    longitude: 80.2858,
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600001',
    status: IssueStatus.OPEN,
    createdAt: '2026-09-23T10:00:00Z',
    updatedAt: '2026-09-23T10:00:00Z',
  },
  {
    id: 'iss-402',
    title: 'POS Terminal QR Read Error',
    description: 'Merchant counter POS QR standee scan failing on customer UPI apps.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-000',
    vendorId: 'v-102',
    vendorName: 'ABC Traders & Textiles',
    location: 'Parrys, Chennai',
    contactName: 'S. Ramanathan',
    contactPhone: '9840223344',
    address: '42 Godown Street, Parrys, Chennai - 600001',
    latitude: 13.0892,
    longitude: 80.2842,
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600001',
    status: IssueStatus.IN_PROGRESS,
    createdAt: '2026-09-22T14:30:00Z',
    updatedAt: '2026-09-22T16:00:00Z',
  },
  {
    id: 'iss-403',
    title: 'Merchant Onboarding KYC Resubmission',
    description: 'GST certificate document requires clear re-scan for wholesale category upgrade.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-tn-dt1',
    vendorId: 'v-103',
    vendorName: 'Fresh Mart Supermarket',
    location: 'Kilpauk, Chennai',
    contactName: 'N. Subramanian',
    contactPhone: '9840334455',
    address: '88 Poonamallee High Road, Kilpauk, Chennai - 600010',
    latitude: 13.0784,
    longitude: 80.2443,
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600010',
    status: IssueStatus.OPEN,
    createdAt: '2026-09-21T09:15:00Z',
    updatedAt: '2026-09-22T11:00:00Z',
  },
  {
    id: 'iss-404',
    title: 'Delivery Schedule Delay',
    description: 'Organic spice consignments delayed by 2 days due to highway logistics bottleneck.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-000',
    vendorId: 'v-106',
    vendorName: 'Kovai Spices & Organics',
    location: 'Gandhipuram, Coimbatore',
    contactName: 'G. Balaji',
    contactPhone: '9840667788',
    address: '77 Cross Cut Road, Gandhipuram, Coimbatore - 641012',
    latitude: 11.0168,
    longitude: 76.9558,
    districtId: 'dt-cbe-01',
    divisionId: 'div-cbe-central',
    pincodeId: '641012',
    status: IssueStatus.RESOLVED,
    resolutionText: 'Warehouse dispatched alternative local courier. Vendor received consignment.',
    createdAt: '2026-09-20T16:45:00Z',
    updatedAt: '2026-09-21T18:00:00Z',
    resolvedAt: '2026-09-21T18:00:00Z',
  },
  {
    id: 'iss-405',
    title: 'Catalogue Sync Error',
    description: 'Item stock quantities in merchant app not syncing with central catalog database.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-tn-pin3',
    vendorId: 'v-104',
    vendorName: 'Royal Electronics & Mobile',
    location: 'Adyar, Chennai',
    contactName: 'V. Prakash',
    contactPhone: '9840445566',
    address: '24 Sardar Patel Road, Adyar, Chennai - 600020',
    latitude: 13.0067,
    longitude: 80.2570,
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-south',
    pincodeId: '600020',
    status: IssueStatus.IN_PROGRESS,
    createdAt: '2026-09-19T11:20:00Z',
    updatedAt: '2026-09-20T09:10:00Z',
  },
];

export class MockIssueRepository implements IIssueRepository {
  private issues: Issue[] = [...INITIAL_MOCK_ISSUES];

  async getIssues(
    assignedManagerId?: string,
    status?: IssueStatus,
    priority?: Priority,
    searchQuery?: string
  ): Promise<Issue[]> {
    let result = [...this.issues];

    if (assignedManagerId && assignedManagerId !== 'mgr-000') {
      result = result.filter(
        i =>
          i.assignedManagerId === assignedManagerId ||
          i.assignedManagerId === 'mgr-000'
      );
    }
    if (status) {
      result = result.filter(i => i.status === status);
    }
    if (priority) {
      result = result.filter(i => i.priority === priority);
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          (i.vendorName && i.vendorName.toLowerCase().includes(q)) ||
          (i.location && i.location.toLowerCase().includes(q)) ||
          i.description.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async getIssueById(id: string): Promise<Issue | null> {
    const found = this.issues.find(i => i.id === id);
    return found ? { ...found } : null;
  }

  async updateIssueStatus(issueId: string, status: IssueStatus, resolutionText?: string): Promise<Issue> {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }
    issue.status = status;
    issue.updatedAt = new Date().toISOString();
    if (status === IssueStatus.RESOLVED) {
      issue.resolutionText = resolutionText || 'Issue marked as resolved by manager.';
      issue.resolvedAt = new Date().toISOString();
    }
    return { ...issue };
  }

  async resolveIssue(issueId: string, resolutionText: string): Promise<Issue> {
    return this.updateIssueStatus(issueId, IssueStatus.RESOLVED, resolutionText);
  }
}
