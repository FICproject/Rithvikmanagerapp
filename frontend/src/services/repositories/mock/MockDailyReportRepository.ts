/**
 * Mock Implementation of IDailyReportRepository
 */
import { IDailyReportRepository, SubmitDailyReportPayload, ReportPeriodFilter } from '../IDailyReportRepository';
import { DailyReport } from '../../../types';
import { fieldVisitService } from '../../reports/FieldVisitService';

const getInitialMockReports = (): DailyReport[] => {
  return [
    {
      id: 'dr-100',
      managerId: 'mgr-001',
      date: '2026-09-22',
      workSummary: 'Routine vendor store visits and verification of catalog inventory.',
      vendorsVisited: [
        { vendorId: 'v-101', vendorName: 'Fresh Mart Supermarket', location: 'Bengaluru' },
        { vendorId: 'v-102', vendorName: 'ABC Stores', location: 'Mysuru' },
      ],
      issuesFollowUp: 'No major issues reported during yesterday visits.',
      additionalNotes: 'Follow-up scheduled with regional logistics coordinator.',
      status: 'SUBMITTED',
      createdAt: '2026-09-22T18:00:00.000Z',
      updatedAt: '2026-09-22T18:00:00.000Z',
    },
    {
      id: 'dr-101',
      managerId: 'mgr-001',
      date: '2026-09-23',
      workSummary: 'Completed vendor follow-ups and reviewed pending payment issues with Fresh Mart and ABC Stores.',
      vendorsVisited: [
        { vendorId: 'v-101', vendorName: 'Fresh Mart Supermarket', location: 'Bengaluru' },
        { vendorId: 'v-102', vendorName: 'ABC Stores', location: 'Mysuru' },
        { vendorId: 'v-103', vendorName: 'Bharat Traders', location: 'Hubballi' },
        { vendorId: 'v-104', vendorName: 'Kalyan Retailers', location: 'Mangaluru' },
        { vendorId: 'v-105', vendorName: 'Apex Wholesalers', location: 'Belagavi' },
      ],
      issuesFollowUp: 'Followed up on Fresh Mart invoice payout verification and POS display issues.',
      additionalNotes: 'All 5 scheduled vendor visits completed for the day.',
      status: 'SUBMITTED',
      createdAt: '2026-09-23T18:00:00.000Z',
      updatedAt: '2026-09-23T18:00:00.000Z',
    },
    {
      id: 'dr-102',
      managerId: 'mgr-001',
      date: '2026-09-20',
      workSummary: 'Conducted field audits and onboarded new retail vendors in the south division.',
      vendorsVisited: [
        { vendorId: 'v-101', vendorName: 'Fresh Mart Supermarket', location: 'Bengaluru' },
        { vendorId: 'v-102', vendorName: 'ABC Stores', location: 'Mysuru' },
        { vendorId: 'v-103', vendorName: 'Bharat Traders', location: 'Hubballi' },
      ],
      issuesFollowUp: 'Assisted Bharat Traders with catalog sync support.',
      additionalNotes: 'Verified documentation for GST tax invoices.',
      status: 'SUBMITTED',
      createdAt: '2026-09-20T18:00:00.000Z',
      updatedAt: '2026-09-20T18:00:00.000Z',
    },
    {
      id: 'dr-103',
      managerId: 'mgr-001',
      date: '2026-09-10',
      workSummary: 'Monthly planning meeting and territory coverage assessment for Q3 targets.',
      vendorsVisited: [
        { vendorId: 'v-104', vendorName: 'Kalyan Retailers', location: 'Mangaluru' },
        { vendorId: 'v-105', vendorName: 'Apex Wholesalers', location: 'Belagavi' },
      ],
      issuesFollowUp: 'Logistics delivery delay resolved for Kalyan Retailers.',
      additionalNotes: 'Quarterly growth report submitted to State Manager.',
      status: 'SUBMITTED',
      createdAt: '2026-09-10T18:00:00.000Z',
      updatedAt: '2026-09-10T18:00:00.000Z',
    },
  ];
};

export class MockDailyReportRepository implements IDailyReportRepository {
  private reports: DailyReport[] = getInitialMockReports();

