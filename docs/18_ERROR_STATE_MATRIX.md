# 18. Error State Handling Matrix

## 1. Client & Server Error Response Standard

| HTTP Code | Error Code Enum | Error Cause | User UI Action | Recovery Flow |
| :--- | :--- | :--- | :--- | :--- |
| **400** | `BAD_REQUEST` | Malformed JSON payload | Toast: "Invalid request payload." | Re-validate form input payload. |
| **401** | `TOKEN_EXPIRED` | Expired JWT token | Toast: "Session expired." | Redirect to `LoginScreen`, clear local storage tokens. |
| **403** | `TERRITORY_SCOPE_VIOLATION` | Accessing entity outside territory | Banner: "Access denied." | Block screen transition, maintain existing screen state. |
| **404** | `RESOURCE_NOT_FOUND` | Vendor or task deleted | Card Placeholder: "Resource no longer available." | Refresh current list feed. |
| **422** | `INVALID_STATE_TRANSITION` | Attempting to reject High Priority task/issue | Dialog: "High priority items cannot be rejected." | Reset action toggle, display mandatory resolve UI. |
| **422** | `REPORT_REQUIRED` | Missing report on Not Interested visit | Dialog: "Exception report required." | Prompt user to choose Text or Voice exception report. |
| **500** | `INTERNAL_SERVER_ERROR` | Backend database failure | Error Component: "Service unavailable." | Retry button with exponential backoff. |

---

## 2. Audio & Media Failure Recovery

- **Audio Permission Denied**: Display dialog explaining microphone permission requirement with direct button to system settings.
- **Media Upload Fail**: Keep local audio recording intact, show warning card on the activity entry with a manual "Tap to Retry Upload" button.
