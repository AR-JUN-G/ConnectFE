# DeveloperNetwork — React Frontend Implementation Plan

## Overview

Build a complete, production-ready React/TypeScript frontend for DeveloperNetwork — a developer networking platform. The backend is running at `http://localhost:8080` and uses HttpOnly JWT cookies for authentication.

The existing project directory (`d:\AfterCollegeLearning\Connect`) contains only `API_Reference.md`. A new Vite + React + TypeScript project will be scaffolded directly in this directory.

---

## Key Technical Decisions

### Authentication Model
The backend sets an **HttpOnly cookie named `jwt`** on login/register/OAuth. The frontend **cannot read this cookie**. Session validation is done by calling `GET /api/v1/users/profile` — a 200 means authenticated, a 401 means not.

### Cookie / CORS Consideration
The cookie is `SameSite=Strict`. In local development (frontend at `localhost:5173`, backend at `localhost:8080`), **same-site** semantics should work because both are `localhost`. In production (different domains), a backend configuration change to `SameSite=None; Secure` + proper CORS would be needed — this is documented but not implemented in backend.

### Chat Conversation List Limitation
The API does **not** expose a "list all conversations" or "list accepted connections" endpoint. The chat page will allow navigating to a chat via `/chat/:userId` (e.g., from the developer feed or received requests cards). A sidebar will show recently interacted users based on what the user navigates to — no fabricated data.

