/**
 * Mock Implementation of ITaskRepository with Business Rule Enforcement
 */
import { ITaskRepository } from '../ITaskRepository';
import { Priority, Task, TaskStatus } from '../../../types';

const INITIAL_MOCK_TASKS: Task[] = [
  {
    id: 't-301',
    title: 'Verify Vendor Store Address',
    description: 'Perform physical store visit to verify street address and shop photo.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.ASSIGNED,
    assignedBy: 'Operations Admin',
    territory: 'Indore North',
    dueSla: '24 Hours',
    notes: 'Confirm GPS coordinates and storefront signboard clarity.',
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 't-302',
    title: 'Urgent Payment Discrepancy Escalation',
    description: 'Resolve unpaid invoice complaint flagged by North Division vendor.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'State Lead',
    territory: 'Indore Central',
    dueSla: '4 Hours',
    notes: 'Escalated to accounts team for immediate reconciliation.',
    createdAt: '2026-09-22T09:15:00Z',
    updatedAt: '2026-09-22T09:15:00Z',
  },
  {
    id: 't-303',
    title: 'Collect KYC Documents from Apex Wholesale',
    description: 'Collect updated GST certificate and bank mandate for wholesale tier upgrade.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.ASSIGNED,
    assignedBy: 'Compliance Desk',
    territory: 'Indore East',
    dueSla: '48 Hours',
    notes: 'Ensure PAN matches trade license holder.',
    createdAt: '2026-09-23T11:00:00Z',
    updatedAt: '2026-09-23T11:00:00Z',
  },
  {
    id: 't-304',
    title: 'Critical Stock Shortage Investigation at North Hub',
    description: 'Investigate delayed FMCG consignments causing merchant stockouts.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'Supply Chain Head',
    territory: 'Indore North',
    dueSla: '6 Hours',
    notes: 'Coordinate with warehouse supervisor.',
    createdAt: '2026-09-23T14:30:00Z',
    updatedAt: '2026-09-23T14:30:00Z',
  },
  {
    id: 't-305',
    title: 'Deliver POS QR Standee to Royal Bakery',
    description: 'Hand over newly minted merchant QR standee and verify merchant payment test.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.COMPLETED,
    assignedBy: 'Merchant Onboarding Desk',
    territory: 'Indore West',
    dueSla: 'Completed',
    notes: 'Test transaction completed successfully.',
    createdAt: '2026-09-21T10:00:00Z',
    updatedAt: '2026-09-22T16:00:00Z',
    completedAt: '2026-09-22T16:00:00Z',
  },
  {
    id: 't-306',
    title: 'Critical QR Standee Re-issuance',
    description: 'Replace damaged merchant payment QR standee at Sri Meenakshi Stores.',
    priority: Priority.CRITICAL,
    assignedManagerId: 'mgr-000',
    status: TaskStatus.PENDING,
    assignedBy: 'Central Admin',
    territory: 'Chennai Central',
    dueSla: '2 Hours (Critical SLA)',
    notes: 'Direct directive from Operations Director.',
    createdAt: '2026-09-24T08:00:00Z',
    updatedAt: '2026-09-24T08:00:00Z',
  },
  {
    id: 't-307',
    title: 'Audit Dharmapuri Merchant Onboarding KYC',
    description: 'Perform secondary audit on 10 newly onboarded merchants in Dharmapuri.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-000',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'Compliance Head',
    territory: 'Dharmapuri',
    dueSla: '12 Hours',
    notes: 'Cross-verify signboard photos with address records.',
    createdAt: '2026-09-24T09:30:00Z',
    updatedAt: '2026-09-24T09:30:00Z',
  },
  {
    id: 't-308',
    title: 'Resolve Blocked Payout Dispute',
    description: 'Merchant payout on hold pending bank IFSC correction.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-000',
    status: TaskStatus.BLOCKED,
    assignedBy: 'Settlements Team',
    territory: 'Salem Division',
    dueSla: '24 Hours',
    notes: 'Awaiting cancelled cheque copy from vendor.',
    createdAt: '2026-09-24T10:15:00Z',
    updatedAt: '2026-09-24T11:00:00Z',
  },
  {
    id: 't-309',
    title: 'Distribute Promotion Kits to Tier 1 Merchants',
    description: 'Deliver festival promotional marketing material across active outlets.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-000',
    status: TaskStatus.COMPLETED,
    assignedBy: 'Marketing Lead',
    territory: 'Coimbatore East',
    dueSla: 'Completed',
    notes: 'Delivered to all 24 participating vendors.',
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-09-22T17:00:00Z',
    completedAt: '2026-09-22T17:00:00Z',
  },
];

export class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = [...INITIAL_MOCK_TASKS];

  async getTasks(assignedManagerId: string, status?: TaskStatus, priority?: Priority): Promise<Task[]> {
    let result = this.tasks.filter(t => t.assignedManagerId === assignedManagerId);
    if (result.length === 0 && (assignedManagerId === 'mgr-000' || assignedManagerId === 'mgr-001')) {
      // Fallback for demo flexibility
      result = this.tasks.filter(t => t.assignedManagerId === assignedManagerId || t.assignedManagerId === 'mgr-001');
    }
    if (status) {
      if (status === TaskStatus.PENDING) {
        result = result.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.ASSIGNED);
      } else if (status === TaskStatus.COMPLETED) {
        result = result.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.RESOLVED);
      } else {
        result = result.filter(t => t.status === status);
      }
    }
    if (priority) {
      result = result.filter(t => t.priority === priority);
    }
    return result;
  }

  async getTaskById(id: string): Promise<Task | null> {
    const found = this.tasks.find(t => t.id === id);
    return found || null;
  }

  async acceptTask(taskId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.priority === Priority.HIGH) {
      throw new Error('High priority tasks do not require accept/reject workflow.');
    }
    task.status = TaskStatus.ACCEPTED;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  async startTask(taskId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.IN_PROGRESS;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  async blockTask(taskId: string, notes?: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.BLOCKED;
    if (notes) task.notes = notes;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  async resumeTask(taskId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.IN_PROGRESS;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  async rejectTask(taskId: string, reason: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.priority === Priority.HIGH || task.priority === Priority.CRITICAL) {
      throw new Error('High-priority tasks CANNOT be rejected. Resolution is mandatory.');
    }
    task.status = TaskStatus.REJECTED;
    task.rejectionReason = reason;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  async completeTask(taskId: string, notes?: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.COMPLETED;
    if (notes) task.notes = notes;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    return task;
  }

  async resolveHighPriorityTask(taskId: string, resolutionNotes: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.RESOLVED;
    task.notes = resolutionNotes;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    return task;
  }
}
