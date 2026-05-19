# Design System — Fire Curtains Ltd CRM

## Component Library

**Mantine** is the primary UI component library for all new development.

Install packages as needed:
```bash
npm install @mantine/core @mantine/hooks @mantine/form @mantine/dates @mantine/charts @mantine/notifications @mantine/modals
```

Do NOT add new MUI (`@mui/material`) usage. Existing MUI code may remain until refactored.

## Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#1C4ED8` (blue) | CTAs, active states, links |
| Success | `#16A34A` (green) | Completed, paid, approved |
| Warning | `#D97706` (amber) | In progress, pending, due soon |
| Danger | `#DC2626` (red) | Overdue, blocked, rejected, alerts |
| Neutral | `#64748B` (slate) | Labels, secondary text |
| Surface | `#F8FAFC` | Page backgrounds |
| Card | `#FFFFFF` | Card/panel backgrounds |

## Status Badge Colours

Consistent colour mapping across all stages and status values:

| Status | Colour | Mantine `color` |
|--------|--------|----------------|
| Active / Live / Approved / Paid | Green | `green` |
| In Progress / Pending / Due Soon | Amber | `yellow` |
| Overdue / Rejected / Blocked / Lost | Red | `red` |
| Not Started / Unknown / Draft | Grey | `gray` |
| Won / Complete | Blue | `blue` |
| New | Cyan | `cyan` |

## Layout

- **AppShell**: Use `AppShell` with a left navbar for the main CRM layout. Navbar collapsed to icons on mobile.
- **Page width**: max `1440px`, centred, `px={24}` on desktop, `px={16}` on mobile.
- **Spacing scale**: use Mantine's default spacing (xs=4, sm=8, md=16, lg=24, xl=32).
- **Cards/Panels**: Use `Paper` with `withBorder` and `radius="md"` for all content panels.

## Typography

- **Page title**: `Title order={2}`, `fw={700}`
- **Section heading**: `Title order={4}`, `fw={600}`
- **Label**: `Text size="sm" c="dimmed"`
- **Body**: `Text size="sm"`
- **KPI number**: `Title order={3}`, `fw={700}`

## Stage Progress Bar

Every Stage 1–6 screen has a progress bar at the top. Use Mantine `Stepper` with `active` set to the current stage index (0-based). Steps: Quotes → Live Project → Survey & Drawings → Production Pack → Manufacturing → Distribution.

## Stage Gate Button

The "Send to Next Stage" CTA is a full-width `Button` with `size="lg"` and `color="blue"`. When disabled (gates not met), use `disabled` prop and show a `Tooltip` listing unmet conditions.

## KPI Strip

Top-of-page metric tiles: use `SimpleGrid` with `cols={{ base: 2, sm: 4, lg: 8 }}`. Each tile is a `Paper` with `withBorder`, `radius="md"`, `p="md"` containing a `Text` label (dimmed, sm) and a `Title order={3}` value.

## Tables

Use Mantine `Table` with `striped`, `highlightOnHover`, `withTableBorder`, `withColumnBorders`. For large datasets add a `TextInput` search above the table with `leftSection={<IconSearch />}`.

## Forms

Use `@mantine/form`'s `useForm` hook. Group fields with `Stack gap="md"`. Use `Group justify="flex-end"` for action buttons at the bottom (Cancel left, Save/Submit right as primary).

## Modals and Drawers

- Short confirmations / quick-edits → `Modal` (size `md` or `lg`)
- Full detail views / multi-step flows → `Drawer` (position `right`, size `xl`)

## Mobile / Field Engineer View

- Stack layout (`Stack gap="md"`)
- Large touch targets: `Button size="xl"`, `TextInput size="lg"`
- Camera/upload actions: prominent full-width buttons
- Signature area: full-width bordered `Paper` with clear "Sign here" placeholder
- Day progress indicator: `Progress` component with label

## Charts

Use `@mantine/charts` (Recharts wrapper):
- Donut/pie breakdowns → `DonutChart`
- Bar charts → `BarChart`
- Status distributions → `DonutChart`

## Alerts Panel

Red/amber alert items: use `Alert` with `color="red"` or `color="yellow"`, `variant="light"`, `icon={<IconAlertCircle />}`.

## Audit Log / Activity Feed

Timestamped entries: use Mantine `Timeline` component with one `Timeline.Item` per entry. Actor name + timestamp in the `bullet` area.

## Document / File Lists

File attachments: use `List` with icon bullets (`<IconFile />`, `<IconPhoto />`). Upload action: `FileButton` component wrapping a `Button variant="outline"`.

## QR Codes

Display QR codes in a `Paper withBorder` at `128×128px` or `256×256px` depending on context.
