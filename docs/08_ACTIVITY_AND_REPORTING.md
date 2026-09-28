# 08. Activity System & Reporting Specification

## 1. Zero Generic Daily Report Mandate

Managers **DO NOT** manually fill out end-of-day daily report forms for routine field operations.

Instead:

- Every completed action automatically writes an entry to the `Activity` ledger.
- The `Reports` screen displays the manager's aggregated activity history feed and handles targeted exception reports.

---

## 2. Activity Types & Auto-Generation Rules

| Triggering Operational Action | Automatic Activity Type | Manual Report Required? |
| :--- | :--- | :---: |
| **Vendor Onboarded** | `VENDOR_ONBOARDED` | ❌ None |
| **Vendor Visit (Interested)** | `VENDOR_VISIT_INTERESTED` | ❌ None |
| **Vendor Visit (Not Interested)** | `VENDOR_VISIT_NOT_INTERESTED` | ✅ **Text or Voice Exception Report Required** |
| **Task Accepted** | `TASK_ACCEPTED` | ❌ None |
| **Task Completed** | `TASK_COMPLETED` | ❌ None |
| **High Priority Task Resolved** | `HIGH_TASK_RESOLVED` | ❌ None |
| **Issue Resolved** | `ISSUE_RESOLVED` | ❌ None |

---

## 3. Exception Report Types & Replaceable Audio Service

When a vendor is marked **Not Interested**:

1. **Text Exception Report**: User types notes into text field (minimum 10 characters).
2. **Voice Exception Report**: User records audio note via mobile microphone.

### Replaceable Audio Service Interface Design

The audio recorder and audio upload components are designed as decoupled TypeScript service interfaces:

- `IAudioRecorderService`: Standard methods `startRecording()`, `stopRecording()`, `cancelRecording()`.
- `IMediaUploadService`: Standard methods `uploadAudioReport(filePath)`.

This decoupling allows swapping the underlying recording or upload engines without altering any feature code or UI components.

---

## 4. Activity & Report Audit Breakdown (12 Audit Items)

1. **Entities Involved**: `Activity`, `Report`, `Manager`, `Vendor` / `Task` / `Issue`.
2. **Valid States**: Activity logged (`CREATED`); Report attached (`SUBMITTED`).
3. **Valid Transitions**: Operational action completed $\rightarrow$ Auto Activity logged $\rightarrow$ Exception report attached if required.
4. **Invalid Transitions**: Submitting a generic daily report form (Feature explicitly excluded; zero API route).
5. **Actor/Role Allowed**: Authenticated State, District, Division, or Pincode Manager.
6. **Territory Restriction**: Activity territory snapshot (`state_id`, `district_id`, `division_id`, `pincode_id`) must match action location.
7. **Automatic Activity Generated**: Generated for all 7 standard operational actions listed above.
8. **Notification Generated**: Alert sent if report required or high-priority activity logged.
9. **Report Requirement**:
   - Normal work: **Zero manual report**.
   - Not Interested Visit: **Mandatory Exception Report** (Text or Voice).
10. **Required API Operation**: `GET /api/v1/reports/history` & `POST /api/v1/reports/exception`.
11. **Required Database Fields**:
    - `activities`: `id`, `manager_id`, `activity_type`, `entity_id`, `entity_name`, `timestamp`, `state_id`, `district_id`, `division_id`, `pincode_id`.
    - `reports`: `id`, `activity_id`, `manager_id`, `vendor_id`, `report_type`, `text_notes`, `voice_url`, `voice_duration_seconds`, `submitted_at`.
12. **Audit Information**: Manager ID, timestamp, entity ID, location scope snapshot, audio metadata.
