/**
 * Mock Implementation of IDashboardRepository
 */
import { IDashboardRepository, DashboardSummaryData } from '../IDashboardRepository';
import { Activity, ActivityType, Priority } from '../../../types';
import { MockManagerRepository } from './MockManagerRepository';

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-101',
    managerId: 'mgr-001',
    activityType: ActivityType.VENDOR_ONBOARDED,
    entityId: 'v-101',
    entityName: 'Sri Foods - Tamil Nadu East',
    timestamp: '2026-09-22T10:24:00.000Z',
    territory: {
      stateId: 'st-tn-01',
      districtId: 'dt-chn-01',
      divisionId: 'div-east-01',
      pincodeId: '600001',
    },
  },
  {
    id: 'act-102',
    managerId: 'mgr-001',
    activityType: ActivityType.TASK_COMPLETED,
    entityId: 't-301',
    entityName: 'ABC Traders - Tamil Nadu West',
    timestamp: '2026-09-22T09:18:00.000Z',
    territory: {
      stateId: 'st-tn-01',
      districtId: 'dt-chn-01',
      divisionId: 'div-west-01',
      pincodeId: '600002',
    },
  },
  {
    id: 'act-103',
    managerId: 'mgr-001',
    activityType: ActivityType.VENDOR_ONBOARDED,
    entityId: 'v-103',
    entityName: 'Fresh Mart - Tamil Nadu North',
    timestamp: '2026-09-22T12:30:00.000Z',
    territory: {
      stateId: 'st-tn-01',
      districtId: 'dt-chn-01',
      divisionId: 'div-north-01',
      pincodeId: '600003',
    },
  },
  {
    id: 'act-104',
    managerId: 'mgr-001',
    activityType: ActivityType.ISSUE_RESOLVED,
    entityId: 'iss-401',
    entityName: 'Payment delay - Tamil Nadu South',
    timestamp: '2026-09-22T14:00:00.000Z',
    territory: {
      stateId: 'st-tn-01',
      districtId: 'dt-chn-01',
      divisionId: 'div-south-01',
      pincodeId: '600004',
    },
  },
  {
    id: 'act-105',
    managerId: 'mgr-001',
    activityType: ActivityType.TASK_COMPLETED,
    entityId: 't-302',
    entityName: 'Division A - Krishnagiri',
    timestamp: '2026-09-22T16:30:00.000Z',
    territory: {
      stateId: 'st-tn-01',
      districtId: 'dt-kri-01',
      divisionId: 'div-a-01',
      pincodeId: '635001',
    },
  },
];

export class MockDashboardRepository implements IDashboardRepository {
  private activities: Activity[] = [...MOCK_ACTIVITIES];
  private managerRepo = new MockManagerRepository();

  async getDashboardSummary(managerId: string): Promise<DashboardSummaryData> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const mgr = await this.managerRepo.getManagerById(managerId);

    const managerName = mgr?.name || 'Rajesh Kumar';
    const roleFormatted = mgr?.id === 'mgr-001' ? 'District Manager' : (mgr?.role ? String(mgr.role).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'District Manager');
    const territory = mgr?.territoryName || 'Indore District';

    return {
      managerName,
      role: roleFormatted,
      territoryName: territory,
      vendorCount: 248,
      activeTaskCount: 5,
      openIssueCount: 2,
      todayActivityCount: this.activities.length,
      managerCount: 13,
      activeOutletsCount: 186,
      onboardedVendorCount: 42,
      managerGrowth: '↑ 7.7%',
      vendorGrowth: '↑ 12.4%',
      outletsGrowth: '↑ 9.1%',
      onboardedGrowth: '↑ 15.3%',
      stateScope: 'Tamil Nadu',
      highPriorityAlerts: [
        {
          id: 't-302',
          type: 'TASK',
          title: 'Urgent Payment Discrepancy Escalation',
          priority: Priority.HIGH,
        },
        {
          id: 'iss-401',
          type: 'ISSUE',
          title: 'Delayed Vendor Payout Verification',
          priority: Priority.HIGH,
        },
      ],
    };
  }

  async getRecentActivities(managerId: string, limit: number = 10): Promise<Activity[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return this.activities.slice(0, limit);
  }
}
