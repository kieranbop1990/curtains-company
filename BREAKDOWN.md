# Feature Breakdown — Requirements Gap Implementation

This document summarises every feature added to close the gap between the requirements document and the built CRM. All changes are frontend (React/TypeScript/Mantine 9). Backend API endpoints are wired up and ready; the corresponding Hono routes need to be implemented to serve real data.

---

## Stage 4 — Production Pack Generator

### 1. Formula Configuration (Admin Lock)

**What was built:**
A "Formula Config" button in the Production Pack header opens a two-step modal. Step 1 requires an admin passphrase (`FIRECURTAIN`) before any constants are visible. On successful unlock, Step 2 shows six editable formula constants — three for NECO DC80 (side channel deduction, header allowance, bottom bar deduction) and three for CSV — with a yellow warning before saving. A "Lock & Close" button resets to the passphrase screen.

**Why it matters:** The requirements explicitly state formulas must be locked and only editable by admin with a code. This prevents factory cutting errors caused by accidental formula changes.

**Files changed:** `src/pages/dashboard/live-projects/production-pack.tsx`, `src/api/production-pack.ts`
**Backend endpoint needed:** `POST /api/production-packs/formula-config`

---

### 2. Production Specification Sheet Tab

**What was built:**
A new "Spec Sheet" tab on the production pack system view. Shows a read-only summary of the system: family, variant, width × height, barrel diameter (Ø89mm for DC80, Ø100mm for CSV), customer-supplied flag, accessories count, manual/warranty card inclusion, and pack reference. A "Download Spec Sheet PDF" button calls the existing PDF download infrastructure.

**Why it matters:** The spec sheet is a required output document that travels with each manufactured system to the factory floor.

**Files changed:** `src/pages/dashboard/live-projects/production-pack.tsx`
**Backend endpoint needed:** `GET /api/production-packs/:packId/systems/:systemId/pdf/spec-sheet`

---

### 3. QC Forms Tab

**What was built:**
A new "QC Forms" tab with a 10-item checklist per system (dimensions verified, barrel diameter confirmed, cutting list checked, fabric type correct, motor installed, control panel wired, manual override tested, drop test completed, labelled correctly, signed off by QC). A progress bar shows completion percentage. A green "QC Complete" badge appears when all items are checked. QC state is kept per-system using the system ID as the key. A "Download QC PDF" button triggers the backend PDF endpoint.

**Why it matters:** QC forms are a required production pack output and must be completed before a system ships.

**Files changed:** `src/pages/dashboard/live-projects/production-pack.tsx`
**Backend endpoint needed:** `GET /api/production-packs/:packId/systems/:systemId/pdf/qc-form`

---

### 4. Packing List Tab

**What was built:**
A new "Packing List" tab that auto-derives its content from the system's cutting list and accessories. Each cutting list item appears as a component row (qty 1), each accessory with qty > 0 appears as an accessory row, and instruction manual/warranty card appear as document rows if enabled. A "Download Packing List PDF" button is provided.

**Why it matters:** Packing lists are required to accompany every shipment and prevent missing components on site.

**Files changed:** `src/pages/dashboard/live-projects/production-pack.tsx`
**Backend endpoint needed:** `GET /api/production-packs/:packId/systems/:systemId/pdf/packing-list`

---

### 5. Labels & Box Labels Tab

**What was built:**
A new "Labels" tab showing two visual label previews rendered in Mantine Paper cards — a system label (variant, dimensions, barrel diameter, serial reference, QR code placeholder) and a box label (product description, dimensions, pack reference, red "HEAVY — HANDLE WITH CARE" badge, company name). A "Print Labels" button downloads the PDF from the backend.

**Why it matters:** Labels and box labels are required production pack outputs for factory tracking and shipping.

**Files changed:** `src/pages/dashboard/live-projects/production-pack.tsx`
**Backend endpoint needed:** `GET /api/production-packs/:packId/systems/:systemId/pdf/labels`

---

### 6. Stock & Purchase Requirements Tab

**What was built:**
A new "Stock & Purchasing" tab that aggregates cutting list items and accessories into a stock requirements table (component, required qty, unit, notes). A total line items row is shown at the bottom. A "Download Stock Requirements" PDF button is provided. A "Create Purchase Order" button is shown (disabled with tooltip — backend integration pending).

**Why it matters:** Stock and purchase requirements are required outputs to trigger procurement and warehouse pick-lists.

**Files changed:** `src/pages/dashboard/live-projects/production-pack.tsx`
**Backend endpoint needed:** `GET /api/production-packs/:packId/systems/:systemId/pdf/stock-requirements`, `POST /api/purchase-orders`

---

## Asset Management (LS Jobs / AST Assets)

### 7. Automatic Next-Service Date Calculation

**What was built:**
Removed the manual `nextServiceDate` and `renewalAlertDate` text inputs from the Service & Maintenance tab. Both are now computed automatically: `nextServiceDate = lastServiceDate + serviceFrequencyMonths`, `renewalAlertDate = nextServiceDate - 30 days`. The fields are shown as read-only with a description explaining they are auto-calculated. When either `lastServiceDate` or `serviceFrequencyMonths` changes on blur, the new dates are computed and saved to the API immediately. The header countdown banner updates accordingly.

