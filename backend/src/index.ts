import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = parseInt(process.env.PORT || '3001');

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
  console.log(`🔥 Fire Curtains API running on port ${info.port}`);
  console.log(`   Health check: /health`);
});
