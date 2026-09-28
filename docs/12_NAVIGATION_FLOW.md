# 12. Navigation Flow & Authentication Guard Architecture

## 1. Overall Navigation Tree

```mermaid
graph TD
    AppLaunch([App Launch]) --> CheckAuth{Token Valid?}
    
    CheckAuth -->|NO| AuthStack[Auth Navigator]
    AuthStack --> LoginScreen[Login Screen]
    LoginScreen -->|Authenticate| StoreToken[Store Secure Token]
    StoreToken --> MainDrawer[Main Drawer Navigator]
    
    CheckAuth -->|YES| MainDrawer
    
    MainDrawer --> Dash[Dashboard Screen]
    MainDrawer --> Dir[Managers Directory Screen]
    MainDrawer --> Rep[Reports Screen]
    MainDrawer --> Ven[Vendors Stack]
    MainDrawer --> Tsk[Tasks Stack]
    MainDrawer --> Lead[Leaderboard Screen]
    MainDrawer --> Notif[Notifications Screen]
    MainDrawer --> Prof[Profile Screen]
    MainDrawer --> Set[Settings Screen]
    MainDrawer --> Logout[Logout Trigger]
    
    Logout --> ClearSession[Clear Tokens & Reset State]
    ClearSession --> AuthStack
    
    Ven --> VenDetail[Vendor Detail Screen]
    Ven --> AddVen[Add Vendor Screen]
    Ven --> VenVisit[Vendor Visit Screen]
    VenVisit -->|Not Interested| ReportForm[Exception Report Form Screen]
```

---

## 2. Authentication Guard Rule

- **Unauthenticated State**: Only `AuthStack` screens (`LoginScreen`) are mounted.
- **Authenticated State**: `AuthStack` is unmounted and replaced by `MainDrawerNavigator`.
- **Session Expiry (401 Unauthorized)**: Automatic token refresh attempted; if failed, state automatically switches back to `AuthStack` and clears stored tokens.
