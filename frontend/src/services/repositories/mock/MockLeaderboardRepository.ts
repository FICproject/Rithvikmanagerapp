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
    managerId: 'mgr-101',
    managerName: 'Amit Verma',
    role: ManagerRole.DISTRICT_MANAGER,
    rank: 1,
    score: 480,
    vendorsOnboarded: 24,
    tasksCompleted: 45,
    issuesResolved: 18,
    territoryName: 'Bengaluru North',
    activitiesCount: 87,
  },
  {
    managerId: 'mgr-102',
    managerName: 'Priya Sharma',
    role: ManagerRole.DIVISION_MANAGER,
    rank: 2,
    score: 420,
    vendorsOnboarded: 19,
    tasksCompleted: 38,
    issuesResolved: 14,
    territoryName: 'Indore Central',
    activitiesCount: 71,
  },
  {
    managerId: 'mgr-103',
    managerName: 'Suresh Patel',
    role: ManagerRole.PINCODE_MANAGER,
    rank: 3,
    score: 395,
    vendorsOnboarded: 16,
    tasksCompleted: 32,
    issuesResolved: 12,
    territoryName: 'Ahmedabad West',
    activitiesCount: 60,
  },
  {
    managerId: 'mgr-104',
    managerName: 'Deepak Joshi',
    role: ManagerRole.DISTRICT_MANAGER,
    rank: 4,
    score: 360,
    vendorsOnboarded: 15,
    tasksCompleted: 30,
    issuesResolved: 10,
    territoryName: 'Bhopal South',
    activitiesCount: 55,
  },
  {
    managerId: 'mgr-105',
    managerName: 'Ananya Roy',
    role: ManagerRole.DIVISION_MANAGER,
    rank: 5,
    score: 340,
    vendorsOnboarded: 14,
    tasksCompleted: 28,
    issuesResolved: 9,
    territoryName: 'Kolkata East',
    activitiesCount: 51,
  },
  {
    managerId: 'mgr-106',
    managerName: 'Vikram Singh',
    role: ManagerRole.DISTRICT_MANAGER,
    rank: 6,
    score: 310,
    vendorsOnboarded: 13,
    tasksCompleted: 26,
    issuesResolved: 8,
    territoryName: 'Indore East',
    activitiesCount: 47,
  },
  {
    managerId: 'mgr-107',
    managerName: 'Neha Gupta',
    role: ManagerRole.PINCODE_MANAGER,
    rank: 7,
    score: 290,
    vendorsOnboarded: 13,
    tasksCompleted: 22,
    issuesResolved: 7,
    territoryName: 'Mysuru Urban',
    activitiesCount: 42,
  },
  {
    managerId: 'mgr-001',
    managerName: 'Rajesh Kumar',
    role: ManagerRole.DIVISION_MANAGER,
    rank: 8,
    score: 275,
    vendorsOnboarded: 12,
    tasksCompleted: 20,
    issuesResolved: 6,
    territoryName: 'Indore District',
    activitiesCount: 38,
  },
  {
    managerId: 'mgr-108',
    managerName: 'Rahul Kumar',
    role: ManagerRole.PINCODE_MANAGER,
    rank: 9,
    score: 250,
    vendorsOnboarded: 10,
    tasksCompleted: 18,
    issuesResolved: 5,
    territoryName: 'Mysuru Rural',
    activitiesCount: 33,
  },
  {
    managerId: 'mgr-109',
    managerName: 'Kavita Nair',
    role: ManagerRole.DISTRICT_MANAGER,
    rank: 10,
    score: 220,
    vendorsOnboarded: 8,
    tasksCompleted: 15,
    issuesResolved: 4,
    territoryName: 'Kochi Central',
    activitiesCount: 27,
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

    return {
      territoryScopeName: 'Indore District Scope',
      period,
      currentUserEntry,
      entries,
    };
  }
}
