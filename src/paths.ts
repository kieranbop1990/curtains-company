export const paths = {
  index: '/',
  auth: {
    amplify: {
      confirmRegister: '/auth/amplify/confirm-register',
      forgotPassword: '/auth/amplify/forgot-password',
      login: '/auth/amplify/login',
      register: '/auth/amplify/register',
      resetPassword: '/auth/amplify/reset-password'
    }
  },
  dashboard: {
    index: '/dashboard/operations',
    quotes: {
      index: '/dashboard/quotes',
      details: '/dashboard/quotes/:quoteId',
    },
    assets: {
      index: '/dashboard/assets',
      add: '/dashboard/assets/add',
      details: '/dashboard/assets/:assetId',
    },
    liveProjects: {
      index: '/dashboard/live-projects',
      details: '/dashboard/live-projects/:projectId',
    },
    serviceOperations: {
      index: '/dashboard/service-operations',
      add: '/dashboard/service-operations/add',
      details: '/dashboard/service-operations/:quoteId',
      lsDetails: '/dashboard/service-operations/ls/:lsId',
    },
    manufacturing: {
      index: '/dashboard/manufacturing',
      details: '/dashboard/manufacturing/:jobId',
    },
    productionPack: {
      details: '/dashboard/production-packs/:packId',
    },
    distribution: {
      index: '/dashboard/distribution',
      details: '/dashboard/distribution/:djId',
    },
    operations: {
      index: '/dashboard/operations',
      calendar: '/dashboard/operations/calendar',
    },
  },
  notAuthorized: '/401',
  notFound: '/404',
  serverError: '/500'
};
