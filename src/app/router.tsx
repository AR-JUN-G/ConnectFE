import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthGuard, PublicGuard } from '@/features/auth/components/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DevelopersPage } from '@/features/connections/pages/DevelopersPage';
import { RequestsPage } from '@/features/connections/pages/RequestsPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { MessagesPage } from '@/features/chat/pages/MessagesPage';
import { NotFoundPage } from '@/components/common/NotFoundPage';

export const router = createBrowserRouter([
  // Public routes (login & register)
  {
    element: <PublicGuard />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
    ],
  },

  // Protected authenticated routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.HOME, element: <Navigate to={ROUTES.DEVELOPERS} replace /> },
          { path: ROUTES.DEVELOPERS, element: <DevelopersPage /> },
          { path: ROUTES.REQUESTS, element: <RequestsPage /> },
          { path: ROUTES.MESSAGES, element: <MessagesPage /> },
          { path: ROUTES.CHAT, element: <MessagesPage /> },
          { path: '/chat', element: <Navigate to={ROUTES.MESSAGES} replace /> },
          { path: '/chat/:userId', element: <MessagesPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },

  // 404 Catch-all
  { path: '*', element: <NotFoundPage /> },
]);
