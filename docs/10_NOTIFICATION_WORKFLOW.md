# 10. Notification Workflow Specification

## 1. Operational Notification Triggers

| Event Trigger | Notification Priority | Target Manager | Deep Link Target |
| :--- | :--- | :--- | :--- |
| **New Task Assigned** | Normal | Assigned Manager | `TaskDetailScreen(taskId)` |
| **High Priority Task Assigned** | Urgent / High | Assigned Manager | `TaskDetailScreen(taskId)` |
| **Issue Assigned** | High | Assigned Manager | `IssueDetailScreen(issueId)` |
| **Task Completed** | Low / Info | Reporting Manager | `TaskDetailScreen(taskId)` |
| **Issue Resolved** | Low / Info | Reporting Manager | `IssueDetailScreen(issueId)` |
| **Report Required** (Not Interested Visit) | Urgent | Visiting Manager | `ReportFormScreen(activityId)` |
| **Leaderboard Rank Updated** | Low / Info | All Managers in Territory | `LeaderboardScreen` |

---

## 2. Push Notification Architecture Interface

The notification subsystem is designed to support Firebase Cloud Messaging (FCM) or APNs integration via a decoupled listener service interface:

```typescript
export interface INotificationService {
  initialize(): Promise<void>;
  requestPermissions(): Promise<boolean>;
  getDeviceToken(): Promise<string | null>;
  onNotificationReceived(callback: (notification: AppNotification) => void): () => void;
  onNotificationOpened(callback: (notification: AppNotification) => void): () => void;
}
```

This guarantees push notification delivery without coupling component logic to specific vendor SDKs.
