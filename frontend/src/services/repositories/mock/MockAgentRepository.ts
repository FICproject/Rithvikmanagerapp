/**
 * Mock Implementation of Field Agents Repository
 * Scoped to authorized manager's territory
 */
import { AgentStatusFilter, IAgentRepository } from '../IAgentRepository';
import { FieldAgent } from '../../../types';

const INITIAL_MOCK_AGENTS: FieldAgent[] = [
  {
    id: 'fa-001',
    name: 'Karthik Raja',
    phone: '+91 94433 11223',
    assignedPincode: '636701',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-central-01',
    status: 'ACTIVE',
    assignedManager: 'Ramesh (State Manager)',
    assignedManagerId: 'mgr-000',
    createdAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'fa-002',
    name: 'Selvakumar M',
    phone: '+91 98844 55667',
    assignedPincode: '636702',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-central-01',
    status: 'ACTIVE',
    assignedManager: 'Ramesh (State Manager)',
    assignedManagerId: 'mgr-000',
    createdAt: '2025-02-15T09:30:00Z',
  },
  {
    id: 'fa-003',
    name: 'Anand Sundaram',
    phone: '+91 97722 33445',
    assignedPincode: '636703',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-central-01',
    status: 'ON_LEAVE',
    assignedManager: 'Ramesh (State Manager)',
    assignedManagerId: 'mgr-000',
    createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'fa-004',
    name: 'Dinesh Balan',
    phone: '+91 91234 56780',
    assignedPincode: '636704',
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-central-01',
    status: 'ACTIVE',
    assignedManager: 'Ramesh (State Manager)',
    assignedManagerId: 'mgr-000',
    createdAt: '2025-03-10T11:00:00Z',
  },
  {
    id: 'fa-005',
    name: 'Sunil Verma',
    phone: '+91 98260 12345',
    assignedPincode: '452001',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    status: 'ACTIVE',
    assignedManager: 'Rajesh Kumar',
    assignedManagerId: 'mgr-001',
    createdAt: '2025-01-20T08:00:00Z',
  },
  {
    id: 'fa-006',
    name: 'Manoj Patidar',
    phone: '+91 98260 54321',
    assignedPincode: '452002',
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    status: 'INACTIVE',
    assignedManager: 'Rajesh Kumar',
    assignedManagerId: 'mgr-001',
    createdAt: '2025-01-25T09:00:00Z',
  },
];

export class MockAgentRepository implements IAgentRepository {
  private agents: FieldAgent[] = [...INITIAL_MOCK_AGENTS];

  async getAgentsInScope(
    requestingManagerId: string,
    query?: string,
    statusFilter?: AgentStatusFilter
  ): Promise<FieldAgent[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        let results = [...this.agents];

        // Territory Scope Filter
        if (requestingManagerId === 'mgr-001') {
          results = results.filter(a => a.stateId === 'st-mp-01');
        } else if (requestingManagerId === 'mgr-000') {
          results = results.filter(a => a.stateId === 'st-tn-01');
        }

        // Status filter
        if (statusFilter && statusFilter !== 'ALL') {
          results = results.filter(a => a.status === statusFilter);
        }

        // Search query filter (name, phone, pincode)
        if (query && query.trim()) {
          const q = query.trim().toLowerCase();
          results = results.filter(
            a =>
              a.name.toLowerCase().includes(q) ||
              a.phone.toLowerCase().includes(q) ||
              a.assignedPincode.toLowerCase().includes(q)
          );
        }

        resolve(results);
      }, 50);
    });
  }

  async getAgentById(id: string): Promise<FieldAgent | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const found = this.agents.find(a => a.id === id) || null;
        resolve(found);
      }, 30);
    });
  }
}
