import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = parseInt(process.env.PORT || '3001');

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🔥 Fire Curtains API running on http://localhost:${info.port}`);
  console.log(`   Health check: http://localhost:${info.port}/health`);
});
