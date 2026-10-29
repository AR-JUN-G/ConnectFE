const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
// Strip any trailing slashes to prevent double slashes (e.g. "//ws")
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export const API_BASE_URL = cleanBaseUrl;

export const API_PATHS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    AUTHENTICATE: '/api/v1/auth/authenticate',
    LOGOUT: '/api/v1/auth/logout',
    GITHUB_OAUTH: `${cleanBaseUrl}/oauth2/authorization/github`,
  },
  USERS: {
    PROFILE: '/api/v1/users/profile',
  },
  CONNECTIONS: {
    FEED: '/api/v1/connection/feed',
    SEND: (receiverId: number) => `/api/v1/connection/send/${receiverId}`,
    RECEIVED: '/api/v1/connection/requests/received',
    REVIEW: (requestId: number) => `/api/v1/connection/requests/${requestId}/review`,
  },
  CHAT: {
    SEND: '/api/v1/chat/send',
    HISTORY: '/api/v1/chat/history',
  },
} as const;

export const WS_ENDPOINTS = {
  SOCKJS: `${cleanBaseUrl}/ws`,
  NATIVE: cleanBaseUrl.replace(/^http/, 'ws') + '/ws-native',
  DESTINATIONS: {
    APP_PREFIX: '/app',
    USER_PREFIX: '/user',
    SEND_MESSAGE: '/app/chat.send',
    INCOMING_MESSAGES: '/user/queue/messages',
    INCOMING_MESSAGE_SINGULAR: '/user/queue/message',
  },
} as const;
