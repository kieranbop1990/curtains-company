# Fire Curtains API

REST API backend for the Fire Curtains operations dashboard.

## Stack

- **Runtime**: Node.js
- **Framework**: [Hono](https://hono.dev)
- **Database**: PostgreSQL via [Prisma](https://prisma.io)
- **Auth**: AWS Cognito JWT verification
- **Storage**: AWS S3 (presigned URLs)

## Local Development

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and edit with your values
cp .env.example .env

# 3. Start PostgreSQL
docker-compose up -d

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. (Optional) Seed with sample data
npm run db:seed

# 6. Start the dev server
npm run dev
```

The API will be running at `http://localhost:3001`.

### Skipping Auth for Development

Set `DEV_SKIP_AUTH=true` in your `.env` to bypass JWT verification during local development.

### Database Management

```bash
npm run db:studio    # Open Prisma Studio (visual DB editor)
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (with items)
- `PUT /api/orders/:id` - Update order (with items)
- `PUT /api/orders/:id/pending` - Update pending checklist
- `PUT /api/orders/:id/items/:itemId` - Update order item
- `PUT /api/orders/:id/items/:itemId/production` - Update production status
- `DELETE /api/orders/:id/items/:itemId` - Delete order item

### Files
- `GET /api/files/:orderId` - List files for an order
- `POST /api/files/upload-url` - Get presigned upload URL
- `POST /api/files/download-url` - Get presigned download URL
- `DELETE /api/files/:orderId/:fileName` - Delete a file
