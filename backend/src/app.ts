import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';
import { customersRoutes } from './routes/customers.js';
import { ordersRoutes } from './routes/orders.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { filesRoutes } from './routes/files.js';
import { auditRoutes } from './routes/audit.js';
import { formulaRoutes } from './routes/formula.js';
import { quotesRoutes } from './routes/quotes.js';
import { assetsRoutes } from './routes/assets.js';
import { liveProjectsRoutes } from './routes/live-projects.js';
import { serviceQuotesRoutes, liveServicesRoutes } from './routes/service-quotes.js';
import { productionPackRoutes, manufacturingRoutes } from './routes/production-pack.js';
import { distributionRoutes } from './routes/distribution.js';
import { fieldEngineerRoutes } from './routes/field-engineer.js';
import { staffRoutes } from './routes/staff.js';
import { partsRoutes } from './routes/parts.js';

export const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.use('/api/*', authMiddleware);

app.route('/api/customers', customersRoutes);
app.route('/api/orders', ordersRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/files', filesRoutes);
app.route('/api/audit', auditRoutes);
app.route('/api/formula', formulaRoutes);
app.route('/api/quotes', quotesRoutes);
app.route('/api/assets', assetsRoutes);
app.route('/api/live-projects', liveProjectsRoutes);
app.route('/api/service-quotes', serviceQuotesRoutes);
app.route('/api/live-services', liveServicesRoutes);
app.route('/api/production-packs', productionPackRoutes);
app.route('/api/manufacturing-jobs', manufacturingRoutes);
app.route('/api/distribution-jobs', distributionRoutes);
app.route('/api/field-engineer', fieldEngineerRoutes);
app.route('/api/staff', staffRoutes);
app.route('/api/parts', partsRoutes);
