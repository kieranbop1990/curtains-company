import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';

import { IssuerGuard } from 'src/guards/issuer-guard';
import { GuestGuard } from 'src/guards/guest-guard';
import { Layout as AuthLayout } from 'src/layouts/auth/classic-layout';
import { Issuer } from 'src/utils/auth';

// Amplify
const AmplifyConfirmRegisterPage = lazy(() => import('src/pages/auth/amplify/confirm-register'));
const AmplifyForgotPasswordPage = lazy(() => import('src/pages/auth/amplify/forgot-password'));
const AmplifyLoginPage = lazy(() => import('src/pages/auth/amplify/login'));
const AmplifyRegisterPage = lazy(() => import('src/pages/auth/amplify/register'));
const AmplifyResetPasswordPage = lazy(() => import('src/pages/auth/amplify/reset-password'));

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    children: [
      {
        path: 'amplify',
        element: (
          <IssuerGuard issuer={Issuer.Amplify}>
            <GuestGuard>
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            </GuestGuard>
          </IssuerGuard>
        ),
        children: [
          {
            path: 'confirm-register',
            element: <AmplifyConfirmRegisterPage />
          },
          {
            path: 'forgot-password',
            element: <AmplifyForgotPasswordPage />
          },
          {
            path: 'login',
            element: <AmplifyLoginPage />
          },
          {
            path: 'register',
            element: <AmplifyRegisterPage />
          },
          {
            path: 'reset-password',
            element: <AmplifyResetPasswordPage />
          }
        ]
      }
    ]
  }
];
