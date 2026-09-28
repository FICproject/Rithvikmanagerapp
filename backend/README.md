# FIC Manager Backend Service

Real-time Push Notification and Operational Event Dispatch Server powered by Node.js / Express and Firebase Cloud Messaging (FCM).

---

## 📁 Files & Endpoints

- `server.js`: Real-time FCM Notification dispatch server. Handles manager token registration, role/territory hierarchy scoping (State, District, Division, Pincode), lock-screen credential sanitization, and notification inbox persistence.

### API Endpoints:
- `POST /api/v1/notifications/register-token`: Registers/updates manager FCM device token.
- `POST /api/v1/notifications/unregister-token`: Deactivates FCM device token on logout.
- `POST /api/v1/notifications/send`: Dispatches real-time territory-scoped push notifications.
- `GET /api/v1/notifications`: Returns manager notification inbox items.
- `GET /api/v1/notifications/unread-count`: Returns manager unread count.
- `PATCH /api/v1/notifications/:id/read`: Marks notification as read.
- `PATCH /api/v1/notifications/read-all`: Marks all manager notifications as read.

---

## 🚀 Execution

To start the backend server:

```bash
node server.js
```
