import { lazy } from 'react';
import type { RouteObject } from 'react-router';

const AuthCallbackPage = lazy(() => import('src/pages/auth/callback'));

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    children: [
      {
        path: 'callback',
        element: <AuthCallbackPage />,
      },
    ],
  },
];
