# DeveloperNetwork — Complete API Reference

> **Base URL**: `http://localhost:8080`
> **Auth**: JWT stored as an **HttpOnly cookie** named `jwt` (set automatically by the server on login/register/OAuth). No `Authorization` header needed — the cookie is sent automatically by the browser.
> **Content-Type**: `application/json` unless stated otherwise (multipart for profile update).

---

## Authentication

> [!IMPORTANT]
> All endpoints **except** those under `/api/v1/auth/**`, `/ws/**`, `/ws-native`, `/oauth2/**`, and `/login/oauth2/**` require the user to be authenticated (cookie must be present).

---

### 1. Register

**POST** `/api/v1/auth/register`

Creates a new user account and sets the JWT cookie.

#### Request Body (`application/json`)

```json
{
  "firstName": "string",   // required, 2–50 chars
  "lastName": "string",    // required, 1–50 chars
  "email": "string",       // required, valid email, max 100 chars
  "password": "string"     // required, 8–100 chars
}
```

#### Response `200 OK`

Sets `Set-Cookie: jwt=<token>; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`

```json
{
  "status": 200,
  "message": "string",
  "token": "string"
}
```

#### Error Responses

| HTTP | Trigger | Body |
|------|---------|------|
| `400` | Validation failure | `ErrorResponse` with `validationErrors` map |
| `409` | Email already registered | `ErrorResponse` with `message` |

---

### 2. Login (Authenticate)

**POST** `/api/v1/auth/authenticate`

Authenticates an existing user and sets the JWT cookie.

#### Request Body (`application/json`)

```json
{
  "email": "string",       // required, valid email, max 100 chars
  "password": "string"     // required, 8–100 chars
}
```

#### Response `200 OK`

Sets `Set-Cookie: jwt=<token>; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`

```json
{
  "status": 200,
  "message": "string",
  "token": "string"
}
```

#### Error Responses

| HTTP | Trigger | Body |
|------|---------|------|
| `400` | Validation failure | `ErrorResponse` with `validationErrors` map |
| `401` | Wrong credentials | `ErrorResponse` with `message: "Bad credentials"` |

---

### 3. GitHub OAuth2 Login

**GET** `/oauth2/authorization/github`

Redirects the user to GitHub for OAuth2 authorization. No request body needed — just navigate the browser to this URL.

**Flow:**
1. Browser → `GET /oauth2/authorization/github` → GitHub consent page
2. GitHub → `GET /login/oauth2/code/github?code=...` (handled internally)
3. Server sets JWT cookie and **redirects** the browser to `http://localhost:5173` (configurable via `app.oauth2.redirect-uri`)

> [!NOTE]
> After successful GitHub OAuth, the JWT cookie is set and the user is redirected to the frontend root. The frontend should detect the cookie and treat the user as logged in.

---

## Users

### 4. Get My Profile

**GET** `/api/v1/users/profile`

Returns the currently authenticated user's profile.

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "profileImageUrl": "string"   // URL to avatar image (Cloudinary or GitHub avatar)
}
```

---

### 5. Update My Profile

**PATCH** `/api/v1/users/profile`

Content-Type: `multipart/form-data`

Updates the currently authenticated user's profile. All fields are optional.

#### Form Fields

| Field | Type | Constraint |
|-------|------|-----------|
| `firstName` | `string` | Optional, 2–50 chars |
| `lastName` | `string` | Optional, 2–50 chars |
| `profileImage` | `file` (binary) | Optional, image file uploaded to Cloudinary |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "string",
  "firstName": "string",
  "lastName": "string",
  "profileImageUrl": "string"   // Updated Cloudinary URL (if image was uploaded)
}
```

---

## Connections

### 6. Get Suggestion Feed

**GET** `/api/v1/connection/feed`

Returns a paginated list of user cards (potential connections) — users the current user has NOT yet connected with or sent requests to.

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `int` | `0` | Page number (0-indexed) |
| `size` | `int` | `10` | Number of users per page |

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "profileImageUrl": "string"
  }
]
```

---

### 7. Send Connection Request

**POST** `/api/v1/connection/send/{receiverId}`

Sends a connection request to the specified user.

#### Path Parameter

| Param | Type | Description |
|-------|------|-------------|
| `receiverId` | `long` | ID of the user to connect with |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "string"
}
```

#### Error Responses

| HTTP | Trigger |
|------|---------|
| `409` | Request already exists / users already connected |
| `400` | Invalid `receiverId` |

---

### 8. Get Received Connection Requests

**GET** `/api/v1/connection/requests/received`

