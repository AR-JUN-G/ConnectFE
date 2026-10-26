export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  DEVELOPERS: '/developers',
  REQUESTS: '/requests',
  PROFILE: '/profile',
  CHAT: '/chat/:userId',
  chatWith: (userId: number | string) => `/chat/${userId}`,
} as const;
