# 02. Business Workflow Specification

## 1. Executive Operational Overview

The FIC Manager App standardizes field operations across multi-tiered geographic territories in India. Operational tasks, vendor visits, task completions, and issue resolutions automatically generate immutable activity log records.

---

## 2. Event-Driven Operational Cycle Diagram

```mermaid
graph TD
    Start([Manager Logged In]) --> SelectAction{Action Selected}
    SelectAction -->|Vendor Visit| VisitFlow[Vendor Visit Workflow]
    SelectAction -->|Task Assigned| TaskFlow[Task Workflow]
    SelectAction -->|Issue Raised| IssueFlow[Issue Workflow]
    
    VisitFlow --> VisitResult{Vendor Interested?}
    VisitResult -->|YES| Onboard[Onboard Vendor]
    VisitResult -->|NO| ExceptionReport[Mandatory Exception Report: Text/Voice]
    
    Onboard --> AutoAct1[Auto-Activity Generated: Vendor Onboarded]
    ExceptionReport --> AutoAct2[Auto-Activity Generated: Visit + Manual Report Attached]
    
    TaskFlow --> TaskDone[Task Completed / Resolved]
    TaskDone --> AutoAct3[Auto-Activity Generated: Task Completed / High Task Resolved]
    
    IssueFlow --> IssueDone[Issue Resolved]
    IssueDone --> AutoAct4[Auto-Activity Generated: Issue Resolved]
    
    AutoAct1 --> Feed[Activity History & Reports Feed]
    AutoAct2 --> Feed
    AutoAct3 --> Feed
    AutoAct4 --> Feed
```

---

## 3. Core Operational Directives

1. **Zero Generic Daily Reports**: Routine field actions (vendor onboarding, visits, task acceptances/completions, issue resolutions) generate **automatic activity logs**. No manual end-of-day daily report form exists in the application.
2. **Targeted Exception Reporting**: Manual reporting is strictly enforced **ONLY** when a non-standard outcome occurs—specifically when a visited vendor declines interest (`Not Interested`).
3. **Audit Integrity**: Every activity record captures exact manager ID, timestamp, entity ID, territory scope context (`stateId`, `districtId`, `divisionId`, `pincodeId`), and system trace data.
