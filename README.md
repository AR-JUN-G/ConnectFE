# Connect

A sleek, modern, and production-ready web frontend for **Connect** — a professional social networking platform crafted specifically for software developers and tech enthusiasts.

---

## Table of Contents

- [About The Project](#about-the-project)
- [What You Can Do](#what-you-can-do)
- [User Walkthrough & Features](#user-walkthrough--features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [How Real-Time Chat Works](#how-real-time-chat-works)
- [Deployment Guide](#deployment-guide)
- [Contributing & License](#contributing--license)

---

## About The Project

**connectFE** is designed to help developers build meaningful professional networks. Whether you want to connect with fellow engineers working on similar stacks, collaborate on open-source projects, or chat directly in real-time, **connectFE** provides a fast, responsive, and intuitive interface to make it happen.

Built with React 18, TypeScript, Tailwind CSS, and Vite, **connectFE** is lightweight, secure, fully responsive across mobile and desktop devices, and optimized for performance.

---

## What You Can Do

With **connectFE**, you can:

1. **Sign Up & Log In**: Create an account with your email or connect seamlessly using GitHub OAuth2.
2. **Discover Developers**: Browse profiles of other developers in the community with paginated discovery cards.
3. **Build Your Network**: Send connection requests to developers you want to network with.
4. **Manage Requests**: View incoming connection requests and accept or decline them with immediate feedback.
5. **Chat in Real-Time**: Message connected developers with live delivery powered by WebSockets (STOMP/SockJS).
6. **Browse Chat History**: Seamlessly scroll through previous conversations with cursor-based pagination.
7. **Personalize Your Profile**: Showcase your name, email, and upload a custom profile avatar with instant preview.

---

## User Walkthrough & Features

### 🔐 Fast & Secure Authentication
- **Email & Password**: Clean forms with validation feedback for first name, last name, email, and password.
- **GitHub Integration**: One-click login with GitHub OAuth2.
- **Persistent Sessions**: Your login status is maintained securely using browser credentials, so you remain logged in across page refreshes.

### 🌐 Developer Discovery Feed
- **Suggestion Feed**: An interactive grid showcasing fellow developers who are active on the platform.
- **Instant Connection Action**: Click **Connect** on any developer card to send a request. The button updates immediately to keep you informed of pending requests.
- **Responsive Pagination**: Easily navigate through pages of developers using intuitive pagination controls.

### 📬 Received Connection Requests
- **Dedicated Inbox**: Visit the **Requests** tab to view developers who have reached out to connect with you.
- **One-Click Decisions**: Accept or decline requests instantly. Your requests list updates in real time upon confirmation.

### 💬 Real-Time Messaging & Chat
- **Instant Delivery**: Powered by WebSockets with STOMP messaging for low-latency communication.
- **Rich Chat Interface**:
  - Date separators for easy context.
  - Message timestamps formatted in your local time zone.
  - A live connection indicator showing whether you are connected in real-time.
- **Scroll Preservation**: When you load older messages, your current scroll position is preserved so you never lose your place.
- **Message Deduplication**: Intelligent message ID tracking prevents duplicate messages from displaying.

### 👤 Developer Profile & Avatar Customization
- **Profile Overview**: View your profile image, full name, and email address.
- **Edit Modal**: Update your first and last name, or upload a new profile photo directly with client-side image preview before saving.

---

## Technology Stack

| Category | Technology | Description |
|---|---|---|
| **Core Framework** | [React 18](https://react.dev/) | Modern UI library with concurrent rendering |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict static typing for clean, reliable code |
| **Build & Tooling** | [Vite 5](https://vitejs.dev/) | Ultra-fast build tool and development server |
| **Routing** | [React Router v6](https://reactrouter.com/) | Client-side routing with nested layouts and route guards |
| **State Management** | [TanStack React Query v5](https://tanstack.com/query/latest) | Server-state caching, automatic refetching, and mutations |
| **HTTP Client** | [Axios](https://axios-http.com/) | Centralized HTTP client configured with credentials |
| **Real-Time Messaging** | [@stomp/stompjs](https://stomp-js.github.io/) & [sockjs-client](https://github.com/sockjs/sockjs-client) | STOMP protocol over WebSockets with SockJS fallback |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) | Declarative schema validation and form handling |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with custom dark-indigo theme |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, clean developer-focused icons |

---

## Project Structure

```
connectFE/
├── index.html                         # Entry HTML file
├── package.json                       # Scripts & dependencies
├── vite.config.ts                     # Vite build configuration
├── tailwind.config.js                 # Theme styling & palette
├── vercel.json                        # Vercel SPA routing
├── netlify.toml                       # Netlify SPA routing
├── README.md                          # Project documentation
│
└── src/
    ├── api/                           # Centralized Axios client & error handlers
    ├── app/                           # App component, router tree & providers
    ├── components/
    │   ├── common/                    # Button, Input, Modal, Avatar, Loader, Toast
    │   └── layout/                    # AppLayout, Sidebar, Header, MobileNavigation
    ├── constants/                     # API routes & route constants
    ├── features/
    │   ├── auth/                      # Login, Register & Session guards
    │   ├── connections/               # Developers feed, Requests & Cards
    │   ├── chat/                      # Chat screen, Message bubbles & Input
    │   └── profile/                   # Profile page & Edit Profile modal
    ├── hooks/                         # useToast & custom hooks
    ├── services/                      # API service modules (auth, user, connections, chat)
    ├── styles/                        # Tailwind CSS global styles
    ├── types/                         # Shared TypeScript interfaces
    ├── utils/                         # Date formatting & classname helpers
    └── websocket/                     # STOMP client manager & chat socket service
```

---

## Getting Started

Follow these steps to run **connectFE** locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or later recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A running Connect backend server (defaults to `http://localhost:8080`)

### Installation & Setup

1. **Clone or navigate into the repository**:
   ```bash
   cd connectFE
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

   Specify your backend URL in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Available Scripts

In the project root, you can run the following scripts:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Runs TypeScript compilation (`tsc -b`) and bundles the app for production in `dist/`. |
| `npm run preview` | Runs a local web server to preview the production build from `dist/`. |
| `npm run typecheck` | Checks TypeScript types across the entire project without emitting code. |
| `npm run lint` | Runs ESLint to check for code quality and enforce standards. |

---

## How Real-Time Chat Works

1. **Automatic Connection**: When you log in, **connectFE** initializes a background STOMP connection to the backend WebSocket broker (`/ws`).
2. **Receiving Messages**: The application listens on the user's private queue for incoming messages. As soon as another developer sends you a message, it appears instantly in your chat window without needing to refresh.
3. **Sending Messages**: Messages you type are sent securely, immediately rendered in your conversation, and dispatched to the recipient.
4. **Historical Conversations**: When you open a conversation, previous messages are loaded in chronological order. Clicking **Load older messages** fetches earlier history using high-performance cursor pagination.

---

## Deployment Guide

**connectFE** is pre-configured for seamless single-page application (SPA) deployment on platforms like Vercel and Netlify.

### Deploying to Vercel
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com/).
3. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://api.yourdomain.com`).
4. Click **Deploy**. Vercel will automatically use the included `vercel.json` for route rewrites.


## Contributing & License

Contributions are welcome! If you'd like to improve the application, feel free to fork the repository, create a feature branch, and submit a pull request.

This project is licensed under the **MIT License**.
