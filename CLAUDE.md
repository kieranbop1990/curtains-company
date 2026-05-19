# Fire Curtains Ltd — CRM System

Internal operations CRM for managing the full job lifecycle: quotes → live projects → production → installation → services → assets.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI Components | **Mantine** (preferred for all new UI) |
| Backend API | Hono (Node.js), Prisma ORM |
| Database | PostgreSQL |
| Auth | AWS Cognito (JWT) |
| File Storage | AWS S3 (presigned URLs) |
| Email | AWS SES |
| Accounting | Xero API |

## UI Component Rule

**Use Mantine components for all new UI.** The existing codebase has MUI v5 installed — do not add new MUI usage. When building new screens, forms, tables, modals, and widgets, reach for Mantine equivalents:

| Need | Mantine Component |
|------|------------------|
| Layout | `AppShell`, `Grid`, `Stack`, `Group`, `Flex` |
| Data display | `Table`, `Badge`, `Card`, `Paper`, `Divider` |
| Inputs | `TextInput`, `Select`, `MultiSelect`, `DateInput`, `NumberInput`, `Switch`, `Checkbox` |
| Feedback | `Notification`, `Alert`, `Modal`, `Drawer`, `Tooltip` |
| Navigation | `Tabs`, `Breadcrumbs`, `NavLink`, `Stepper` |
| Charts | `@mantine/charts` (Recharts wrapper) |
| Forms | `useForm` from `@mantine/form` |
| Dates | `@mantine/dates` |
| Notifications | `@mantine/notifications` |

If a Mantine component does not exist for a specific need, use a lightweight standalone library rather than MUI.

## Project Structure

```
backend/          Hono API + Prisma + PostgreSQL
src/              React frontend (Vite)
context/kits/     Requirements (cavekits) — 12 domains, 180 requirements
context/plans/    Build site (task dependency graph)
context/refs/     Reference materials
```

## Auth

All `/api/*` routes require a valid Cognito JWT (`Authorization: Bearer <token>`). Six roles: Admin, Office/Operations, Engineer (Field), Finance/Accounts, Production, Customer.

## Key Workflow Rule

Every stage transition follows: **complete required actions → upload required evidence → receive approval → Send to Next Stage**. The "Send to Next Stage" button is disabled until all gates pass. Admin can override with audit log. See `context/kits/cavekit-workflow-engine.md`.