Returns a list of user cards for users who have sent the current user a **pending** connection request.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "profileImageUrl": "string"
  }
]
```

---

### 9. Review a Connection Request (Accept / Reject)

**POST** `/api/v1/connection/requests/{requestId}/review`

Accepts or rejects an incoming connection request.

#### Path Parameter

| Param | Type | Description |
|-------|------|-------------|
| `requestId` | `long` | ID of the connection request |

#### Query Parameter

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `action` | `string` | `ACCEPT` or `REJECT` | Action to take |

#### Response `200 OK`

```json
{
  "status": 200,
  "message": "string"
}
```

#### Error Responses

| HTTP | Trigger |
|------|---------|
| `400` | Invalid `action` value |
| `404` / `403` | Request not found or not addressed to current user |

---

## Chat (REST)

### 10. Send a Message (REST)

**POST** `/api/v1/chat/send`

Sends a chat message via REST (also triggers real-time delivery via WebSocket).

#### Request Body (`application/json`)

```json
{
  "receiverId": 1,           // required, Long — recipient user ID
  "content": "string"        // required, non-blank
}
```

#### Response `200 OK`

```json
{
  "id": 1,
  "senderId": 1,
  "receiverId": 2,
  "content": "string",
  "createdAt": "2024-01-01T12:00:00"   // ISO 8601 LocalDateTime
}
```

---

### 11. Get Chat History

**GET** `/api/v1/chat/history`

Retrieves older messages in a conversation (cursor-based pagination going backward in time).

#### Request Body (`application/json`)

> [!WARNING]
> This GET endpoint accepts a request body — a non-standard but valid HTTP pattern. Ensure your HTTP client supports sending a body with GET requests (Axios and Fetch do; some clients don't).

```json
{
  "otherUserId": 1,                        // required, Long — the other party in the conversation
  "lastSeenTime": "2024-01-01T12:00:00",   // optional, ISO 8601 — fetch messages before this timestamp
  "lastSeenId": 100                        // optional, Long — fetch messages before this ID (for tie-breaking)
}
```

#### Query Parameter

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | `int` | `30` | Number of messages to return |

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "content": "string",
    "createdAt": "2024-01-01T12:00:00"
  }
]
```

---

## Chat (WebSocket / STOMP)

The server uses **STOMP over WebSocket** with SockJS fallback.

### Connection Setup

| Property | Value |
|----------|-------|
| SockJS Endpoint | `http://localhost:8080/ws` |
| Native WebSocket Endpoint | `ws://localhost:8080/ws-native` |
| Application destination prefix | `/app` |
| User destination prefix | `/user` |
| Broker destinations | `/queue`, `/topic` |

> [!IMPORTANT]
> **Authentication**: Send the JWT cookie in the STOMP `CONNECT` frame. Since it's an HttpOnly cookie, the browser automatically includes it in the WebSocket handshake — no manual header needed. The server's `WebsocketAuthInterceptor` reads it from the `CONNECT` frame headers.

### 12. Send a Message via WebSocket

**STOMP Destination (client → server)**: `/app/chat.send`

#### Payload (JSON string body of STOMP frame)

```json
{
  "receiverId": 1,       // Long — recipient user ID
  "content": "string"   // non-blank message text
}
```

No direct response frame is sent back on this channel — the message is delivered to the recipient's subscription.

---

### 13. Subscribe to Incoming Messages

**STOMP Subscription (client → server subscribe)**: `/user/queue/messages`

Each message pushed here has the shape:

```json
{
  "id": 1,
  "senderId": 1,
  "receiverId": 2,
  "content": "string",
  "createdAt": "2024-01-01T12:00:00"
}
```

---

## Error Response Schema

All error responses share this structure (fields are omitted when `null`):

```json
{
  "status": 400,
  "error": "string",                     // e.g. "Validation Failed", "Conflict", "Bad Request"
  "message": "string",
  "path": "/api/v1/...",
  "timestamp": "2024-01-01T12:00:00",
  "validationErrors": {                  // only present on validation failures
    "fieldName": "error message"
  }
}
```

| HTTP Code | Scenario |
|-----------|----------|
| `400` | Validation error or bad argument |
| `401` | Invalid / missing JWT |
| `403` | Forbidden (not your resource) |
| `409` | Conflict (duplicate user, duplicate request) |
| `500` | Unexpected server error |

---

## Data Models Summary

### `UserCardResponse`
```typescript
{
  id: number;            // Long
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}
```

### `ConnectionRequestStatus` (enum)
```
PENDING | ACCEPTED | REJECTED
```

### `AuthProvider` (enum)
```
LOCAL | GITHUB
```

---

## WebSocket Quick-Start (JavaScript)

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  // JWT cookie is sent automatically in the handshake
  onConnect: () => {
    // Subscribe to incoming messages
    client.subscribe('/user/queue/messages', (frame) => {
      const msg = JSON.parse(frame.body);
      console.log('New message:', msg);
    });
  },
});

client.activate();

// Sending a message
function sendMessage(receiverId, content) {
  client.publish({
    destination: '/app/chat.send',
    body: JSON.stringify({ receiverId, content }),
  });
}
```

---

## API Endpoints Summary Table

| # | Method | Endpoint | Auth Required | Description |
|---|--------|----------|:---:|-------------|
| 1 | POST | `/api/v1/auth/register` | ❌ | Register new user |
| 2 | POST | `/api/v1/auth/authenticate` | ❌ | Login |
| 3 | GET | `/oauth2/authorization/github` | ❌ | GitHub OAuth2 login |
| 4 | GET | `/api/v1/users/profile` | ✅ | Get my profile |
| 5 | PATCH | `/api/v1/users/profile` | ✅ | Update my profile (multipart) |
| 6 | GET | `/api/v1/connection/feed` | ✅ | Get suggestion feed (paginated) |
| 7 | POST | `/api/v1/connection/send/{receiverId}` | ✅ | Send connection request |
| 8 | GET | `/api/v1/connection/requests/received` | ✅ | Get received requests |
| 9 | POST | `/api/v1/connection/requests/{requestId}/review` | ✅ | Accept/Reject request |
| 10 | POST | `/api/v1/chat/send` | ✅ | Send chat message (REST) |
| 11 | GET | `/api/v1/chat/history` | ✅ | Get chat history (cursor) |
| 12 | WS | `/app/chat.send` | ✅ cookie | Send message via WebSocket |
| 13 | WS sub | `/user/queue/messages` | ✅ cookie | Receive real-time messages |
