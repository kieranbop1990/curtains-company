import type { RouteObject } from 'react-router';
import { lazy, Suspense } from 'react';

import Error401Page from 'src/pages/401';
import Error404Page from 'src/pages/404';
import Error500Page from 'src/pages/500';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

const FieldEngineerHome = lazy(() => import('src/pages/field-engineer/index'));
const FieldEngineerJob = lazy(() => import('src/pages/field-engineer/job'));

const fieldEngineerRoutes: RouteObject[] = [
  {
    path: 'field-engineer',
    children: [
      { index: true, element: <Suspense fallback={null}><FieldEngineerHome /></Suspense> },
      { path: ':djId', element: <Suspense fallback={null}><FieldEngineerJob /></Suspense> },
    ]
  },
];

export const routes: RouteObject[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...fieldEngineerRoutes,
  {
    path: '401',
    element: <Error401Page />
  },
  {
    path: '404',
    element: <Error404Page />
  },
  {
    path: '500',
    element: <Error500Page />
  },
  {
    path: '*',
    element: <Error404Page />
  }
];
