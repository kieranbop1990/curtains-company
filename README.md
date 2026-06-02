# Fire Curtains Ltd — Operations CRM

Internal CRM managing the full job lifecycle: quotes → live projects → production → manufacturing → distribution → installation → service operations → assets.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI Components | Mantine v7 |
| Backend API | Hono (Node.js), Prisma ORM |
| Database | PostgreSQL |
| Auth | AWS Cognito (JWT) |
| File Storage | AWS S3 (presigned URLs) |
| Email | AWS SES |
| Accounting | Xero API |

## Architecture

The frontend (Vite/React) talks to a Hono REST API over HTTP. The API validates Cognito JWTs, talks to PostgreSQL via Prisma, and delegates file operations to S3 via presigned URLs so credentials never reach the browser. Emails go through SES; invoice sync uses the Xero OAuth API. A service worker at `public/sw.js` enables offline capability for the field engineer PWA.

Six roles are enforced via JWT claims on every `/api/*` request. The frontend currently gates access only by authentication (any valid role can see all pages); the API enforces the granular per-route restrictions below. Set `DEV_SKIP_AUTH=true` in the backend to bypass auth and run as Admin locally.

## Roles & Permissions

Roles are stored as the custom Cognito attribute `custom:role` and included in every ID token. The backend reads this claim on every authenticated request and returns `403` if the role isn't permitted.

### Role definitions

| Role | `custom:role` value | Who it's for |
|------|---------------------|--------------|
| Admin | `ADMIN` | Full access; bypasses all role checks |
| Office / Operations | `OFFICE_OPERATIONS` | Day-to-day CRM users — quotes, projects, service, assets |
| Field Engineer | `ENGINEER_FIELD` | Mobile/PWA access to their own installation jobs |
| Finance / Accounts | `FINANCE_ACCOUNTS` | Invoice approval, financial sign-off, parts read |
| Production | `PRODUCTION` | Parts library read/write, manufacturing visibility |
| Customer | `CUSTOMER` | Reserved for future customer-facing portal |

### What each role can call

| Area | ADMIN | OFFICE_OPS | ENGINEER_FIELD | FINANCE | PRODUCTION | CUSTOMER |
|------|:-----:|:----------:|:--------------:|:-------:|:----------:|:--------:|
| Quotes | ✓ | ✓ | — | — | — | — |
| Live Projects | ✓ | ✓ | — | — | — | — |
| Service Quotes / Live Services | ✓ | ✓ | — | — | — | — |
| Assets | ✓ | ✓ | — | — | — | — |
| Manufacturing / Production Packs | ✓ | ✓ | — | — | — | — |
| Distribution | ✓ | ✓ | — | — | — | — |
| Distribution — financial release | ✓ | — | — | ✓ | — | — |
| Field Engineer jobs (own only) | ✓ | — | ✓ | — | — | — |
| Parts — read | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Parts — write / delete | ✓ | ✓ | — | — | ✓ | — |
| Staff directory — read | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Staff directory — write | ✓ | ✓ | — | — | — | — |
| Audit log | ✓ | ✓ | — | — | — | — |
| Formula / admin tools | ✓ | — | — | — | — | — |

Permission sets are defined in `backend/src/lib/permissions.ts`.

### Setting a role on a Cognito user

Roles are managed via **Cognito Groups**. The ID token automatically includes a `cognito:groups` claim listing all groups the user belongs to. The API reads the first group that matches a valid role name.

**One-time group setup** (do this once per User Pool):
1. AWS Console → Cognito → `eu-west-2_DLWfbFCHS` → **Groups** → Create group
2. Create one group for each role value: `ADMIN`, `OFFICE_OPERATIONS`, `ENGINEER_FIELD`, `FINANCE_ACCOUNTS`, `PRODUCTION`, `CUSTOMER`

**Assigning a role to a user:**
1. AWS Console → Cognito → `eu-west-2_DLWfbFCHS` → **Users** → click the user
2. **Add user to group** → select the appropriate group
3. The user must sign out and back in to get a fresh token with the updated `cognito:groups` claim

### Frontend role enforcement (current state)

The `RoleGuard` component and `useUserRole` hook exist in `src/components/RoleGuard/` and can gate any UI element by role. Currently, navigation and page routes are **auth-only** — any valid role sees all pages. The API will reject unauthorised calls with `403`, so the data simply won't load for roles that lack access. Role-based nav filtering is the next step if needed.

---

## Project Structure

```
backend/          Hono API, Prisma schema, PostgreSQL migrations
  src/routes/     One file per domain (quotes, live-projects, manufacturing, distribution, assets, …)
  src/lib/        Shared utilities: pdf, email, s3, qr, xero, audit, permissions
  prisma/         schema.prisma + seed.ts

src/              React frontend
  api/            API client wrappers per domain
  pages/          Page components organised by domain
  types/          TypeScript interfaces
  routes/         React Router config
  layouts/        App shell + nav sidebar

context/kits/     Requirements documents (12 domains, 180+ acceptance criteria)
context/plans/    Build site — task dependency graph
```

## Running Locally

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- AWS credentials configured if you want S3/SES/Cognito to work (not required with `DEV_SKIP_AUTH=true`)

### 1. Install dependencies

```bash
npm install 
cd backend && npm install
```

### 2. Set environment variables

Copy the examples and fill in your values:

```bash
cp .env.example .env                  # frontend (VITE_API_URL, Cognito config)
cp backend/.env.example backend/.env  # backend (DATABASE_URL, AWS keys, etc.)
```

For local development, set `DEV_SKIP_AUTH=true` in `backend/.env` — this bypasses Cognito and treats every request as an authenticated Admin.

### 3. Start PostgreSQL

```bash
cd backend
docker-compose up -d
```

### 4. Run migrations

```bash
cd backend
npx prisma migrate dev --name init
```

Optionally seed sample data:

```bash
npm run db:seed
```

### 5. Start the backend

```bash
cd backend
npm run dev        # hot-reload dev server on http://localhost:3001
```

### 6. Start the frontend

```bash
npm run dev        # Vite dev server on http://localhost:3000
```

## Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `build/` |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema without a migration file |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Prisma Studio on port 5555 |
