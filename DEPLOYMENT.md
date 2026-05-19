# Deployment Guide — Fire Curtains Ltd CRM

## Architecture

| Component | Service | Notes |
|-----------|---------|-------|
| React frontend | **Vercel** | Auto-deploys from GitHub |
| Hono REST API | **Railway** | Auto-deploys from GitHub |
| PostgreSQL | **Railway** | Managed add-on, one click |
| Auth | **AWS Cognito** | Free up to 50k users, already coded |
| File storage | **AWS S3** | Presigned URL uploads |
| Email | **AWS SES** | Transactional email |

You use AWS for **services only** (auth, files, email) — not for hosting. Hosting is Railway + Vercel.

---

## Phase 1 — AWS: Cognito + S3 (one-time setup)

The `amplify/` directory already contains the Cognito and S3 resource definitions. Deploy them once:

```bash
npm install -g @aws-amplify/cli   # if not installed
amplify configure                  # link your AWS account
amplify push --yes
```

After the push, note from the Amplify console or `amplify status`:
- Cognito **User Pool ID**
- Cognito **App Client ID**
- **S3 bucket name**

**Add the custom role attribute** (not included in the Amplify config):
1. AWS Console → Cognito → your User Pool → **Attributes**
2. Add custom attribute: name `role`, type String, mutable ✓

---

## Phase 2 — AWS: SES Email

1. AWS Console → SES → **Verified identities** → Create identity → Domain
2. Add the DNS records it provides to your domain
3. **Request production access** — sandbox mode can only send to verified addresses; approval takes up to 24 hours

---

## Phase 3 — Railway: Database + Backend

### 3a. Create a Railway project

1. Go to [railway.app](https://railway.app) → New Project
2. **Add PostgreSQL** — click Add Service → Database → PostgreSQL
3. Once provisioned, open the PostgreSQL service → **Variables** tab → copy `DATABASE_URL`

### 3b. Deploy the backend

1. In the same Railway project → Add Service → **GitHub Repo**
2. Select your repository
3. In the service settings → **Root Directory** → set to `backend`
4. Railway will detect Node.js and run `npm ci && npm run build` automatically
5. The `railway.toml` in `backend/` handles the start command (`prisma migrate deploy && node dist/index.js`)

### 3c. Set environment variables

In the Railway backend service → **Variables** tab, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Paste from the Railway PostgreSQL service |
| `COGNITO_USER_POOL_ID` | From Phase 1 |
| `COGNITO_CLIENT_ID` | From Phase 1 |
| `AWS_REGION` | `eu-west-1` (or your region) |
| `AWS_ACCESS_KEY_ID` | IAM user key with S3 + SES access |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret |
| `S3_BUCKET_NAME` | From Phase 1 |
| `SES_FROM_ADDRESS` | `noreply@yourdomain.com` |
| `XERO_CLIENT_ID` | Your Xero app credentials |
| `XERO_CLIENT_SECRET` | Your Xero app credentials |
| `PORT` | `3001` |

After the first deploy succeeds, note the Railway backend URL — you'll need it in Phase 4.

### 3d. Seed the database (once)

After the first successful deploy, seed sample data using the Railway CLI:

```bash
npm install -g @railway/cli
railway login
railway link        # link to your project
railway run --service <backend-service-name> npm run db:seed
```

Or temporarily connect from your local machine:

```bash
cd backend
DATABASE_URL="<railway-postgres-url>" npm run db:seed
```

---

## Phase 4 — Vercel: Frontend

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import your GitHub repo
2. **Framework preset**: Vite (auto-detected)
3. **Root directory**: leave as `.` (project root)
4. **Build command**: `npm run build`
5. **Output directory**: `build`
6. The `vercel.json` at the project root handles SPA routing automatically

### Environment variables

In Vercel → your project → **Settings** → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway backend URL (e.g. `https://fire-curtains-api.up.railway.app`) |
| `VITE_COGNITO_USER_POOL_ID` | From Phase 1 |
| `VITE_COGNITO_CLIENT_ID` | From Phase 1 |
| `VITE_COGNITO_REGION` | `eu-west-1` |

Check `.env.example` for any additional `VITE_*` variables.

---

## Deployment Order Summary

1. `amplify push` → Cognito User Pool + S3 bucket created
2. Request SES production access
3. Railway → create project → add PostgreSQL → deploy backend from GitHub (`backend/` root) → set env vars
4. Vercel → import GitHub repo → set `VITE_API_URL` and Cognito vars → deploy
5. Seed the database once

---

## Re-deploying

**Backend** — push to the `main` branch. Railway auto-rebuilds and restarts. Prisma migrations run automatically on startup.

**Frontend** — push to the `main` branch. Vercel auto-rebuilds and deploys.

---

## IAM Permissions for S3 + SES

Create an IAM user in AWS Console → IAM → Users → Create user (programmatic access only). Attach these policies:

- `AmazonS3FullAccess` (or a scoped policy limited to your bucket)
- `AmazonSESFullAccess` (or `ses:SendRawEmail` scoped to your verified domain)

Use this user's access key and secret for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in Railway.
