# 21. Backend Integration Plan & Repository Abstraction

## 1. Repository Pattern Strategy

The application UI and features depend strictly on abstract repository interfaces rather than concrete HTTP clients or mock objects.

```mermaid
graph TD
    UI[Feature Screens / Hooks] --> Service[Feature Service Layer]
    Service --> RepoInterface[IRepository Interface]
    
    RepoInterface -. Phase 1 .-> MockRepo[Mock Implementation]
    RepoInterface -. Phase 2 .-> RestApiRepo[REST API Implementation]
    
    RestApiRepo --> HttpClient[Axios / Fetch Base API Client]
```

---

## 2. Mock vs REST API Swap Architecture

To switch the app from mock data to live REST API endpoints:

1. Implement the API repository class (e.g., `ApiVendorRepository implements IVendorRepository`).
2. Update Dependency Injection / Service Locator registry in `src/services/index.ts`.
3. **Zero changes are required in any UI component or feature screen**.
