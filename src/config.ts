export const amplifyConfig = {
  aws_cognito_region: import.meta.env.VITE_AWS_COGNITO_REGION,
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
};

export const gtmConfig = {
  containerId: import.meta.env.VITE_GTM_CONTAINER_ID
};

export const mapboxConfig = {
  apiKey: import.meta.env.VITE_MAPBOX_API_KEY
};
