# 17. Form & Data Validation Rules

## 1. Vendor Onboarding Form Validation Rules

| Field Name | Validation Rule | Error Message |
| :--- | :--- | :--- |
| `vendorName` | Required, Min 3 chars, Alphabetic + spaces | "Please enter a valid contact person name." |
| `phone` | Required, Exactly 10 digits, Regex `^[6-9]\d{9}$` | "Enter a valid 10-digit Indian phone number." |
| `email` | Optional, Valid RFC 5322 format | "Enter a valid email address." |
| `businessName` | Required, Min 2 chars | "Business name is required." |
| `category` | Required, Must match Enum | "Select a business category." |
| `businessType` | Required, Non-empty string | "Select a business type." |
| `address` | Required, Min 5 chars | "Enter a complete street address." |
| `stateId` | Required, Must match user scope | "State assignment is required." |
| `districtId` | Required, Valid district ID | "District is required." |
| `divisionId` | Required, Valid division ID | "Division is required." |
| `pincodeId` | Required, 6 digits | "Enter a valid 6-digit Indian Pincode." |

---

## 2. Exception Report Form Validation Rules

- **Text Exception Report**: `textNotes` mandatory if report type is `TEXT`. Minimum length 10 characters.
- **Voice Exception Report**: `voiceUrl` or audio file buffer mandatory if report type is `VOICE`. Minimum recording duration 3 seconds, maximum duration 180 seconds.

---

## 3. State Transition Validation Rules

- **High Priority Task Rejection**: Setting `status = REJECTED` on task with `priority = HIGH` $\rightarrow$ Throws `422 INVALID_STATE_TRANSITION`.
- **High Priority Issue Rejection**: Setting `status = REJECTED` on issue with `priority = HIGH` $\rightarrow$ Throws `422 INVALID_STATE_TRANSITION`.
- **Not Interested Visit Without Report**: Setting vendor visit `interested = false` without submitting report $\rightarrow$ Throws `422 REPORT_REQUIRED`.
