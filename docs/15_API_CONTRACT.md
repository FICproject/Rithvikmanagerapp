# 15. REST API Contract Proposal

> [!IMPORTANT]
> **STATUS**: PROPOSED BACKEND CONTRACT
> This document specifies the proposed HTTP REST API contract for client-server integration. These endpoints are non-existent until implemented by the backend engineering team.

---

## 1. Standard Request & Response Payload Conventions

### Pagination Envelope

All list endpoints support pagination using offset parameters: `page` (default `1`) and `limit` (default `20`, max `100`).

```json
{
  "data": [],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 2. API Groups Specification

### GROUP 1: AUTH

#### `POST /api/v1/auth/login`

- **Auth Required**: False
- **Role Required**: None
- **Territory Scope**: N/A
- **Request Body**:

  ```json
  { "username": "manager@forgeindia.in", "password": "Password123" }
  ```

- **Response 200 OK**:

  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "refreshToken": "d98f7a6b5c...",
    "expiresIn": 86400,
    "manager": {
      "id": "mgr-101",
      "name": "Rajesh Kumar",
      "role": "DISTRICT_MANAGER",
      "stateId": "st-mp-01",
      "districtId": "dt-indore-01"
    }
  }
  ```

- **Error Responses**: `400 BAD_REQUEST`, `401 INVALID_CREDENTIALS`.

#### `POST /api/v1/auth/logout`

- **Auth Required**: True (Bearer Token)
- **Role Required**: Any
- **Response 200 OK**: `{ "message": "Session invalidated successfully." }`

---

### GROUP 2: MANAGERS (Read-Only)

#### `GET /api/v1/managers/directory`

- **Auth Required**: True
- **Role Required**: State, District, Division, Pincode Manager
- **Territory Scope Requirement**: Scope-enforced. Returns managers within user's assigned state/district/division.
- **Query Params**: `page=1&limit=20&search=rajesh`
- **Response 200 OK**: Paginated list of manager objects.
- **Error Responses**: `401 TOKEN_EXPIRED`, `403 TERRITORY_SCOPE_VIOLATION`.

---

### GROUP 3: TERRITORIES

#### `GET /api/v1/territories/hierarchy`

- **Auth Required**: True
- **Role Required**: Any Manager
- **Territory Scope Requirement**: Scope-enforced subtree read.
- **Response 200 OK**: Tree structure of accessible State, District, Division, Pincode objects.

---

### GROUP 4: VENDORS

#### `GET /api/v1/vendors`

- **Auth Required**: True
- **Role Required**: Any Manager
- **Territory Scope Requirement**: Filters vendors by `state_id`, `district_id`, `division_id`, `pincode_id`.
- **Query Params**: `page=1&limit=20&search=fresh&status=ONBOARDED`
- **Response 200 OK**: Paginated list of vendors.

#### `POST /api/v1/vendors`

- **Auth Required**: True
- **Role Required**: Any Manager
- **Territory Scope Requirement**: Onboarding location must match manager territory scope claims.
- **Request Body**: Vendor onboarding payload.
- **Response 201 Created**: Created Vendor object. Auto-activity generated (`VENDOR_ONBOARDED`).

---

### GROUP 5: VENDOR VISITS

#### `POST /api/v1/vendors/:id/visits`

- **Auth Required**: True
- **Role Required**: Any Manager
- **Territory Scope Requirement**: Vendor must fall within manager scope.
- **Request Body**:

  ```json
  {
    "interested": false,
    "notes": "Vendor declined onboarding due to existing distributor contract."
  }
  ```

- **Response 200 OK**:

  ```json
  {
    "visitId": "vis-901",
    "activityId": "act-771",
    "reportRequired": true
  }
  ```

- **Error Responses**: `403 TERRITORY_SCOPE_VIOLATION`, `404 RESOURCE_NOT_FOUND`.

---

### GROUP 6: TASKS

#### `GET /api/v1/tasks`

- **Auth Required**: True
- **Query Params**: `page=1&limit=20&priority=HIGH&status=IN_PROGRESS`
- **Response 200 OK**: Paginated task list.

#### `PATCH /api/v1/tasks/:id/status`

- **Auth Required**: True
- **Role Required**: Assigned Manager
- **Request Body**:

  ```json
  {
    "status": "COMPLETED", // Or ACCEPTED, REJECTED, RESOLVED
    "rejectionReason": ""
  }
  ```

- **Response 200 OK**: Updated task object. Auto-activity generated (`TASK_COMPLETED` or `HIGH_TASK_RESOLVED`).
- **Error Responses**: `422 INVALID_STATE_TRANSITION` (if attempting `REJECT` on High Priority task).

---

### GROUP 7: ISSUES

#### `GET /api/v1/issues`

- **Auth Required**: True
- **Response 200 OK**: Paginated issue list.

#### `PATCH /api/v1/issues/:id/resolve`

- **Auth Required**: True
- **Role Required**: Assigned Manager
- **Request Body**: `{ "resolutionText": "Payment invoice discrepancy resolved." }`
- **Response 200 OK**: Updated issue object. Auto-activity generated (`ISSUE_RESOLVED`).

---

### GROUP 8: ACTIVITIES

#### `GET /api/v1/activities/feed`

- **Auth Required**: True
- **Query Params**: `page=1&limit=20`
- **Response 200 OK**: Paginated operational activity history feed.

---

### GROUP 9: REPORTS

#### `POST /api/v1/reports/exception`

- **Auth Required**: True
- **Role Required**: Visiting Manager
- **Request Body** (Multipart / Form Data):
  - `activityId`: "act-771"
  - `vendorId`: "v-201"
  - `reportType`: "VOICE" | "TEXT"
  - `textNotes`: "..."
  - `audioFile`: (binary buffer if VOICE)
- **Response 201 Created**: Created Report object.
- **Error Responses**: `422 REPORT_REQUIRED` (if payload empty).

#### `GET /api/v1/reports/history`

- **Auth Required**: True
- **Response 200 OK**: Paginated report history feed.

---

### GROUP 10: LEADERBOARD

#### `GET /api/v1/leaderboard`

- **Auth Required**: True
- **Query Params**: `period=monthly`
- **Response 200 OK**:

  ```json
  {
    "userRank": 3,
    "totalScore": 450,
    "rankings": [
      { "rank": 1, "managerName": "Anit Sharma", "score": 820 }
    ]
  }
  ```

---

### GROUP 11: NOTIFICATIONS

#### `GET /api/v1/notifications`

- **Auth Required**: True
- **Response 200 OK**: Paginated notifications list.

---

### GROUP 12: PROFILE

#### `GET /api/v1/profile`

- **Auth Required**: True
- **Response 200 OK**: Authenticated manager profile & scope details.
