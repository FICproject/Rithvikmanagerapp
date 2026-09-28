/**
 * Mock Implementation of IIssueRepository
 */
import { IIssueRepository } from '../IIssueRepository';
import { Issue, IssueStatus, Priority } from '../../../types';

const INITIAL_MOCK_ISSUES: Issue[] = [
  {
    id: 'iss-401',
    title: 'Payment Issue',
    description: 'Payment processing failure on Fresh Mart invoice batch #4402. Vendor requesting urgent payment verification.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    vendorId: 'v-101',
    vendorName: 'Fresh Mart Supermarket',
    location: 'Bengaluru',
    status: IssueStatus.OPEN,
    createdAt: '2026-09-23T10:00:00Z',
    updatedAt: '2026-09-23T10:00:00Z',
  },
  {
    id: 'iss-402',
    title: 'Device Issue',
    description: 'POS device display flickering and failing to read payment QR codes consistently.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-001',
    vendorId: 'v-102',
    vendorName: 'ABC Stores',
    location: 'Mysuru',
    status: IssueStatus.IN_PROGRESS,
    createdAt: '2026-09-22T14:30:00Z',
    updatedAt: '2026-09-22T16:00:00Z',
  },
  {
    id: 'iss-403',
    title: 'Vendor Service Issue',
    description: 'Vendor account setup assistance and catalog sync support requested for Bharat Traders.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-001',
    vendorId: 'v-103',
    vendorName: 'Bharat Traders',
    location: 'Hubballi',
    status: IssueStatus.RESOLVED,
    resolutionText: 'Assisted vendor with catalog sync and verified transaction log.',
    createdAt: '2026-09-21T09:15:00Z',
    updatedAt: '2026-09-22T11:00:00Z',
    resolvedAt: '2026-09-22T11:00:00Z',
  },
  {
    id: 'iss-404',
    title: 'Delivery Issue',
    description: 'Stock delivery delayed by 3 days due to transport logistics disruption.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    vendorId: 'v-104',
    vendorName: 'Kalyan Retailers',
    location: 'Mangaluru',
    status: IssueStatus.OPEN,
    createdAt: '2026-09-20T16:45:00Z',
    updatedAt: '2026-09-20T16:45:00Z',
  },
  {
    id: 'iss-405',
    title: 'Documentation Issue',
    description: 'GST tax invoice document upload verification pending state manager review.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-001',
    vendorId: 'v-105',
    vendorName: 'Apex Wholesalers',
    location: 'Belagavi',
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

    if (assignedManagerId) {
      result = result.filter(i => i.assignedManagerId === assignedManagerId);
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
