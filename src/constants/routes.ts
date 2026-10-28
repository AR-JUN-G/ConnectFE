export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  DEVELOPERS: '/developers',
  REQUESTS: '/requests',
  MESSAGES: '/messages',
  PROFILE: '/profile',
  CHAT: '/messages/:userId',
  chatWith: (userId: number | string) => `/messages/${userId}`,
} as const;
