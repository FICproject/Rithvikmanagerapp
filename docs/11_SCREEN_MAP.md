# 11. Mobile Screen Map & Navigation Drawer Structure

## 1. Top-Level Drawer Navigation Catalog

The mobile application uses a primary Side Drawer / Hamburger menu containing exactly:

1. **Dashboard** (`DashboardScreen`) - Executive Command Center
2. **Managers Directory** (`ManagersDirectoryScreen`) - Read-Only Territory Directory
3. **Reports** (`ReportsScreen`) - Activity History & Exception Reports Feed
4. **Vendors** (`VendorsListScreen`) - Directory, Search, Filter
5. **Tasks** (`TasksListScreen`) - Task Management (Low, Medium, High)
6. **Leaderboard** (`LeaderboardScreen`) - Territory Performance Rankings
7. **Notifications** (`NotificationsScreen`) - In-App Operational Alerts
8. **Profile** (`ProfileScreen`) - Manager Information & Territory Scope
9. **Settings** (`SettingsScreen`) - Account, Security, Password, About
10. **Logout** - Action Trigger (Token Invalidation & Session Clear)

---

## 2. Stack Screens (Detail & Operational Workflows)

- **Auth Stack**: `LoginScreen`, `ForgotPasswordScreen`
- **Vendor Stack**: `VendorDetailScreen`, `AddVendorScreen`, `VendorVisitScreen`
- **Task Stack**: `TaskDetailScreen`
- **Issue Stack**: `IssuesListScreen`, `IssueDetailScreen`
- **Report Stack**: `ExceptionReportFormScreen` (Text / Voice Input)

---

## 3. Scope Exclusion Verification

The following desktop/admin features are **EXPLICITLY EXCLUDED** from the mobile navigation screen map:

- ❌ Performance Admin
- ❌ Vendor Requests / KYC Approval
- ❌ System Admin / User Management
- ❌ Generic Daily Report Form
