/**
 * Mock Implementation of ILeaderboardRepository
 */
import { LeaderboardEntry, ManagerRole } from '../../../types';
import {
  ILeaderboardRepository,
  LeaderboardPeriod,
  LeaderboardResponse,
} from '../ILeaderboardRepository';

const MOCK_LEADERBOARD_MONTHLY: LeaderboardEntry[] = [
  {
    managerId: 'mgr-000',
    managerName: 'Ramesh',
    role: ManagerRole.STATE_MANAGER,
    rank: 1,
    score: 520,
    vendorsOnboarded: 28,
    tasksCompleted: 48,
    issuesResolved: 21,
    territoryName: 'Tamil Nadu State',
    activitiesCount: 94,
  },
  {
    managerId: 'mgr-tn-dt1',
    managerName: 'Suresh Menon',
    role: ManagerRole.DISTRICT_MANAGER,
    rank: 2,
    score: 460,
    vendorsOnboarded: 22,
    tasksCompleted: 42,
    issuesResolved: 16,
    territoryName: 'Chennai District',
    activitiesCount: 82,
  },
  {
    managerId: 'mgr-tn-div1',
    managerName: 'K. Ananth',
    role: ManagerRole.DIVISION_MANAGER,
    rank: 3,
    score: 410,
    vendorsOnboarded: 18,
    tasksCompleted: 36,
    issuesResolved: 13,
    territoryName: 'Chennai North Division',
    activitiesCount: 68,
  },
  {
    managerId: 'mgr-tn-pin1',
    managerName: 'M. Selvi',
    role: ManagerRole.PINCODE_MANAGER,
    rank: 4,
    score: 380,
    vendorsOnboarded: 15,
    tasksCompleted: 31,
    issuesResolved: 11,
    territoryName: 'Parrys Pincode (600001)',
    activitiesCount: 58,
  },
  {
    managerId: 'mgr-102',
    managerName: 'Priya Sharma',
    role: ManagerRole.DIVISION_MANAGER,
    rank: 5,
    score: 350,
    vendorsOnboarded: 14,
    tasksCompleted: 28,
    issuesResolved: 9,
    territoryName: 'Indore Central',
    activitiesCount: 52,
  },
  {
    managerId: 'mgr-001',
    managerName: 'Rajesh Kumar',
    role: ManagerRole.DIVISION_MANAGER,
    rank: 6,
    score: 320,
    vendorsOnboarded: 13,
    tasksCompleted: 24,
    issuesResolved: 8,
    territoryName: 'Indore District',
    activitiesCount: 46,
  },
  {
    managerId: 'mgr-tn-dt2',
    managerName: 'R. Venkatesh',
    role: ManagerRole.DISTRICT_MANAGER,
    rank: 7,
    score: 295,
    vendorsOnboarded: 12,
    tasksCompleted: 21,
    issuesResolved: 7,
    territoryName: 'Coimbatore District',
    activitiesCount: 41,
  },
];

const MOCK_LEADERBOARD_WEEKLY: LeaderboardEntry[] = MOCK_LEADERBOARD_MONTHLY.map((item, idx) => ({
  ...item,
  rank: idx + 1,
  score: Math.round(item.score * 0.3),
  vendorsOnboarded: Math.max(1, Math.round(item.vendorsOnboarded * 0.3)),
  tasksCompleted: Math.max(2, Math.round(item.tasksCompleted * 0.3)),
  issuesResolved: Math.max(1, Math.round(item.issuesResolved * 0.3)),
  activitiesCount: Math.max(4, Math.round((item.activitiesCount || 20) * 0.3)),
}));

const MOCK_LEADERBOARD_TODAY: LeaderboardEntry[] = MOCK_LEADERBOARD_MONTHLY.map((item, idx) => ({
  ...item,
  rank: idx + 1,
  score: Math.round(item.score * 0.08),
  vendorsOnboarded: Math.max(0, Math.round(item.vendorsOnboarded * 0.08)),
  tasksCompleted: Math.max(1, Math.round(item.tasksCompleted * 0.08)),
  issuesResolved: Math.max(0, Math.round(item.issuesResolved * 0.08)),
  activitiesCount: Math.max(1, Math.round((item.activitiesCount || 20) * 0.08)),
}));

export class MockLeaderboardRepository implements ILeaderboardRepository {
  private monthlyData = MOCK_LEADERBOARD_MONTHLY;
  private weeklyData = MOCK_LEADERBOARD_WEEKLY;
  private todayData = MOCK_LEADERBOARD_TODAY;

  async getLeaderboard(
    managerId: string,
    period: LeaderboardPeriod = 'THIS_MONTH',
  ): Promise<LeaderboardResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let entries: LeaderboardEntry[];
    switch (period) {
      case 'TODAY':
        entries = [...this.todayData];
        break;
      case 'THIS_WEEK':
        entries = [...this.weeklyData];
        break;
      case 'THIS_MONTH':
      default:
        entries = [...this.monthlyData];
        break;
    }

    const currentUserEntry = entries.find(e => e.managerId === managerId) || null;

    const isTn = managerId === 'mgr-000' || managerId.startsWith('mgr-tn');
    return {
      territoryScopeName: isTn ? 'Tamil Nadu State Scope' : 'Indore District Scope',
      period,
      currentUserEntry,
      entries,
    };
  }
}
