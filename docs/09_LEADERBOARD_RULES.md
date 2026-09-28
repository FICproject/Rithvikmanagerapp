# 09. Leaderboard Specification & Scoring Architecture

## 1. Overview

The Leaderboard incentivizes field performance across managers within their respective territory levels (State, District, Division, Pincode).

---

## 2. Dynamic Metric Tracking

Metrics tracked per manager include:

- `vendorsOnboardedCount`: Total vendors successfully onboarded.
- `tasksCompletedCount`: Total tasks completed.
- `issuesResolvedCount`: Total issues resolved.
- `fieldVisitsCount`: Total field visits performed.

---

## 3. Configurable Backend Scoring Engine Specification

> [!IMPORTANT]
> **CRITICAL ARCHITECTURAL PRINCIPLE**:
> The mobile application **MUST NOT** hardcode a static scoring formula (e.g., $10 \times \text{onboarded} + 5 \times \text{tasks}$).

Scoring rules are computed on the backend API server. The API contract returns calculated `score`, `rank`, and `breakdown` objects.

```json
{
  "managerId": "mgr-101",
  "rank": 3,
  "totalScore": 450,
  "metrics": {
    "vendorsOnboarded": 12,
    "tasksCompleted": 25,
    "issuesResolved": 8,
    "fieldVisits": 30
  },
  "scoreFormulaVersion": "v2.1"
}
```

This allows business administrators to tune point weightings dynamically on the server without requiring mobile app updates.

---

## 4. Leaderboard Audit Breakdown (12 Audit Items)

1. **Entities Involved**: `LeaderboardEntry`, `Manager`, `Activity`.
2. **Valid States**: Active Leaderboard rankings computed for current time window (Weekly / Monthly).
3. **Valid Transitions**: Rank updates upon activity log event processing by backend.
4. **Invalid Transitions**: Client-side score manipulation (blocked; read-only from mobile).
5. **Actor/Role Allowed**: State, District, Division, and Pincode Managers (read-only access within scope).
6. **Territory Restriction**: Leaderboard filtered by manager's geographic scope (State, District, Division, Pincode).
7. **Automatic Activity Generated**: None (Leaderboard is an analytical aggregation of operational activities).
8. **Notification Generated**: Leaderboard rank change alert if configured.
9. **Report Requirement**: None.
10. **Required API Operation**: `GET /api/v1/leaderboard`.
11. **Required Database Fields**: `manager_id`, `rank`, `score`, `vendors_onboarded`, `tasks_completed`, `issues_resolved`, `period_start`, `period_end`.
12. **Audit Information**: Calculation timestamp, score formula version identifier.