### Review Endpoint — requestId vs userId
The received requests endpoint returns `UserCardResponse` (`id`, `firstName`, `lastName`, `profileImageUrl`). The review endpoint takes a `requestId`. The `id` field in the `UserCardResponse` from the received requests endpoint is the **connection request ID** (not the sender's user ID), since the endpoint says "ID of the connection request". This needs to be confirmed by inspecting backend code — I will note this as a risk.

> [!WARNING]
> The `GET /api/v1/connection/requests/received` response returns `UserCardResponse` objects where the `id` field may be the **connection request ID** or the **user ID**. The review endpoint needs the `requestId`. If `id` from the feed is actually the user ID, the review call will be wrong. I will document this assumption and make the code easy to correct.

### Logout
No logout endpoint is documented. The frontend logout will:
1. Clear any client-side state (auth context).
2. Redirect to `/login`.
3. The HttpOnly cookie will expire after its Max-Age (24h) or when the user closes the browser (if session cookie).

> [!IMPORTANT]
> Server-side session invalidation is not possible without a logout endpoint. The cookie remains valid on the server until expiry.

### Message Sending Strategy
The REST `POST /api/v1/chat/send` response returns the saved message. The WebSocket subscription `/user/queue/messages` delivers messages to the **receiver** (not the sender). Therefore:
- Sender: sends via REST, adds message from REST response to local state.
- Receiver: gets message via WebSocket subscription.
- Deduplication by message `id` to handle edge cases.

---

## Open Questions

> [!IMPORTANT]
> **Q1**: Does `GET /api/v1/connection/requests/received` return `id` as the connection request ID, or the sender's user ID? The review endpoint needs `requestId`. If it's user ID, the backend needs to be inspected to find the correct request ID.

> [!NOTE]
> **Q2**: The GitHub OAuth redirect goes to `http://localhost:5173` (the frontend root). When the user lands there, the frontend should detect they're authenticated by calling `/api/v1/users/profile`. This is the correct behavior — no query param is added by the backend (no `?oauth=true`).

---

## Proposed Changes

### Root level (d:\AfterCollegeLearning\Connect)

#### [NEW] package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, index.html
Scaffolded via `npm create vite@latest` with React + TypeScript template, then dependencies installed.

#### [NEW] .env.example
```
VITE_API_BASE_URL=http://localhost:8080
```

#### [NEW] .gitignore (or append to existing)
Includes `.env`, `node_modules`, `dist`.

#### [NEW] README.md
Full documentation.

#### [NEW] docs/api-integration-checklist.md

---

### src/types/

#### [NEW] src/types/index.ts
All shared TypeScript models:
- `UserCardResponse`
- `UserProfile`
- `AuthResponse`
- `ChatMessage`
- `RegisterRequest`
- `LoginRequest`
- `ChatSendRequest`
- `ChatHistoryRequest`
- `ApiErrorResponse`
- `ReviewAction` enum

---

### src/api/

#### [NEW] src/api/axiosInstance.ts
- `baseURL` from `import.meta.env.VITE_API_BASE_URL`
- `withCredentials: true`
- 15s timeout
- Response interceptor: on 401, emit event or set auth state to unauthenticated

#### [NEW] src/api/apiError.ts
- `ApiError` class extending Error
- Extracts `status`, `message`, `validationErrors` from error response

#### [NEW] src/api/errorHandler.ts
- `handleAxiosError(error)` → throws typed `ApiError`

---

### src/services/

#### [NEW] src/services/authService.ts
- `register(data: RegisterRequest): Promise<AuthResponse>`
- `login(data: LoginRequest): Promise<AuthResponse>`
- `initiateGitHubOAuth(): void` — `window.location.href = BASE_URL + '/oauth2/authorization/github'`
- `logout(): void` — client-side only (clears context, redirect)

#### [NEW] src/services/userService.ts
- `getProfile(): Promise<UserProfile>`
- `updateProfile(data: FormData): Promise<UpdateProfileResponse>`

#### [NEW] src/services/connectionService.ts
- `getFeed(page: number, size: number): Promise<UserCardResponse[]>`
- `sendRequest(receiverId: number): Promise<{status: number; message: string}>`
- `getReceivedRequests(): Promise<UserCardResponse[]>`
- `reviewRequest(requestId: number, action: 'ACCEPT' | 'REJECT'): Promise<{status: number; message: string}>`

#### [NEW] src/services/chatService.ts
- `sendMessage(data: ChatSendRequest): Promise<ChatMessage>`
- `getChatHistory(body: ChatHistoryRequest, size?: number): Promise<ChatMessage[]>`

---

### src/websocket/

#### [NEW] src/websocket/stompClient.ts
- Creates and exports a singleton STOMP `Client` configured with SockJS
- Manages connection lifecycle, reconnect with backoff
- Exports `connect()`, `disconnect()`, `isConnected()`

#### [NEW] src/websocket/chatSocketService.ts
- `subscribeToMessages(handler: (msg: ChatMessage) => void): () => void`
- `sendMessageViaSocket(payload: ChatSendRequest): void`
- Manages subscription cleanup

---

### src/app/

#### [NEW] src/app/providers.tsx
- `QueryClientProvider` (TanStack Query)
- `AuthProvider` (custom context)
- `Toaster` (for toast notifications — using a simple custom implementation)

#### [NEW] src/app/router.tsx
- Public routes: `/login`, `/register`
- Protected routes: `/`, `/developers`, `/requests`, `/profile`, `/chat/:userId`
- 404 catch-all

#### [NEW] src/app/App.tsx
- Wraps router with providers

---

### src/features/auth/

#### [NEW] src/features/auth/context/AuthContext.tsx
- `currentUser: UserProfile | null`
- `isLoading: boolean`
- `isAuthenticated: boolean`
- `login(profile: UserProfile): void`
- `logout(): void`
- `refreshProfile(): Promise<void>`

#### [NEW] src/features/auth/hooks/useAuth.ts
- Consumes `AuthContext`

#### [NEW] src/features/auth/pages/LoginPage.tsx
- Email + password form
- GitHub OAuth button
- Link to register
- React Hook Form + Zod validation

#### [NEW] src/features/auth/pages/RegisterPage.tsx
- firstName, lastName, email, password
- React Hook Form + Zod validation

#### [NEW] src/features/auth/components/AuthGuard.tsx
- Checks `isAuthenticated`; redirects to `/login` if not
- Shows loader while auth state initializes

#### [NEW] src/features/auth/validation/authSchemas.ts
- `loginSchema`, `registerSchema` (Zod)

---

### src/features/profile/

#### [NEW] src/features/profile/pages/ProfilePage.tsx
- Shows current user profile
- Avatar, name, email
- Edit button → opens edit modal/form

#### [NEW] src/features/profile/components/EditProfileForm.tsx
- firstName, lastName inputs
- Profile image picker + preview
- Submit with multipart/form-data
- Shows current image

#### [NEW] src/features/profile/hooks/useProfile.ts
- TanStack Query for fetching/mutating profile

#### [NEW] src/features/profile/validation/profileSchema.ts
- Zod schema for profile update

---

### src/features/connections/

#### [NEW] src/features/connections/pages/DevelopersPage.tsx
- Paginated developer feed
- Developer cards with connect button
- Loading skeletons, empty state

#### [NEW] src/features/connections/pages/RequestsPage.tsx
- Received connection requests list
- Accept/Reject buttons per request

#### [NEW] src/features/connections/components/DeveloperCard.tsx
- Avatar, name, connect button

#### [NEW] src/features/connections/components/RequestCard.tsx
- Avatar, name, accept/reject buttons

#### [NEW] src/features/connections/hooks/useDeveloperFeed.ts
#### [NEW] src/features/connections/hooks/useReceivedRequests.ts

---

### src/features/chat/

#### [NEW] src/features/chat/pages/ChatPage.tsx
- Route: `/chat/:userId`
- Loads chat history for selected user
- Shows message list
- Message input
- Uses WebSocket for incoming messages

#### [NEW] src/features/chat/components/MessageBubble.tsx
#### [NEW] src/features/chat/components/MessageInput.tsx
#### [NEW] src/features/chat/components/ChatHeader.tsx

#### [NEW] src/features/chat/hooks/useChat.ts
- Manages message state
- Loads history
- Cursor-based "load more"
- WebSocket integration
- Deduplication by message ID

---

### src/components/

#### [NEW] src/components/common/Button.tsx
#### [NEW] src/components/common/Input.tsx
#### [NEW] src/components/common/Avatar.tsx
#### [NEW] src/components/common/Loader.tsx
#### [NEW] src/components/common/Modal.tsx
#### [NEW] src/components/common/EmptyState.tsx
#### [NEW] src/components/common/ErrorMessage.tsx
#### [NEW] src/components/common/Toast.tsx (simple toast system)

#### [NEW] src/components/layout/AppLayout.tsx
#### [NEW] src/components/layout/Sidebar.tsx
#### [NEW] src/components/layout/Header.tsx
#### [NEW] src/components/layout/MobileNavigation.tsx

---

### src/hooks/

#### [NEW] src/hooks/useToast.ts
#### [NEW] src/hooks/useDebounce.ts

---

### src/constants/

#### [NEW] src/constants/routes.ts
#### [NEW] src/constants/api.ts

---

### src/utils/

#### [NEW] src/utils/formatDate.ts
#### [NEW] src/utils/cn.ts (className utility)

---

### src/styles/

#### [NEW] src/styles/globals.css
- Tailwind base/components/utilities directives

---

## Visual Design Direction

**Color palette**: Dark blue/indigo primary (`#4F46E5`), neutral grays, white surfaces. Code/terminal aesthetic with clean card layouts.

**Typography**: System font stack, clear hierarchy.

**Components**: Rounded cards with subtle shadows, consistent 8px spacing grid, smooth hover transitions.

---

## Verification Plan

### Automated
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run build       # Vite production build
```

### Manual
- Start backend at `http://localhost:8080`
- Run `npm run dev`
- Verify each user flow against the checklist

### Known Risks
1. **Cookie SameSite=Strict**: Local dev (same host, different ports) — browser treats `localhost:5173` and `localhost:8080` as same-site. Should work.
2. **requestId vs userId in received requests**: Documented above.
3. **No conversation list**: Chat only accessible via `/chat/:userId` with known user ID.
4. **No logout endpoint**: Client-side only logout.
