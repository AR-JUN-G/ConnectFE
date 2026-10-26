# DeveloperNetwork Frontend

A modern, production-ready React web application for **DeveloperNetwork** — a professional networking platform built for software engineers.

---

## Features

- **Authentication**:
  - Secure registration & login with client-side validation (React Hook Form + Zod).
  - GitHub OAuth2 integration with automatic session validation on redirect.
  - Zero-touch HttpOnly JWT cookie management (`SameSite=Strict`, `withCredentials: true`).
- **Developer Discovery**:
  - Browse suggested developer profiles via paginated feeds (0-indexed).
  - Send connection requests with instant UI feedback, loading spinners, and duplicate (409) conflict prevention.
- **Connection Requests**:
  - View incoming pending connection requests with sender avatars and details.
  - Accept or decline requests with real-time optimistic list updates.
- **Real-Time & Cursor Chat**:
  - Chat interface accessible at `/chat/:userId` for connected developers.
  - History loaded using cursor-based backward pagination (`lastSeenTime` & `lastSeenId`).
  - Real-time incoming messages via STOMP over SockJS with automatic reconnect and message deduplication.
  - Date separators, automatic scroll to bottom, and scroll position preservation when loading older messages.
- **Profile Management**:
  - View user profile with avatar, name, and email.
  - Edit name and upload new avatars via `multipart/form-data` with client-side image preview and file size validation.
- **Design & UX**:
  - Modern developer-centric theme with Tailwind CSS and Lucide React icons.
  - Responsive layouts: desktop sidebar and mobile bottom navigation with drawer menu.
  - Accessible dialogs, loading skeletons, error states with retry, and non-blocking toast notifications.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | React 18, TypeScript, Vite |
| **Routing** | React Router DOM v6 |
| **State & Data Fetching** | TanStack React Query v5 |
| **HTTP Client** | Axios (centralized instance with interceptors) |
| **WebSocket** | `@stomp/stompjs`, `sockjs-client` |
| **Forms & Validation** | React Hook Form, Zod, `@hookform/resolvers` |
| **Styling** | Tailwind CSS, PostCSS, Lucide React icons |

---

## Folder Structure

```
src/
├── api/
│   ├── axiosInstance.ts       # Centralized Axios withCredentials client
│   ├── apiError.ts            # Typed ApiError class
│   └── errorHandler.ts        # Axios error parser & message resolver
│
├── app/
│   ├── App.tsx                # App root component
│   ├── router.tsx             # React Router route tree & guards
│   └── providers.tsx          # QueryClientProvider, AuthProvider, Toaster
│
├── components/
│   ├── common/
│   │   ├── Avatar.tsx         # Image avatar with fallback icon
│   │   ├── Button.tsx         # Button with variants, sizes & loading states
│   │   ├── EmptyState.tsx     # Reusable empty data placeholder
│   │   ├── ErrorMessage.tsx   # Error alert with retry button
│   │   ├── Input.tsx          # Form input with validation feedback
│   │   ├── Loader.tsx         # Spinner and Skeleton loaders
│   │   ├── Modal.tsx          # Accessible native dialog modal
│   │   ├── NotFoundPage.tsx   # 404 error page
│   │   └── Toast.tsx          # Toast notification container & hook
│   │
│   └── layout/
│       ├── AppLayout.tsx      # Main application layout shell
│       ├── Header.tsx         # Mobile header with menu trigger
│       ├── MobileNavigation.tsx # Mobile bottom tab bar
│       └── Sidebar.tsx        # Desktop sidebar navigation
│
├── constants/
│   ├── api.ts                 # API path & WebSocket endpoint constants
│   └── routes.ts              # Route path definitions
│
├── features/
│   ├── auth/                  # Login, Register, AuthGuard, AuthContext
│   ├── connections/           # Developer feed, Requests review, Cards
│   ├── chat/                  # Chat interface, Message bubbles, Cursor history
│   └── profile/               # Profile view and Multipart edit modal
│
├── hooks/
│   └── useToast.ts            # Toast notification hook & manager
│
├── services/
│   ├── authService.ts         # Register, Login, GitHub OAuth initiation
│   ├── chatService.ts         # Send message & Cursor history REST endpoints
│   ├── connectionService.ts   # Feed, Send, Received requests & Review
│   └── userService.ts         # Profile retrieval and multipart update
│
├── styles/
│   └── globals.css            # Tailwind directives and scrollbar styles
│
├── types/
│   └── index.ts               # Complete TypeScript API models & interfaces
│
├── utils/
│   ├── cn.ts                  # Class name merge utility
│   └── formatDate.ts          # Date & timestamp formatting utilities
│
└── websocket/
    ├── stompClient.ts         # Singleton STOMP client with SockJS fallback
    └── chatSocketService.ts   # Subscription manager with dual-queue support
```

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later recommended)
- npm or pnpm
- DeveloperNetwork Backend running at `http://localhost:8080` (or configured URL)

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd d:\AfterCollegeLearning\Connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Ensure `.env` contains:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

---

## Running the Application

### Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Build output will be generated in `dist/`.

### Preview Production Build
```bash
npm run preview
```

### Type Checking & Linting
```bash
npm run typecheck
npm run lint
```

---

## Backend Configuration & Deployment Guidelines

### Cross-Origin Cookie Requirements
The backend issues an HttpOnly cookie named `jwt` with `SameSite=Strict`.

- **Local Development**: When both frontend (`http://localhost:5173`) and backend (`http://localhost:8080`) are on `localhost`, modern browsers treat them as same-site.
- **Production Deployment**: If the frontend is hosted on a separate domain (e.g. `https://devnetwork.vercel.app`) and backend on another (e.g. `https://api.devnetwork.com`), the backend MUST configure:
  1. `SameSite=None; Secure` on the `jwt` cookie.
  2. CORS header `Access-Control-Allow-Credentials: true`.
  3. `Access-Control-Allow-Origin: https://devnetwork.vercel.app` (explicit origin, cannot be wildcard `*`).

### GitHub OAuth Redirect URI
In the backend's `application.yml` / `SecurityConfig`:
```yaml
app:
  oauth2:
    redirect-uri: http://localhost:5173
```
In production, update this to your production frontend URL (e.g. `https://your-domain.vercel.app`).

### SPA Route Rewrites
Single Page Applications using React Router require all paths to fallback to `index.html`. Pre-configured deployment files are included:
- **Vercel**: `vercel.json`
- **Netlify**: `netlify.toml`

---

## Known Backend Limitations & Architectural Notes

1. **No Logout Endpoint**: The backend does not implement `/api/v1/auth/logout`. Logout in the frontend resets the local session context and navigates to the login screen.
2. **WebSocket Authentication**: The backend's `WebsocketAuthInterceptor` checks for a `Bearer` header on the native STOMP CONNECT frame. Because the JWT is stored in an HttpOnly cookie, JavaScript cannot read it to populate this header. The app connects via SockJS (`/ws`) and uses the documented REST `/api/v1/chat/send` for reliable, authenticated message delivery.
3. **Queue Destination Naming**: The API reference specifies `/user/queue/messages` (plural), whereas backend implementation uses `/queue/message` (singular). The frontend subscribes to both destinations simultaneously with message deduplication to maintain compatibility.
4. **Chat Restricted to Accepted Connections**: The backend rejects messaging or loading history for users who are not yet accepted connections (`IllegalStateException`). The chat interface gracefully notifies the user and provides quick navigation back to developer discovery.
5. **Detailed Checklist**: See `docs/api-integration-checklist.md` for the complete operational breakdown.
