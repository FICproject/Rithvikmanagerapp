# 20. Comprehensive Test Cases Specification

## 1. Unit Test Matrix

| ID | Module | Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `TC-UT-01` | `TaskRules` | Attempting to reject High-Priority Task | Throws `InvalidStateTransitionError` / returns 422 |
| `TC-UT-02` | `IssueRules` | Accepting Low/Medium Priority Issue | Updates state to `IN_PROGRESS` |
| `TC-UT-03` | `IssueRules` | Attempting to reject High-Priority Issue | Throws `InvalidStateTransitionError` / returns 422 |
| `TC-UT-04` | `VendorRules` | Onboarding vendor with invalid phone | Form validation error returned |
| `TC-UT-05` | `ReportRules` | Vendor visit "Not Interested" without report | Returns `REPORT_REQUIRED` flag true; blocks submit |
| `TC-UT-06` | `Hierarchy` | Division manager count per state verification | 4 divisions $\times$ 2 managers = 8 division managers per State |

---

## 2. Integration & Permission Test Scenarios

| ID | Component | Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- |
| `TC-INT-01` | `AuthRepository` | Login with valid credentials | Token saved in encrypted storage; drawer mounted |
| `TC-INT-02` | `ManagersDirectory` | Division Manager opening directory | Displays only managers within user's State/Division scope |
| `TC-INT-03` | `ManagersDirectory` | Check mobile action menu | Zero Add/Edit/Delete manager options present |
| `TC-INT-04` | `ExceptionReport` | Voice recording upload | Replaceable audio service uploads file and returns URL |
| `TC-INT-05` | `ApiGateway` | Request entity outside JWT scope | Gateway rejects request with `403 Forbidden` |
| `TC-INT-06` | `DailyReport` | Check for generic daily report form route | Route does not exist (0 endpoints found) |
