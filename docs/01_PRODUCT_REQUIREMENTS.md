# 01. Product Requirements Specification (PRS)

## 1. Executive Summary & Purpose

The **Forge India Connect (FIC) Manager Mobile App** is an enterprise-grade mobile application designed for field operations, vendor management, task execution, issue resolution, activity tracking, exception reporting, and performance leaderboard participation across multi-tiered geographic territories in India.

The mobile app serves as the primary operational terminal for field managers (State, District, Division, and Pincode levels).

---

## 2. Technology Stack & Non-Negotiable Constraints

- **Framework**: React Native CLI (v0.75+)
- **Language**: TypeScript (Strict mode enabled)
- **Target Platform**: Android-first (optimizations and layout targeting Android API levels 24 to 34)
- **Navigation**: React Navigation (Drawer + Native Stack)
- **State Architecture**: Feature-scoped stores / Context + Repository Pattern
- **API Readiness**: REST API-ready abstraction layer with mock repository initial state
- **Security**: Secure storage for JWT / OAuth2 auth tokens, strict geographic scope enforcement
- **Forbidden**: Expo (Explicitly banned by product mandate)

---

## 3. Scope Boundaries

### In Scope for Mobile App

- User Authentication (Login, Refresh Token, Logout)
- Executive Dashboard (Territory summary, active tasks, vendor count, open issues, recent activity feed)
- Vendor Management (Directory, Filter/Search, Onboarding, Vendor Visit Workflow)
- Task Management (Low, Medium, and mandatory High Priority tasks)
- Issue Resolution (Low, Medium, and mandatory High Priority issues)
- Activity Tracking & Auto-Logging (Zero-touch routine activity logging)
- Exception Reporting (Text & Voice report generation for "Not Interested" vendor visits)
- Read-Only Managers Directory (Filtered strictly by manager's assigned geographic scope)
- Leaderboard (Dynamic metric aggregation powered by configurable backend scoring)
- Operational Notifications (Push & In-App notification feed)
- Manager Profile & System Settings

### Explicitly Excluded from Mobile Scope

- Manager Account Creation / Add / Edit / Delete Manager (Admin web portal function)
- Vendor KYC Approval / Credit Scoring (Admin web portal function)
- Generic Daily Report Form (Replaced entirely by event-driven auto-activities and targeted exception reports)
- Admin Management Portal & System Audit Configuration

---

## 4. Key Non-Functional Requirements (NFRs)

- **Performance**: Time-to-interactive < 1.5 seconds on mid-tier Android devices (4GB RAM).
- **Offline Readiness**: Local state queueing for field visits and report recording when connection drops.
- **Security**: Zero plain-text local storage of tokens or PII. Backend-enforced territory boundaries.
- **Reliability**: Graceful error handling for audio recording failure or network disconnects.
