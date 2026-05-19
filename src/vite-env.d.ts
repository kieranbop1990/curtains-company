/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AWS_COGNITO_REGION: string;
  readonly VITE_AWS_USER_POOLS_ID: string;
  readonly VITE_AWS_USER_POOLS_WEB_CLIENT_ID: string;
  readonly VITE_AWS_COGNITO_IDENTITY_POOL_ID: string;
  readonly VITE_GTM_CONTAINER_ID: string;
  readonly VITE_MAPBOX_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