**Why it matters:** The requirements state the CRM must automatically calculate service due dates — manual entry was error-prone and could cause missed service visits.

**Files changed:** `src/pages/dashboard/assets/detail.tsx`

---

### 8. Service Event Creation UI (Log Service Event)

**What was built:**
A "Log Service Event" button added above the Service History table in the Service & Maintenance tab. Opens a modal with fields for: service date (required), engineer name, company, summary/work done (textarea), and outcome (PASS / FAIL / ADVISORY / PARTS_REQUIRED dropdown). On submit, calls `assetsApi.addServiceEvent()` and reloads the asset to update the history table. The "Log Activity / Note" and "Report Fault / Repair" Quick Action buttons (previously disabled) now both open this same modal.

**Why it matters:** The service history table existed but had no way to add new entries — this closes that loop.

**Files changed:** `src/pages/dashboard/assets/detail.tsx`

---

## Field / Site View (Stage 6D)

### 9. Real-Time Sync Indicator (SSE)

**What was built:**
On mount, the field engineer job page opens a Server-Sent Events connection to `/api/field-engineer/my-jobs/:djId/events`. If it connects successfully, a green "Live sync" dot badge is shown next to the online/offline indicator. If it errors or the device is offline, a gray "Sync offline" badge is shown instead. The EventSource is cleaned up on unmount.

**Why it matters:** The requirements state the field view must feed live updates back to the office view. This wires the client side of that connection — the backend SSE stream needs to broadcast when `submitDay` is called.

**Files changed:** `src/pages/field-engineer/job.tsx`
**Backend endpoint needed:** `GET /api/field-engineer/my-jobs/:djId/events` (SSE stream)

---

### 10. RAMS & Drawings Tab

**What was built:**
A new "RAMS & Drawings" tab added to the field engineer job view. If the job has `ramsUploaded` set, a table shows three rows (RAMS Pack, Method Statement, Risk Assessment) each with an "Uploaded" status badge and a Download button that fetches presigned URLs from `fieldEngineerApi.getRams()`. If RAMS have not been uploaded, a yellow alert says "RAMS documents have not been uploaded yet. Contact the office."

**Why it matters:** Engineers need access to RAMS documents on site to comply with health & safety requirements before starting work.

**Files changed:** `src/pages/field-engineer/job.tsx`, `src/api/field-engineer.ts`
**Backend endpoint needed:** `GET /api/field-engineer/my-jobs/:djId/rams`

---

### 11. Report Site Issue

**What was built:**
A "Report Site Issue" button (red, outlined) added in the Job tab between the site details panel and the Submit Day panel. Opens a modal with a description textarea (required), severity dropdown (LOW / MEDIUM / HIGH / CRITICAL), and an optional photo attach using a hidden camera input. On submit, calls `fieldEngineerApi.reportIssue()`. A green success alert "Issue reported. Office has been notified." appears for 3 seconds after submission.

**Why it matters:** Engineers have no way to formally flag site problems back to the office mid-job. This closes that gap.

**Files changed:** `src/pages/field-engineer/job.tsx`, `src/api/field-engineer.ts`
**Backend endpoint needed:** `POST /api/field-engineer/my-jobs/:djId/issues`

---

### 12. Digital Signature Capture

**What was built:**
Replaced the customer signature textarea with a canvas-based signature pad (no new npm packages). Engineers draw on the canvas with mouse or touch. The pad exports as a base64 PNG on each stroke-end via `canvas.toDataURL()`. A "Clear" button resets the canvas. The signature data URL is sent to the backend as `signatureDataUrl` in the `submitDay` payload alongside the existing `customerSignature` field.

**Why it matters:** A text field for customer sign-off is not a valid legal record. A captured digital signature image can be stored and attached to job records as evidence.

**Files changed:** `src/pages/field-engineer/job.tsx`, `src/api/field-engineer.ts`

---

## Backend Endpoints Still Needed

The following Hono API routes need to be created to complete each feature end-to-end:

| Endpoint | Feature |
|----------|---------|
| `POST /api/production-packs/formula-config` | Save formula constants |
| `GET /api/production-packs/:id/systems/:sid/pdf/spec-sheet` | Spec sheet PDF |
| `GET /api/production-packs/:id/systems/:sid/pdf/qc-form` | QC form PDF |
| `GET /api/production-packs/:id/systems/:sid/pdf/packing-list` | Packing list PDF |
| `GET /api/production-packs/:id/systems/:sid/pdf/labels` | Labels PDF |
| `GET /api/production-packs/:id/systems/:sid/pdf/stock-requirements` | Stock requirements PDF |
| `GET /api/field-engineer/my-jobs/:djId/events` | SSE stream for live sync |
| `GET /api/field-engineer/my-jobs/:djId/rams` | RAMS presigned URLs |
| `POST /api/field-engineer/my-jobs/:djId/issues` | Submit site issue |
