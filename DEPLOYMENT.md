# Deployment Guide — Fire Curtains Ltd CRM

## Architecture

| Component | Service |
|-----------|---------|
| React frontend | Railway (static via `serve`) |
| Hono REST API | Railway (Docker) |
| PostgreSQL | Railway (managed) |
| Auth | AWS Cognito (OIDC via `react-oidc-context`) |
| File storage | AWS S3 |
| Email | AWS SES |

---

## Phase 1 — AWS: Cognito (one-time setup)

Cognito is already provisioned. No Amplify CLI required — auth now uses the Cognito hosted UI via standard OIDC.

**Cognito details (eu-west-2):**
| Setting | Value |
|---------|-------|
| User Pool ID | `eu-west-2_DLWfbFCHS` |
| App Client ID | `3pfdfs2jjp33jvesvc353pc4ge` |
| Hosted UI domain | `https://eu-west-2dlwfbfchs.auth.eu-west-2.amazoncognito.com` |
| Region | `eu-west-2` |

**Add allowed callback URLs for each environment** (AWS Console → Cognito → `eu-west-2_DLWfbFCHS` → App clients → Edit hosted UI):
- `https://your-railway-web-domain.up.railway.app` — Railway production
- `http://localhost:5173` — local development

**Add the custom role attribute** if not already present:
1. AWS Console → Cognito → your User Pool → **Attributes**
2. Add custom attribute: name `role`, type String, mutable ✓

---

## Phase 2 — AWS: S3 + SES

### S3
Create a bucket for file uploads and note the bucket name.

### SES Email
1. AWS Console → SES → **Verified identities** → Create identity → Domain
2. Add the DNS records to your domain
3. **Request production access** — sandbox mode can only send to verified addresses

---

## Phase 3 — Railway: Full Stack Setup

### 3a. Install CLI and create project

```bash
npm install -g @railway/cli
railway login
railway init    # create a new project, name it "fire-curtains"
```

### 3b. Add PostgreSQL

```bash
railway add --database postgresql
# Railway provisions the DB and sets DATABASE_URL automatically
```

### 3c. Deploy the backend

```bash
# Deploy backend from the backend/ subdirectory
railway up ./backend --path-as-root --service api

# Set environment variables (DATABASE_URL is injected automatically — do not set it manually)
railway variable set COGNITO_USER_POOL_ID=eu-west-2_DLWfbFCHS --service api
railway variable set COGNITO_CLIENT_ID=3pfdfs2jjp33jvesvc353pc4ge --service api
railway variable set AWS_REGION=eu-west-2 --service api
railway variable set AWS_ACCESS_KEY_ID=your-key --service api
railway variable set AWS_SECRET_ACCESS_KEY=your-secret --service api
railway variable set S3_BUCKET_NAME=your-bucket --service api
railway variable set SES_FROM_ADDRESS=noreply@yourdomain.com --service api
railway variable set XERO_CLIENT_ID=your-xero-id --service api
railway variable set XERO_CLIENT_SECRET=your-xero-secret --service api
```

Get the backend's public URL:
```bash
railway domain --service api
# Copy the generated https:// URL — you need it for the frontend VITE_API_URL
```

### 3d. Deploy the frontend

VITE_* variables are baked into the bundle at build time — set them **before** deploying.

```bash
# Set build-time env vars first
railway variable set VITE_API_URL=https://your-api-domain.up.railway.app --service web --skip-deploys
railway variable set VITE_AWS_COGNITO_REGION=eu-west-2 --service web --skip-deploys
railway variable set VITE_AWS_USER_POOLS_ID=eu-west-2_DLWfbFCHS --service web --skip-deploys
railway variable set VITE_AWS_USER_POOLS_WEB_CLIENT_ID=3pfdfs2jjp33jvesvc353pc4ge --service web --skip-deploys
railway variable set VITE_COGNITO_DOMAIN=https://eu-west-2dlwfbfchs.auth.eu-west-2.amazoncognito.com --service web --skip-deploys

# Deploy (vars are now baked in)
railway up . --service web
```

After the first deploy, get the Railway web URL and add it to Cognito's allowed callback URLs (see Phase 1).

### 3e. Seed the database

`railway run` injects Railway's environment variables into a local shell process:

```bash
railway run --service api npm run db:seed
```

---

## Checking status and logs

```bash
# Overall project status
railway status

# Stream live logs
railway logs --service api
railway logs --service web

# Build logs only
railway logs --service api --build

# What variables are set
railway variable list --service api --kv
railway variable list --service web --kv
```

---

## Re-deploying

```bash
# Rebuild and redeploy from source
railway up ./backend --path-as-root --service api
railway up . --service web

# Restart without rebuilding (config-only changes)
railway restart --service api
```

---

## IAM Permissions for S3 + SES

Create an IAM user (programmatic access only) and attach:
- `AmazonS3FullAccess` (or a policy scoped to your bucket)
- `AmazonSESFullAccess` (or `ses:SendRawEmail` scoped to your domain)

Use this user's key and secret for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

---

## Deployment order summary

1. Verify Cognito allowed callback URLs include the Railway domain
2. Request SES production access
3. `railway init` → create project
4. `railway add --database postgresql`
5. Deploy backend → set env vars → get API domain
6. Set `VITE_*` vars → `railway up . --service web`
7. `railway run --service api npm run db:seed`

## Environment variable reference

### Backend (`--service api`)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Auto-injected by Railway |
| `COGNITO_USER_POOL_ID` | `eu-west-2_DLWfbFCHS` |
| `COGNITO_CLIENT_ID` | `3pfdfs2jjp33jvesvc353pc4ge` |
| `AWS_REGION` | `eu-west-2` |
| `AWS_ACCESS_KEY_ID` | From IAM user |
| `AWS_SECRET_ACCESS_KEY` | From IAM user |
| `S3_BUCKET_NAME` | Your S3 bucket name |
| `SES_FROM_ADDRESS` | Your verified sender address |
| `XERO_CLIENT_ID` | From Xero developer portal |
| `XERO_CLIENT_SECRET` | From Xero developer portal |

### Frontend (`--service web`)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Railway API service URL |
| `VITE_AWS_COGNITO_REGION` | `eu-west-2` |
| `VITE_AWS_USER_POOLS_ID` | `eu-west-2_DLWfbFCHS` |
| `VITE_AWS_USER_POOLS_WEB_CLIENT_ID` | `3pfdfs2jjp33jvesvc353pc4ge` |
| `VITE_COGNITO_DOMAIN` | `https://eu-west-2dlwfbfchs.auth.eu-west-2.amazoncognito.com` |
