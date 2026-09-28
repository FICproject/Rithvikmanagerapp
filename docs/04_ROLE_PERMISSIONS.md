# 04. Role & Permissions Matrix

## 1. Permission Matrix Table

| Feature / Action | State Manager | District Manager | Division Manager | Pincode Manager |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard** (Own Scope) | ✅ | ✅ | ✅ | ✅ |
| **View Vendors** (Own Scope) | ✅ | ✅ | ✅ | ✅ |
| **Onboard Vendor** | ✅ | ✅ | ✅ | ✅ |
| **Perform Vendor Visit** | ✅ | ✅ | ✅ | ✅ |
| **Submit Exception Report** | ✅ | ✅ | ✅ | ✅ |
| **View Assigned Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Accept / Reject Tasks** (Low/Med) | ✅ | ✅ | ✅ | ✅ |
| **Resolve Tasks** (Low/Med/High) | ✅ | ✅ | ✅ | ✅ |
| **View Issues** (Own Scope) | ✅ | ✅ | ✅ | ✅ |
| **Resolve High-Priority Issues** | ✅ | ✅ | ✅ | ✅ |
| **View Managers Directory** (Read-Only) | ✅ (All in State) | ✅ (District scope) | ✅ (Division scope) | ✅ (Pincode scope) |
| **Add Manager** | ❌ Banned | ❌ Banned | ❌ Banned | ❌ Banned |
| **Edit Manager** | ❌ Banned | ❌ Banned | ❌ Banned | ❌ Banned |
| **Delete Manager** | ❌ Banned | ❌ Banned | ❌ Banned | ❌ Banned |
| **View Reports & Activity History** | ✅ | ✅ | ✅ | ✅ |
| **View Leaderboard** | ✅ | ✅ | ✅ | ✅ |

---

## 2. Read-Only Directory Constraint

The mobile application enforces **Read-Only** access for the Managers Directory.

- **NO** Add Manager screen or API call from mobile.
- **NO** Edit Manager screen or API call from mobile.
- **NO** Delete Manager action or API call from mobile.

All manager account provisioning, role updates, and territory re-assignments occur exclusively on the Web Admin Portal.

---

## 3. Security Boundary Directive

> [!CAUTION]
> **BACKEND AUTHORIZATION MANDATE**:
> Role permissions listed above MUST be validated by backend middleware using the user's JWT token payload.
> The mobile client UI filtering is strictly for user experience and must never be treated as the security boundary.
