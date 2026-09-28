# 26. Architectural Decisions Record (ADR)

## 1. Overview

This document records the core architectural decisions established for the **Forge India Connect (FIC) Manager Mobile App** foundation.

---

## 2. Decision Records

### ADR-01: React Native CLI Project Engine

- **Decision**: Use React Native CLI (v0.75+).
- **Rationale**: Expo is explicitly prohibited by product mandate. Genuine React Native CLI structure with native `android/` directory allows low-level Android native module integrations (such as hardware audio recording and background push services).

---

### ADR-02: State Management Architecture

- **Decision**: Lightweight React Context (`AuthContext`) for global UI session state paired with the Repository Pattern for server state.
- **Rationale**: Avoids unnecessary global state boilerplate (such as Redux Toolkit) for initial mobile scope. Feature state remains localized to feature services and custom hooks.

---

### ADR-03: Repository Pattern for API Decoupling

- **Decision**: All data access is mediated through abstract repository interfaces (`IVendorRepository`, `ITaskRepository`, `IIssueRepository`, etc.).
- **Rationale**: Completely isolates UI components from backend networking. Features use mock repositories initially (`MockVendorRepository`, `MockTaskRepository`), allowing immediate backend API replacement by updating the service container registry (`src/services/index.ts`) without editing any UI component.

---

### ADR-04: Navigation & Screen Map Architecture

- **Decision**: React Navigation Native Stack & Custom Drawer Navigator.
- **Rationale**: Provides top-level drawer menu (`Dashboard`, `Managers Directory`, `Reports`, `Vendors`, `Tasks`, `Leaderboard`, `Notifications`, `Profile`, `Settings`, `Logout`) with typed route parameters (`RootStackParamList`, `MainDrawerParamList`). Excludes all admin web features (`Performance`, `Vendor KYC`, `System Admin`, `Generic Daily Report`).

---

### ADR-05: Replaceable Audio & Upload Services

- **Decision**: Abstract service interfaces (`IAudioRecorderService`, `IMediaUploadService`).
- **Rationale**: Allows field exception voice reporting without coupling UI components to specific audio recording hardware plugins or cloud storage SDKs.

---

### ADR-06: Environment & API Client Architecture

- **Decision**: `ApiClient` wrapper around native `fetch` with environment base URL configuration (`src/constants/env.ts`).
- **Rationale**: Enforces authorization header injection, request timeouts, and standard JSON error envelope parsing (`docs/24_API_ERROR_CONTRACT.md`).
