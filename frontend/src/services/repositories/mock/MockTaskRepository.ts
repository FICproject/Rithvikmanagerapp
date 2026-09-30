/**
 * Mock Implementation of ITaskRepository with Business Rule Enforcement
 */
import { ITaskRepository } from '../ITaskRepository';
import { Priority, Task, TaskStatus } from '../../../types';

const INITIAL_MOCK_TASKS: Task[] = [
  {
    id: 't-301',
    title: 'Complete merchant verification',
    description: 'Perform physical store visit to verify street address and shop photo.',
    priority: Priority.CRITICAL,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.PENDING,
    assignedBy: 'Central Admin',
    territory: 'Tamil Nadu East',
    dueSla: 'Due Today • 5:00 PM',
    notes: 'Confirm GPS coordinates and storefront signboard clarity.',
    createdAt: '2026-09-29T08:00:00Z',
    updatedAt: '2026-09-29T08:00:00Z',
  },
  {
    id: 't-302',
    title: 'Visit 5 assigned merchants',
    description: 'Field compliance audit and merchant terminal connectivity check.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'State Lead',
    territory: 'Bengaluru North',
    dueSla: 'Due Tomorrow • 6:00 PM',
    notes: 'Prioritize electronics wholesale lane.',
    createdAt: '2026-09-28T09:15:00Z',
    updatedAt: '2026-09-29T09:15:00Z',
  },
  {
    id: 't-303',
    title: 'Submit daily field report',
    description: 'Summarize today merchant visits, issues resolved, and onboarding status.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.COMPLETED,
    assignedBy: 'Operations Desk',
    territory: 'Bengaluru North',
    dueSla: 'Due 28 Sep 2026',
    notes: 'Completed with full geotagged proof of visits.',
    createdAt: '2026-09-27T10:00:00Z',
    updatedAt: '2026-09-28T18:00:00Z',
    completedAt: '2026-09-28T18:00:00Z',
  },
  {
    id: 't-304',
    title: 'Collect store photographs',
    description: 'High-resolution before and after storefront photos required for compliance.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.PENDING,
    assignedBy: 'Marketing Lead',
    territory: 'Coimbatore Central',
    dueSla: 'Due 29 Sep 2026',
    notes: 'Ensure branding board is clearly visible without reflection.',
    createdAt: '2026-09-29T07:30:00Z',
    updatedAt: '2026-09-29T07:30:00Z',
  },
  {
    id: 't-305',
    title: 'Resolve payment issue',
    description: 'Investigate UPI settlement bounce reported by North Division merchant.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'Settlements Team',
    territory: 'Chennai South',
    dueSla: 'Due Today • 7:00 PM',
    notes: 'Escalated to banking partner gateway desk.',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 't-306',
    title: 'Deliver POS QR standee to Royal Bakery',
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
    id: 't-307',
    title: 'Audit Dharmapuri Merchant Onboarding KYC',
    description: 'Perform secondary audit on 10 newly onboarded merchants in Dharmapuri.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'Compliance Head',
    territory: 'Dharmapuri',
    dueSla: 'Due 12 Hours',
    notes: 'Cross-verify signboard photos with address records.',
    createdAt: '2026-09-29T09:30:00Z',
    updatedAt: '2026-09-29T09:30:00Z',
  },
  {
    id: 't-308',
    title: 'Resolve Blocked Payout Dispute',
    description: 'Merchant payout on hold pending bank IFSC correction.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.PENDING,
    assignedBy: 'Settlements Team',
    territory: 'Salem Division',
    dueSla: 'Due 30 Sep 2026',
    notes: 'Awaiting cancelled cheque copy from vendor.',
    createdAt: '2026-09-28T10:15:00Z',
    updatedAt: '2026-09-28T11:00:00Z',
  },
  {
    id: 't-309',
    title: 'Distribute Promotion Kits to Tier 1 Merchants',
    description: 'Deliver festival promotional marketing material across active outlets.',
    priority: Priority.LOW,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.COMPLETED,
    assignedBy: 'Marketing Lead',
    territory: 'Coimbatore East',
    dueSla: 'Completed',
    notes: 'Delivered to all 24 participating vendors.',
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-09-22T17:00:00Z',
    completedAt: '2026-09-22T17:00:00Z',
  },
  {
    id: 't-310',
    title: 'Collect KYC Documents from Apex Wholesale',
    description: 'Collect updated GST certificate and bank mandate for wholesale tier upgrade.',
    priority: Priority.MEDIUM,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.PENDING,
    assignedBy: 'Compliance Desk',
    territory: 'Indore East',
    dueSla: 'Due Tomorrow • 11:00 AM',
    notes: 'Ensure PAN matches trade license holder.',
    createdAt: '2026-09-29T08:30:00Z',
    updatedAt: '2026-09-29T08:30:00Z',
  },
  {
    id: 't-311',
    title: 'Critical Stock Shortage Investigation at North Hub',
    description: 'Investigate delayed FMCG consignments causing merchant stockouts.',
    priority: Priority.HIGH,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'Supply Chain Head',
    territory: 'Indore North',
    dueSla: 'Due Today • 4:00 PM',
    notes: 'Coordinate with warehouse supervisor.',
    createdAt: '2026-09-29T11:30:00Z',
    updatedAt: '2026-09-29T11:30:00Z',
  },
  {
    id: 't-312',
    title: 'Urgent Payment Discrepancy Escalation',
    description: 'Resolve unpaid invoice complaint flagged by North Division vendor.',
    priority: Priority.CRITICAL,
    assignedManagerId: 'mgr-001',
    status: TaskStatus.IN_PROGRESS,
    assignedBy: 'State Lead',
    territory: 'Indore Central',
    dueSla: 'Due Today • 2:00 PM',
    notes: 'Escalated to accounts team for immediate reconciliation.',
    createdAt: '2026-09-29T09:15:00Z',
    updatedAt: '2026-09-29T09:15:00Z',
  },
];

