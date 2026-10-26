const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const API_BASE_URL = BASE_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    AUTHENTICATE: '/api/v1/auth/authenticate',
    GITHUB_OAUTH: `${BASE_URL}/oauth2/authorization/github`,
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
  SOCKJS: `${BASE_URL}/ws`,
  NATIVE: BASE_URL.replace('http', 'ws') + '/ws-native',
  DESTINATIONS: {
    APP_PREFIX: '/app',
    USER_PREFIX: '/user',
    SEND_MESSAGE: '/app/chat.send',
    INCOMING_MESSAGES: '/user/queue/messages',
    INCOMING_MESSAGE_SINGULAR: '/user/queue/message',
  },
} as const;
