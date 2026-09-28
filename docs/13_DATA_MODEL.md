# 13. Data Model Specification

## 1. Domain Model Overview

The domain model represents operational field assets, manager scope, tasks, issues, activities, exception reports, notifications, leaderboard metrics, and authentication sessions.

---

## 2. Core Entities (14 Finalized Entities)

### 1. User / Manager (`Manager`)

- **Primary Key**: `id`: string (UUID)
- **Role**: `role`: `STATE_MANAGER` | `DISTRICT_MANAGER` | `DIVISION_MANAGER` | `PINCODE_MANAGER`
- **Required Fields**: `name`, `email`, `phone`, `role`, `stateId`
- **Optional Fields**: `districtId`, `divisionId`, `divisionName` (`NORTH` | `SOUTH` | `EAST` | `WEST`), `pincodeId`, `profileImage`
- **Territory Relationship**: Direct foreign keys to `State`, `District`, `Division`, `Pincode`
- **Audit Fields**: `createdAt`, `updatedAt`

---

### 2. State (`State`)

- **Primary Key**: `id`: string (UUID)
- **Required Fields**: `name` (e.g., "Madhya Pradesh"), `stateCode` (e.g., "MP")
- **Audit Fields**: `createdAt`, `updatedAt`

---

### 3. District (`District`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Key**: `stateId`: string (FK $\rightarrow$ `State`)
- **Required Fields**: `name` (e.g., "Indore District"), `districtCode`
- **Audit Fields**: `createdAt`, `updatedAt`

---

### 4. Division (`Division`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `stateId`: string (FK $\rightarrow$ `State`), `districtId`: string (FK $\rightarrow$ `District`)
- **Required Fields**: `name`: `NORTH` | `SOUTH` | `EAST` | `WEST`
- **Audit Fields**: `createdAt`, `updatedAt`

---

### 5. Pincode (`Pincode`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `stateId`: string, `districtId`: string, `divisionId`: string
- **Required Fields**: `pincodeNumber`: string (6 digits, e.g., "452001"), `areaName`: string
- **Audit Fields**: `createdAt`, `updatedAt`

---

### 6. Vendor (`Vendor`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `stateId`, `districtId`, `divisionId`, `pincodeId`, `createdById` (FK $\rightarrow$ `Manager`)
- **Required Fields**: `businessName`, `vendorName`, `phone`, `category`, `businessType`, `address`, `status`
- **Status Enum**: `LEAD` | `VISITED` | `ONBOARDED` | `NOT_INTERESTED`
- **Optional Fields**: `email`, `shopPhotoUrl`, `documentUrls`
- **Audit Fields**: `createdById`, `createdAt`, `updatedAt`

---

### 7. Vendor Visit (`VendorVisit`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `vendorId` (FK $\rightarrow$ `Vendor`), `managerId` (FK $\rightarrow$ `Manager`), `activityId` (FK $\rightarrow$ `Activity`)
- **Required Fields**: `visitTime`: string (ISO 8601), `interested`: boolean
- **Optional Fields**: `notes`: string, `reportId`: string (FK $\rightarrow$ `Report` if interested = false)
- **Territory Relationship**: Snapshots `stateId`, `districtId`, `divisionId`, `pincodeId`
- **Audit Fields**: `createdAt`

---

### 8. Task (`Task`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `assignedManagerId` (FK $\rightarrow$ `Manager`), `vendorId` (optional FK $\rightarrow$ `Vendor`), `issueId` (optional FK $\rightarrow$ `Issue`)
- **Priority Enum**: `LOW` | `MEDIUM` | `HIGH`
- **Status Enum**: `ASSIGNED` | `ACCEPTED` | `REJECTED` | `IN_PROGRESS` | `COMPLETED` | `RESOLVED`
- **Required Fields**: `title`, `description`, `priority`, `assignedManagerId`, `status`
- **Optional Fields**: `rejectionReason`, `completedAt`
- **Audit Fields**: `createdAt`, `updatedAt`, `completedAt`

---

### 9. Issue (`Issue`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `assignedManagerId` (FK $\rightarrow$ `Manager`), `vendorId` (optional FK $\rightarrow$ `Vendor`)
- **Priority Enum**: `LOW` | `MEDIUM` | `HIGH`
- **Status Enum**: `OPEN` | `ACCEPTED` | `REJECTED` | `IN_PROGRESS` | `RESOLVED`
- **Required Fields**: `title`, `description`, `priority`, `assignedManagerId`, `status`
- **Optional Fields**: `resolutionText`, `resolvedAt`
- **Audit Fields**: `createdAt`, `updatedAt`, `resolvedAt`

---

### 10. Activity (`Activity`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Key**: `managerId` (FK $\rightarrow$ `Manager`)
- **ActivityType Enum**: `VENDOR_ONBOARDED` | `VENDOR_VISIT_INTERESTED` | `VENDOR_VISIT_NOT_INTERESTED` | `TASK_ACCEPTED` | `TASK_COMPLETED` | `HIGH_TASK_RESOLVED` | `ISSUE_RESOLVED`
- **Required Fields**: `managerId`, `activityType`, `entityId`, `entityName`, `timestamp`, `territory`
- **Territory Relationship**: Embedded territory scope snapshot (`stateId`, `districtId`, `divisionId`, `pincodeId`)
- **Audit Fields**: `timestamp`

---

### 11. Report / Exception Report (`Report`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Keys**: `activityId` (FK $\rightarrow$ `Activity`), `managerId` (FK $\rightarrow$ `Manager`), `vendorId` (FK $\rightarrow$ `Vendor`)
- **ReportType Enum**: `TEXT` | `VOICE`
- **Required Fields**: `activityId`, `managerId`, `vendorId`, `reportType`, `submittedAt`
- **Optional Fields**: `textNotes`, `voiceUrl`, `voiceDurationSeconds`
- **Audit Fields**: `submittedAt`

---

### 12. Notification (`AppNotification`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Key**: `targetManagerId` (FK $\rightarrow$ `Manager`)
- **Priority Enum**: `LOW` | `MEDIUM` | `HIGH`
- **Required Fields**: `title`, `body`, `priority`, `targetManagerId`, `isRead`, `createdAt`
- **Optional Fields**: `deepLinkScreen`, `deepLinkParams`
- **Audit Fields**: `createdAt`

---

### 13. Leaderboard Entry (`LeaderboardEntry`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Key**: `managerId` (FK $\rightarrow$ `Manager`)
- **Required Fields**: `managerId`, `managerName`, `role`, `rank`, `score`, `vendorsOnboarded`, `tasksCompleted`, `issuesResolved`, `periodStart`, `periodEnd`
- **Audit Fields**: `updatedAt`

---

### 14. Authentication Session (`AuthSession`)

- **Primary Key**: `id`: string (UUID)
- **Foreign Key**: `managerId` (FK $\rightarrow$ `Manager`)
- **Required Fields**: `tokenHash`, `refreshTokenHash`, `ipAddress`, `userAgent`, `expiresAt`, `createdAt`
- **Audit Fields**: `createdAt`, `lastRevokedAt`