export class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = [...INITIAL_MOCK_TASKS];

  async getTasks(assignedManagerId: string, status?: TaskStatus, priority?: Priority): Promise<Task[]> {
    let result = this.tasks.filter(
      t => t.assignedManagerId === assignedManagerId || assignedManagerId === 'mgr-000' || assignedManagerId === 'mgr-001'
    );
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

  async completeTask(taskId: string, payload?: any): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    
    if (typeof payload === 'string') {
      task.notes = payload;
    } else if (payload && typeof payload === 'object') {
      if (payload.notes) task.notes = payload.notes;
      if (payload.beforePhotoUrl) task.beforePhotoUrl = payload.beforePhotoUrl;
      if (payload.beforePhotoTimestamp) task.beforePhotoTimestamp = payload.beforePhotoTimestamp;
      if (payload.beforePhotoLocation) task.beforePhotoLocation = payload.beforePhotoLocation;
      if (payload.afterPhotoUrl) task.afterPhotoUrl = payload.afterPhotoUrl;
      if (payload.afterPhotoTimestamp) task.afterPhotoTimestamp = payload.afterPhotoTimestamp;
      if (payload.afterPhotoLocation) task.afterPhotoLocation = payload.afterPhotoLocation;
    }

    // Default real-time proof of work photos if not explicitly set
    if (!task.beforePhotoUrl) {
      task.beforePhotoUrl = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop';
      task.beforePhotoTimestamp = new Date(Date.now() - 30 * 60 * 1000).toLocaleString();
      task.beforePhotoLocation = '13.0827° N, 80.2707° E (Chennai Central)';
    }
    if (!task.afterPhotoUrl) {
      task.afterPhotoUrl = 'https://images.unsplash.com/photo-1556742049-0a670fc80799?w=600&auto=format&fit=crop';
      task.afterPhotoTimestamp = new Date().toLocaleString();
      task.afterPhotoLocation = '13.0827° N, 80.2707° E (Chennai Central)';
    }

    return task;
  }

  async resolveHighPriorityTask(taskId: string, resolutionNotes: string, payload?: any): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    task.status = TaskStatus.RESOLVED;
    task.notes = resolutionNotes;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    
    if (payload && typeof payload === 'object') {
      if (payload.beforePhotoUrl) task.beforePhotoUrl = payload.beforePhotoUrl;
      if (payload.beforePhotoTimestamp) task.beforePhotoTimestamp = payload.beforePhotoTimestamp;
      if (payload.beforePhotoLocation) task.beforePhotoLocation = payload.beforePhotoLocation;
      if (payload.afterPhotoUrl) task.afterPhotoUrl = payload.afterPhotoUrl;
      if (payload.afterPhotoTimestamp) task.afterPhotoTimestamp = payload.afterPhotoTimestamp;
      if (payload.afterPhotoLocation) task.afterPhotoLocation = payload.afterPhotoLocation;
    }

    if (!task.beforePhotoUrl) {
      task.beforePhotoUrl = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop';
      task.beforePhotoTimestamp = new Date(Date.now() - 30 * 60 * 1000).toLocaleString();
      task.beforePhotoLocation = '13.0827° N, 80.2707° E (Chennai Central)';
    }
    if (!task.afterPhotoUrl) {
      task.afterPhotoUrl = 'https://images.unsplash.com/photo-1556742049-0a670fc80799?w=600&auto=format&fit=crop';
      task.afterPhotoTimestamp = new Date().toLocaleString();
      task.afterPhotoLocation = '13.0827° N, 80.2707° E (Chennai Central)';
    }

    return task;
  }
}
