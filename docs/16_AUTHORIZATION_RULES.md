# 16. Multi-Tenant Authorization & Security Scope Architecture

## 1. Backend Security Boundary Directive

> [!CAUTION]
> **NON-NEGOTIABLE SECURITY MANDATE**:
> The mobile client user interface is **NEVER** treated as a security boundary.
> All territory filters, role permissions, data access controls, and state transitions **MUST BE ENFORCED BY BACKEND API MIDDLEWARE**.

---

## 2. Granular Operations Authorization Matrix

| Domain / Resource | Operation Type | State Manager | District Manager | Division Manager | Pincode Manager |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Managers Directory** | READ | ✅ (All in State) | ✅ (District Scope) | ✅ (Division Scope) | ✅ (Pincode Scope) |
| | CREATE / UPDATE / DELETE | ❌ Banned (Web Admin Only) | ❌ Banned | ❌ Banned | ❌ Banned |
| **Vendors** | READ | ✅ (State Scope) | ✅ (District Scope) | ✅ (Division Scope) | ✅ (Pincode Scope) |
| | CREATE (Onboard) | ✅ | ✅ | ✅ | ✅ |
| | UPDATE | ✅ | ✅ | ✅ | ✅ |
| | DELETE | ❌ Banned | ❌ Banned | ❌ Banned | ❌ Banned |
| **Vendor Visit** | CREATE (Record Visit) | ✅ | ✅ | ✅ | ✅ |
| **Tasks** | READ | ✅ | ✅ | ✅ | ✅ |
| | STATE TRANSITION (Low/Med Accept/Reject) | ✅ | ✅ | ✅ | ✅ |
| | STATE TRANSITION (High Resolve) | ✅ | ✅ | ✅ | ✅ |
| | STATE TRANSITION (High Reject) | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** |
| **Issues** | READ | ✅ | ✅ | ✅ | ✅ |
| | STATE TRANSITION (Low/Med Accept/Reject) | ✅ | ✅ | ✅ | ✅ |
| | STATE TRANSITION (High Resolve) | ✅ | ✅ | ✅ | ✅ |
| | STATE TRANSITION (High Reject) | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** |
| **Activities** | READ | ✅ | ✅ | ✅ | ✅ |
| | CREATE (Auto-Activity) | ✅ System Triggers | ✅ System Triggers | ✅ System Triggers | ✅ System Triggers |
| **Reports** | READ | ✅ | ✅ | ✅ | ✅ |
| | CREATE (Exception Report) | ✅ | ✅ | ✅ | ✅ |
| | CREATE (Generic Daily Report) | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** |
| **Leaderboard** | READ | ✅ | ✅ | ✅ | ✅ |
| | UPDATE (Recalculate Score) | ❌ Server Engine Only | ❌ Server Engine Only | ❌ Server Engine Only | ❌ Server Engine Only |

---

## 3. JWT Scope Injection Standard

Upon authentication, the JWT issued by the server includes claims declaring the manager's exact role and geographic scope:

```json
{
  "sub": "mgr-101",
  "role": "DIVISION_MANAGER",
  "stateId": "st-mp-01",
  "districtId": "dt-indore-02",
  "divisionId": "div-north-01",
  "pincodeId": null,
  "iat": 1727000000,
  "exp": 1727086400
}
```

If an API request targets an entity whose territory scope does not match the JWT claims, backend middleware aborts execution and returns `403 TERRITORY_SCOPE_VIOLATION`.
