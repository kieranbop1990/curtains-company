import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from 'react-oidc-context';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { userManager } from 'src/lib/user-manager';
import { App } from 'src/app';

// Unregister any previously installed service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HelmetProvider>
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <AuthProvider
          userManager={userManager}
          onSigninCallback={(user) => {
            const returnTo = user && typeof user.state === 'string' ? user.state : '/';
            window.location.replace(returnTo);
          }}
        >
          <Suspense>
            <App />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </HelmetProvider>
);
