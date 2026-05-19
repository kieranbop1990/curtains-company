import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { App } from 'src/app';

// Register service worker for Field Engineer PWA (T-150)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {/* non-critical */});
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HelmetProvider>
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <Suspense>
          <App />
        </Suspense>
      </BrowserRouter>
    </MantineProvider>
  </HelmetProvider>
);