  async getTodayReport(managerId: string, dateStr: string): Promise<DailyReport | null> {
    const found = this.reports.find(
      r => r.managerId === managerId && r.date === dateStr
    );
    return found ? { ...found } : null;
  }

  async getReportById(id: string): Promise<DailyReport | null> {
    if (!id || id.includes('invalid') || id.includes('nonexistent')) {
      return null;
    }
    const found = this.reports.find(r => r.id === id);
    if (found) {
      return { ...found };
    }


    // Dynamic report details generator for any visit log or report ID
    const visitRecords = await fieldVisitService.getVisitRecords();
    const matchedVisit = visitRecords.find(v => v.id === id);

    const mockTitles: Record<string, string> = {
      'visit_1700069977654_op_jp9j': 'Sri Murugan Departmental Store',
      'visit_1700069988123_sk_821a': 'Saravana Bhavan Hotel',
      'visit_1700069999456_mn_112z': 'Annapoorna Sweets & Bakery',
    };

    const shopTitle = matchedVisit?.shopName || mockTitles[id] || 'Field Visit Audit Log';
    const shopLocation = matchedVisit?.location || 'Salem (636102)';

    return {
      id: id,
      managerId: 'mgr-001',
      managerName: 'Ramesh Kumar',
      date: '2026-09-24',
      workSummary: `Verified operational catalog compliance, storefront GPS geotagging, and merchant onboarding details for ${shopTitle}. All documentation and tax invoices verified cleanly.`,
      shopsVisitedCount: 4,
      vendorsVisited: [
        { vendorId: 'v-101', vendorName: shopTitle, location: shopLocation },
        { vendorId: 'v-102', vendorName: 'Sri Lakshmi Enterprises', location: 'Salem (636102)' },
        { vendorId: 'v-103', vendorName: 'Vasanth & Co Retail Store', location: 'Coimbatore (641001)' },
      ],
      issuesFollowUp: 'No pending payment or catalog issues. Merchant confirmed positive interest.',
      additionalNotes: 'Field audit completed with GPS coordinates 11.6643° N, 78.1460° E. Voice note memo recorded.',
      voiceUrl: 'mock_audio_note.mp3',
      voiceDurationSeconds: 15,
      photo1Url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
      photo2Url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async submitDailyReport(payload: SubmitDailyReportPayload): Promise<DailyReport> {
    const existing = await this.getTodayReport(payload.managerId, payload.date);
    if (existing) {
      throw new Error("Today's report has already been submitted.");
    }

    const now = new Date().toISOString();
    const newReport: DailyReport = {
      id: `dr-${Date.now()}`,
      managerId: payload.managerId,
      date: payload.date,
      workSummary: payload.workSummary,
      shopsVisitedCount: payload.shopsVisitedCount ?? payload.vendorsVisited.length,
      vendorsVisited: payload.vendorsVisited,
      voiceUrl: payload.voiceUrl,
      voiceDurationSeconds: payload.voiceDurationSeconds,
      photo1Url: payload.photo1Url,
      photo2Url: payload.photo2Url,
      issuesFollowUp: payload.issuesFollowUp,
      additionalNotes: payload.additionalNotes,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    };

    this.reports.unshift(newReport);
    return { ...newReport };
  }

  async getReports(
    managerId: string,
    period?: ReportPeriodFilter,
    searchQuery?: string
  ): Promise<DailyReport[]> {
    let result = this.reports.filter(r => r.managerId === managerId);

    if (period && period !== 'ALL') {
      const now = new Date();
      result = result.filter(r => {
        const reportDate = new Date(r.date);
        const diffMs = now.getTime() - reportDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (period === 'DAILY') {
          return diffDays <= 1.5;
        }
        if (period === 'WEEKLY') {
          return diffDays <= 7;
        }
        if (period === 'MONTHLY') {
          return diffDays <= 30;
        }
        return true;
      });
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        r =>
          r.date.toLowerCase().includes(q) ||
          r.workSummary.toLowerCase().includes(q) ||
          (r.issuesFollowUp && r.issuesFollowUp.toLowerCase().includes(q)) ||
          (r.additionalNotes && r.additionalNotes.toLowerCase().includes(q))
      );
    }

    return result;
  }
}
