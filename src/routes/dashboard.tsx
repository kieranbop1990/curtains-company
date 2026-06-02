import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';

import { Layout as DashboardLayout } from 'src/layouts/dashboard';

// Quotes
const QuoteListPage = lazy(() => import('src/pages/dashboard/quotes/list'));
const QuoteDetailPage = lazy(() => import('src/pages/dashboard/quotes/detail'));

// Assets
const AssetListPage = lazy(() => import('src/pages/dashboard/assets/list'));
const AssetDetailPage = lazy(() => import('src/pages/dashboard/assets/detail'));
const AssetAddPage = lazy(() => import('src/pages/dashboard/assets/add'));

// Live Projects
const LiveProjectListPage = lazy(() => import('src/pages/dashboard/live-projects/list'));
const LiveProjectDetailPage = lazy(() => import('src/pages/dashboard/live-projects/detail'));

// Service Operations
const ServiceOperationsListPage = lazy(() => import('src/pages/dashboard/service-operations/list'));
const ServiceQuoteDetailPage = lazy(() => import('src/pages/dashboard/service-operations/detail'));
const ServiceQuoteAddPage = lazy(() => import('src/pages/dashboard/service-operations/add'));
const LiveServiceDetailPage = lazy(() => import('src/pages/dashboard/service-operations/ls-detail'));

// Manufacturing
const ManufacturingListPage = lazy(() => import('src/pages/dashboard/manufacturing/list'));
const ManufacturingDetailPage = lazy(() => import('src/pages/dashboard/manufacturing/detail'));

// Production Pack
const ProductionPackPage = lazy(() => import('src/pages/dashboard/live-projects/production-pack'));

// Distribution
const DistributionListPage = lazy(() => import('src/pages/dashboard/distribution/list'));
const DistributionDetailPage = lazy(() => import('src/pages/dashboard/distribution/detail'));

// Operations Dashboard
const OperationsDashboardPage = lazy(() => import('src/pages/dashboard/operations/index'));
const InstallationCalendarPage = lazy(() => import('src/pages/dashboard/operations/calendar'));

// Admin
const StaffDirectoryPage = lazy(() => import('src/pages/dashboard/admin/staff'));
const PartsLibraryPage = lazy(() => import('src/pages/dashboard/admin/parts'));

// How To
const HowToPage = lazy(() => import('src/pages/dashboard/how-to'));

const dashboardChildren = [
  {
    index: true,
    element: <Suspense fallback={null}><OperationsDashboardPage /></Suspense>
  },
  {
    path: 'quotes',
    children: [
      { index: true, element: <QuoteListPage /> },
      { path: ':quoteId', element: <QuoteDetailPage /> },
    ]
  },
  {
    path: 'assets',
    children: [
      { index: true, element: <AssetListPage /> },
      { path: 'add', element: <AssetAddPage /> },
      { path: ':assetId', element: <AssetDetailPage /> },
    ]
  },
  {
    path: 'live-projects',
    children: [
      { index: true, element: <LiveProjectListPage /> },
      { path: ':projectId', element: <LiveProjectDetailPage /> },
    ]
  },
  {
    path: 'service-operations',
    children: [
      { index: true, element: <ServiceOperationsListPage /> },
      { path: 'add', element: <ServiceQuoteAddPage /> },
      { path: 'ls/:lsId', element: <LiveServiceDetailPage /> },
      { path: ':quoteId', element: <ServiceQuoteDetailPage /> },
    ]
  },
  {
    path: 'manufacturing',
    children: [
      { index: true, element: <ManufacturingListPage /> },
      { path: ':jobId', element: <ManufacturingDetailPage /> },
    ]
  },
  {
    path: 'production-packs',
    children: [
      { path: ':packId', element: <ProductionPackPage /> },
    ]
  },
  {
    path: 'distribution',
    children: [
      { index: true, element: <DistributionListPage /> },
      { path: ':djId', element: <DistributionDetailPage /> },
    ]
  },
  {
    path: 'operations',
    children: [
      { index: true, element: <Suspense fallback={null}><OperationsDashboardPage /></Suspense> },
      { path: 'calendar', element: <Suspense fallback={null}><InstallationCalendarPage /></Suspense> },
    ]
  },
  {
    path: 'admin',
    children: [
      { path: 'staff', element: <Suspense fallback={null}><StaffDirectoryPage /></Suspense> },
      { path: 'parts', element: <Suspense fallback={null}><PartsLibraryPage /></Suspense> },
    ]
  },
  {
    path: 'how-to',
    element: <Suspense fallback={null}><HowToPage /></Suspense>
  },
];

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: (
      <DashboardLayout>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: dashboardChildren
  },
  {
    path: '/',
    element: (
      <DashboardLayout>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: dashboardChildren
  }
];
