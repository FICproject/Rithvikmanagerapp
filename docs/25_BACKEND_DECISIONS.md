# 25. Backend Decision Register

## 1. Overview

This document maintains the formal register of finalized architectural decisions vs items marked as **TBD / REQUIRES BACKEND DECISION**.

---

## 2. DECIDED Business & Architecture Rules

1. **Manager Hierarchy Structure**:
   - 4 Tiers: State $\rightarrow$ District $\rightarrow$ Division $\rightarrow$ Pincode.
   - Roles: `state_manager`, `district_manager`, `division_manager`, `pincode_manager`.
   - Fixed division count: 4 Divisions per State (North, South, East, West).
   - Fixed staffing: 2 Managers per Division ($4 \times 2 = 8$ Division Managers per State).
2. **Dynamic Territory Rule**:
   - District and Pincode counts remain 100% data-driven and configurable from database.
3. **Security Boundary Rule**:
   - Territory scope access MUST be enforced by backend API middleware (`403 Forbidden`).
   - Mobile UI filtering is strictly for user experience and NEVER treated as the security boundary.
4. **Task Priority Rules**:
   - Low & Medium: Accept/Reject $\rightarrow$ In Progress $\rightarrow$ Completed.
   - High Priority: Mandatory resolution by manager. Accept/Reject options omitted. Reject transition returns `422 Unprocessable Entity`.
5. **Issue Priority Rules**:
   - Low & Medium: Accept/Reject $\rightarrow$ In Progress $\rightarrow$ Resolved.
   - High Priority: Mandatory resolution by manager. Reject transition returns `422 Unprocessable Entity`.
6. **Activity & Reporting Rules**:
   - Routine operational actions automatically generate activity logs (`VENDOR_ONBOARDED`, `VENDOR_VISIT_INTERESTED`, `VENDOR_VISIT_NOT_INTERESTED`, `TASK_ACCEPTED`, `TASK_COMPLETED`, `HIGH_TASK_RESOLVED`, `ISSUE_RESOLVED`).
   - Zero generic daily report submission forms exist in the system.
   - Mandatory Exception Report (`TEXT` or `VOICE`) required ONLY when vendor visit result is `Not Interested`.
7. **Read-Only Managers Directory**:
   - Mobile app provides read-only access. Zero Add/Edit/Delete manager screens or API endpoints.
8. **Configurable Leaderboard Scoring**:
   - Leaderboard scoring formula is calculated server-side; mobile app displays score, rank, and metrics returned by backend API.

---

## 3. TBD / REQUIRES BACKEND DECISION Register

| # | Topic / Area | Description | Current Status / Options |
| :--- | :--- | :--- | :--- |
| **1** | **Database Technology** | Database engine selection for persistent server store. | TBD (PostgreSQL vs MySQL vs MongoDB/Document store). Schema designed as neutral relational ERD. |
| **2** | **Audio Storage Gateway** | Storage location and upload pattern for voice exception reports. | TBD (S3 presigned URLs vs Direct multipart proxy vs Cloud Storage). Replaceable interface used. |
| **3** | **Push Notification Gateway** | Credentials and provider for background push notifications. | TBD (Firebase Cloud Messaging vs APNs vs OneSignal). Decoupled interface used. |
| **4** | **JWT Refresh & Revocation** | Token TTL, refresh token rotation, and multi-device revocation policy. | TBD / REQUIRES BACKEND DECISION. |
| **5** | **Leaderboard Sync Strategy** | Frequency and processing trigger for leaderboard recalculation. | TBD (Real-time event stream vs Scheduled batch job). |
| **6** | **File Upload Size Limits** | Max file size constraints for shop photos and audio files. | TBD (Proposed: Image max 5MB, Audio max 10MB). |
| **7** | **Max Audio Recording Time** | Maximum duration ceiling for voice note exception reports. | TBD (Proposed: 180 seconds). |
| **8** | **Document Storage Provider** | Cloud media bucket vendor and retention policy. | TBD / REQUIRES BACKEND DECISION. |
| **9** | **Pagination Implementation** | Standardized pagination mechanism across list APIs. | Decided: Offset-based (`page`, `limit`) with standard metadata payload envelope. |
