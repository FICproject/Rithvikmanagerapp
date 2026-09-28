# 24. Standardized API Error Response Contract

## 1. Overview

All API responses originating from the backend gateway use a standardized JSON error envelope when a non-2xx status code is returned.

---

## 2. Standard JSON Error Envelope

```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "High priority tasks are mandatory and cannot be rejected.",
    "timestamp": "2026-09-22T14:53:00Z",
    "requestId": "req-889123-ab71",
    "fieldErrors": [
      {
        "field": "status",
        "message": "Status REJECTED is invalid for priority HIGH."
      }
    ]
  }
}
```

---

## 3. Error Code Catalog

| HTTP Status | Error Code Enum | Description |
| :--- | :--- | :--- |
| **400 Bad Request** | `BAD_REQUEST` | Malformed JSON payload or missing required query parameter. |
| **401 Unauthorized** | `INVALID_CREDENTIALS` | Incorrect username/password on login. |
| **401 Unauthorized** | `TOKEN_EXPIRED` | JWT access token expired or invalid signature. |
| **403 Forbidden** | `TERRITORY_SCOPE_VIOLATION` | Requesting manager lacks geographic scope access for target entity. |
| **403 Forbidden** | `ACTION_NOT_PERMITTED` | User role lacks permission for operation (e.g. attempting manager edit). |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | Target vendor, task, issue, or activity ID does not exist. |
| **409 Conflict** | `DUPLICATE_ENTITY` | Vendor phone number or email already registered. |
| **422 Unprocessable Entity** | `INVALID_STATE_TRANSITION` | Attempting forbidden transition (e.g., rejecting High Priority task). |
| **422 Unprocessable Entity** | `REPORT_REQUIRED` | Submitting "Not Interested" vendor visit without text/voice report payload. |
| **429 Too Many Requests** | `RATE_LIMIT_EXCEEDED` | Request rate threshold exceeded. |
| **500 Internal Server Error** | `INTERNAL_SERVER_ERROR` | Unhandled backend exception or database failure. |
