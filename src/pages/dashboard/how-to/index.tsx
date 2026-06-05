import {
  Container, Title, Text, Tabs, Timeline, ThemeIcon, Badge, Group, Stack,
  Paper, Grid, Box, List, Divider, rem,
} from '@mantine/core';
import {
  IconFileText, IconBuildingFactory2, IconTruck, IconTool,
  IconShieldCheck, IconCurrencyPound, IconCamera, IconBell,
  IconClipboardCheck, IconArrowRight, IconUsers, IconPackage,
  IconCircleCheck, IconUpload, IconAlertCircle, IconStar,
  IconHammer, IconCalendar, IconMap2,
} from '@tabler/icons-react';

// ─── Shared sub-components ──────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colours: Record<string, string> = {
    Admin: 'red',
    'Office / Ops': 'blue',
    Finance: 'green',
    Production: 'orange',
    'Field Engineer': 'violet',
    Customer: 'gray',
  };
  return <Badge size="xs" color={colours[role] ?? 'gray'} variant="light">{role}</Badge>;
}

function StageCard({
  number, title, description, icon, roles, bullets,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  roles: string[];
  bullets?: string[];
}) {
  return (
    <Paper withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'visible' }}>
      <Box
        style={{
          position: 'absolute', top: -14, left: 16,
          background: 'var(--mantine-color-blue-6)',
          color: 'white', borderRadius: '50%',
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
        }}
      >
        {number}
      </Box>
      <Group gap="sm" mt={4} mb="xs" wrap="nowrap">
        <ThemeIcon size="lg" radius="md" variant="light" color="blue">
          {icon}
        </ThemeIcon>
        <div>
          <Text fw={600} size="sm">{title}</Text>
          <Text size="xs" c="dimmed">{description}</Text>
        </div>
      </Group>
      {bullets && bullets.length > 0 && (
        <List size="xs" spacing={4} c="dimmed" mt="xs"
          icon={<ThemeIcon size={14} radius="xl" color="blue" variant="light"><IconCircleCheck size={10} /></ThemeIcon>}>
          {bullets.map(b => <List.Item key={b}>{b}</List.Item>)}
        </List>
      )}
      <Group gap={4} mt="sm">
        {roles.map(r => <RoleBadge key={r} role={r} />)}
      </Group>
    </Paper>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Group gap="xs" mb="md">
      <ThemeIcon size="sm" color="blue" variant="transparent">
        <IconArrowRight size={14} />
      </ThemeIcon>
      <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: 1 }}>
        {children}
      </Text>
    </Group>
  );
}

// ─── Workflow tabs ───────────────────────────────────────────────────────────

function QuotePipelineTab() {
  return (
    <Stack gap="xl">
      <Paper withBorder p="lg" radius="md" bg="blue.0">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" color="blue" variant="light">
            <IconFileText size={22} />
          </ThemeIcon>
          <div>
            <Title order={4}>Quote → Live Project Pipeline</Title>
            <Text size="sm" c="dimmed">The full journey from first enquiry through to a routed Stage 4 job</Text>
          </div>
        </Group>
      </Paper>

      <SectionHeading>Stage 1 — Quote</SectionHeading>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StageCard number={1} title="Create a Quote" description="Log the customer enquiry and scope"
            icon={<IconFileText size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Enter customer name and contact details', 'Add curtain systems with sizes and spec', 'Attach survey drawings if available', 'Quote is saved as Draft']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StageCard number={2} title="Submit for Approval" description="Price and issue to the customer"
            icon={<IconCurrencyPound size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Verify pricing and margins', 'Mark as Submitted — customer notified', 'Chase if no response within target days']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StageCard number={3} title="Convert to Live Quote" description="Customer accepted — creates Stage 2 record"
            icon={<IconClipboardCheck size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Mark quote as Won', 'Live Project (LQ) record created automatically', 'Stage 2 opens in Live Projects']} />
        </Grid.Col>
      </Grid>

      <SectionHeading>Stage 2 — Live Quote (LQ)</SectionHeading>
      <Text size="sm" c="dimmed">Fill in all project details. The sidebar shows the gate checklist. The "Ready to move to Stage 3" button is locked until all three pass.</Text>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StageCard number={1} title="Project Details" description="Fill in the core record"
            icon={<IconFileText size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Customer name (required)', 'Set total contract value (required)', 'Assign a staff member (required)', 'Payment terms, VAT, site address']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StageCard number={2} title="Financial Management" description="Invoices and Xero sync"
            icon={<IconCurrencyPound size={18} />} roles={['Admin', 'Office / Ops', 'Finance']}
            bullets={['Add invoice records with number, amount, due date', 'Upload invoice PDF against each record', 'Sync with Xero to auto-update PAID/OVERDUE status', 'Track paid to date and outstanding balance']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StageCard number={3} title="Key Controls" description="Tick off as each action is completed"
            icon={<IconClipboardCheck size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Purchase Order received', 'Drawings received', 'Deposit paid', 'Survey booked', 'Contract approved']} />
        </Grid.Col>
      </Grid>
      <Paper withBorder p="md" radius="md" bg="yellow.0">
        <Group gap="xs" mb={4}>
          <IconAlertCircle size={16} color="var(--mantine-color-yellow-7)" />
          <Text size="sm" fw={600}>Stage 2 Gate — must all pass to advance</Text>
        </Group>
        <List size="sm" spacing={4} c="dimmed"
          icon={<ThemeIcon size={14} radius="xl" color="yellow" variant="light"><IconCircleCheck size={10} /></ThemeIcon>}>
          <List.Item>Customer name entered</List.Item>
          <List.Item>Contract value set</List.Item>
          <List.Item>Assignee selected</List.Item>
        </List>
      </Paper>

      <SectionHeading>Stage 3 — Survey & Drawings (SD)</SectionHeading>
      <Text size="sm" c="dimmed">Complete the survey, upload and approve drawings, get customer sign-off, and list components. All four gates must pass before routing to Stage 4.</Text>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StageCard number={1} title="Survey Record" description="Log the survey details"
            icon={<IconCalendar size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Survey date, surveyor name, method', 'Access type noted', 'Tick "Customer signed off survey"']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StageCard number={2} title="Drawings Package" description="Upload and approve drawings"
            icon={<IconUpload size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Add drawing with reference number', 'Click the upload icon to attach the PDF/DWG file', 'Change status to APPROVED once reviewed', 'At least one approved drawing with a file is required']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StageCard number={3} title="Customer Sign-Off" description="Get formal customer approval"
            icon={<IconShieldCheck size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Set sign-off status to Customer Approved', 'Log approval date and any comments']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StageCard number={4} title="Components" description="List what needs to be made"
            icon={<IconPackage size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Add each curtain system as a component', 'Set qty and stock status', 'At least one component required']} />
        </Grid.Col>
      </Grid>
      <Paper withBorder p="md" radius="md" bg="yellow.0">
        <Group gap="xs" mb={4}>
          <IconAlertCircle size={16} color="var(--mantine-color-yellow-7)" />
          <Text size="sm" fw={600}>Stage 3 Gate — must all pass to route to Stage 4</Text>
        </Group>
        <List size="sm" spacing={4} c="dimmed"
          icon={<ThemeIcon size={14} radius="xl" color="yellow" variant="light"><IconCircleCheck size={10} /></ThemeIcon>}>
          <List.Item>Survey signed off</List.Item>
          <List.Item>At least one drawing with status APPROVED <strong>and</strong> a file uploaded</List.Item>
          <List.Item>Review status = Customer Approved</List.Item>
          <List.Item>At least one component listed</List.Item>
        </List>
      </Paper>

      <SectionHeading>Stage 4 — Routing Decision</SectionHeading>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <StageCard number={1} title="Stage 4A — Production Pack" description="New curtain systems to be manufactured"
            icon={<IconBuildingFactory2 size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Click "Send to Stage 4A" once gates pass', 'Production Pack is created automatically', '"Create & Open Production Pack" button appears', 'Navigates directly to the pack to configure systems']} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <StageCard number={2} title="Stage 4B — Live Services" description="Service or maintenance job for existing install"
            icon={<IconTool size={18} />} roles={['Admin', 'Office / Ops']}
            bullets={['Click "Send to Stage 4B" once gates pass', '"Go to Service Operations" button appears', 'Navigate to Service Operations and create the LS record', 'Link back to this LQ reference']} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function ProductionTab() {
  return (
    <Stack gap="xl">
      <Paper withBorder p="lg" radius="md" bg="orange.0">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" color="orange" variant="light">
            <IconBuildingFactory2 size={22} />
          </ThemeIcon>
          <div>
            <Title order={4}>Production Pack → Manufacturing</Title>
            <Text size="sm" c="dimmed">How curtain systems get built and QC'd before leaving the factory</Text>
          </div>
        </Group>
      </Paper>

      <SectionHeading>Stages</SectionHeading>

      <Timeline active={-1} bulletSize={32} lineWidth={2} color="orange">
        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="orange" variant="light"><IconPackage size={16} /></ThemeIcon>}
          title={<Text fw={600}>Create Production Pack</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Created from the Live Project detail page once Stage 3 is reached. One pack per project — contains all curtain systems to be manufactured.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="orange" variant="light"><IconHammer size={16} /></ThemeIcon>}
          title={<Text fw={600}>Configure Systems — Select Family & Variant</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Each curtain system is added with its system family (<strong>NECO DC80</strong> or <strong>CSV</strong>), variant (DC80-10/25/40 or Single/Double barrel), and overall dimensions. The cutting list is computed automatically from locked formula constants.
          </Text>
          <List size="xs" c="dimmed" mt={6} spacing={2}>
            <List.Item>NECO DC80: barrel Ø89 mm — variants DC80-10, DC80-25, DC80-40</List.Item>
            <List.Item>CSV: barrel Ø100 mm — single or double/multiple barrel</List.Item>
          </List>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="orange" variant="light"><IconPackage size={16} /></ThemeIcon>}
          title={<Text fw={600}>Generate Production Pack Documents</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Each system generates a full set of output documents from its own tabs. All are downloadable as PDFs:
          </Text>
          <List size="xs" c="dimmed" mt={6} spacing={2}>
            <List.Item><strong>Spec Sheet</strong> — production specification with barrel diameter, dimensions, accessories summary</List.Item>
            <List.Item><strong>QC Forms</strong> — 10-item checklist; progress bar tracks completion per system</List.Item>
            <List.Item><strong>Packing List</strong> — auto-derived from cutting list + accessories + documents</List.Item>
            <List.Item><strong>Labels & Box Labels</strong> — visual preview; print-ready PDFs with QR code</List.Item>
            <List.Item><strong>Stock & Purchasing</strong> — aggregated requirements table for warehouse and procurement</List.Item>
          </List>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="orange" variant="light"><IconClipboardCheck size={16} /></ThemeIcon>}
          title={<Text fw={600}>Formula Config — Admin Only</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            The cutting list formulas (deductions, allowances) are locked. Only an Admin can modify them via the <strong>Formula Config</strong> button in the pack header, which requires an admin passphrase. All changes are audit-logged.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="orange" variant="light"><IconBuildingFactory2 size={16} /></ThemeIcon>}
          title={<Text fw={600}>Manufacturing Job Created</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            When the pack is sent to Stage 5, a Manufacturing Job is automatically created. The production team picks this up in the Manufacturing queue.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="orange" variant="light"><IconClipboardCheck size={16} /></ThemeIcon>}
          title={<Text fw={600}>Advance Through Manufacturing Statuses</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            The job moves through statuses: <strong>Scheduled → In Progress → QC → Complete</strong>. At each stage, QC checkpoints must be signed off before advancing.
          </Text>
          <List size="xs" c="dimmed" mt={6} spacing={2}>
            <List.Item>Tick off QC checkpoints for each system</List.Item>
            <List.Item>Upload QC evidence photos if required</List.Item>
            <List.Item>Add or update components as work progresses</List.Item>
          </List>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="green" variant="light"><IconCircleCheck size={16} /></ThemeIcon>}
          title={<Text fw={600}>Manufacturing Complete</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Job is marked Complete. The Distribution team is notified and a Distribution Job can now be raised.
          </Text>
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
}

function DistributionTab() {
  return (
    <Stack gap="xl">
      <Paper withBorder p="lg" radius="md" bg="violet.0">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" color="violet" variant="light">
            <IconTruck size={22} />
          </ThemeIcon>
          <div>
            <Title order={4}>Distribution & Installation</Title>
            <Text size="sm" c="dimmed">Logistics, on-site work, and final sign-off</Text>
          </div>
        </Group>
      </Paper>

      <SectionHeading>Stages</SectionHeading>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="sm">
            <StageCard
              number={1}
              title="Create Distribution Job"
              description="Plan the delivery and installation"
              icon={<IconTruck size={18} />}
              roles={['Admin', 'Office / Ops']}
              bullets={[
                'Link to the completed manufacturing job',
                'Set delivery date and site address',
                'Assign lead engineer and team',
              ]}
            />
            <StageCard
              number={2}
              title="Assign Engineers"
              description="Allocate field engineers to the job"
              icon={<IconUsers size={18} />}
              roles={['Admin', 'Office / Ops']}
              bullets={[
                'Add engineers from the staff directory',
                'Set their role on the job (lead / support)',
                'Engineers see it in their Field Engineer app',
              ]}
            />
            <StageCard
              number={3}
              title="Set Milestones"
              description="Track key on-site progress points"
              icon={<IconCalendar size={18} />}
              roles={['Admin', 'Office / Ops']}
              bullets={[
                'Add milestones: delivery, first fix, second fix, commissioning',
                'Mark each complete as the job progresses',
              ]}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="sm">
            <StageCard
              number={4}
              title="Upload Site Documents"
              description="RAMS, signoff sheets, certificates"
              icon={<IconUpload size={18} />}
              roles={['Admin', 'Office / Ops', 'Field Engineer']}
              bullets={[
                'Upload RAMS before work starts',
                'Customer signoff sheet after completion',
                'Proof of collection / delivery',
              ]}
            />
            <StageCard
              number={5}
              title="Generate POC / POD"
              description="Official proof documents"
              icon={<IconShieldCheck size={18} />}
              roles={['Admin', 'Office / Ops']}
              bullets={[
                'Generate Proof of Collection PDF',
                'Generate Proof of Delivery PDF',
                'Documents stored in S3 and linked to the job',
              ]}
            />
            <StageCard
              number={6}
              title="Financial Release"
              description="Approve for invoicing"
              icon={<IconCurrencyPound size={18} />}
              roles={['Admin', 'Finance']}
              bullets={[
                'Finance reviews the completed job',
                'Approve release — triggers invoice workflow',
                'Release certificates issued to customer',
              ]}
            />
          </Stack>
        </Grid.Col>
      </Grid>

      <Divider label="Field Engineer View" labelPosition="left" />

      <Paper withBorder p="md" radius="md" bg="violet.0">
        <Group gap="sm" mb="sm">
          <ThemeIcon size="lg" color="violet" variant="light" radius="md">
            <IconCamera size={18} />
          </ThemeIcon>
          <Text fw={600} size="sm">What the field engineer sees (Stage 6D — mobile view)</Text>
        </Group>
        <List size="sm" spacing={6} c="dimmed"
          icon={<ThemeIcon size={16} radius="xl" color="violet" variant="light"><IconCircleCheck size={10} /></ThemeIcon>}>
          <List.Item>Opens <strong>/field-engineer</strong> on their phone — works offline, syncs when signal returns</List.Item>
          <List.Item>Sees only the jobs assigned to them; taps into a job for full day-by-day view</List.Item>
          <List.Item><strong>Systems tab</strong> — marks each system NOT_STARTED → IN_PROGRESS → INSTALLED with installation notes</List.Item>
          <List.Item><strong>Media tab</strong> — takes photos/video with camera; tagged by media type (installation evidence, sign-off, etc.); queued offline and uploaded on reconnect</List.Item>
          <List.Item><strong>RAMS & Drawings tab</strong> — view and download RAMS Pack, Method Statement, Risk Assessment uploaded by the office</List.Item>
          <List.Item><strong>Report Issue</strong> — flag a site problem with severity (Low/Medium/High/Critical) and optional photo; office is emailed immediately and it's logged to the audit trail</List.Item>
          <List.Item><strong>Customer signature</strong> — captured on a digital signature canvas (not a text field); stored as PNG with the day submission</List.Item>
          <List.Item><strong>Submit Day</strong> — finalises the day record; a progress step is added to the office view and live sync badge shows the connection is active</List.Item>
        </List>
      </Paper>
    </Stack>
  );
}

function ServiceTab() {
  return (
    <Stack gap="xl">
      <Paper withBorder p="lg" radius="md" bg="teal.0">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" color="teal" variant="light">
            <IconTool size={22} />
          </ThemeIcon>
          <div>
            <Title order={4}>Service Operations</Title>
            <Text size="sm" c="dimmed">Reactive call-outs and planned maintenance for existing customers</Text>
          </div>
        </Group>
      </Paper>

      <SectionHeading>Stages</SectionHeading>

      <Timeline active={-1} bulletSize={32} lineWidth={2} color="teal">
        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="teal" variant="light"><IconFileText size={16} /></ThemeIcon>}
          title={<Text fw={600}>Raise a Service Quote</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Log the service request — reactive call-out or planned maintenance visit. Attach the asset(s) being serviced and describe the scope of work.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="teal" variant="light"><IconCurrencyPound size={16} /></ThemeIcon>}
          title={<Text fw={600}>Price and Issue</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Add labour, parts, and travel costs. Upload the Xero quote PDF if billing through Xero. Advance through Draft → Submitted.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="teal" variant="light"><IconArrowRight size={16} /></ThemeIcon>}
          title={<Text fw={600}>Convert to Live Service</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Once accepted, convert the service quote to a Live Service. This creates a scheduled visit record linked to the asset.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="teal" variant="light"><IconCalendar size={16} /></ThemeIcon>}
          title={<Text fw={600}>Schedule and Attend</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Set the visit date. Engineers attend site, carry out the work. Field engineer app can be used for photo capture and day reports.
          </Text>
          <Group gap={4} mt={6}><RoleBadge role="Admin" /><RoleBadge role="Office / Ops" /><RoleBadge role="Field Engineer" /></Group>
        </Timeline.Item>

        <Timeline.Item
          bullet={<ThemeIcon size={28} radius="xl" color="green" variant="light"><IconCircleCheck size={16} /></ThemeIcon>}
          title={<Text fw={600}>Complete and Update Asset</Text>}
        >
          <Text size="sm" c="dimmed" mt={4}>
            Mark the Live Service complete. A service event is automatically logged against the asset record, updating its maintenance history and resetting renewal dates where applicable.
          </Text>
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
}

function AssetsTab() {
  return (
    <Stack gap="xl">
      <Paper withBorder p="lg" radius="md" bg="green.0">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" color="green" variant="light">
            <IconShieldCheck size={22} />
          </ThemeIcon>
          <div>
            <Title order={4}>Asset Management</Title>
            <Text size="sm" c="dimmed">Track installed fire curtain systems throughout their lifecycle</Text>
          </div>
        </Group>
      </Paper>

      <SectionHeading>What is an asset?</SectionHeading>
      <Text size="sm" c="dimmed">
        Every installed fire curtain system becomes an Asset record once the project completes. Assets are the long-term record of what's installed where, who owns it, and when it needs servicing or replacing.
      </Text>

      <SectionHeading>Key things you can do</SectionHeading>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon size="md" color="green" variant="light" radius="md"><IconBell size={16} /></ThemeIcon>
              <Text fw={600} size="sm">Renewal Reminders</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Set a renewal date on each asset. The system automatically sends email reminders to the customer contact at configured intervals before expiry. Manually trigger a reminder at any time from the asset detail page.
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon size="md" color="green" variant="light" radius="md"><IconUpload size={16} /></ThemeIcon>
              <Text fw={600} size="sm">Document Storage</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Attach any number of documents to an asset — commissioning certificates, maintenance reports, compliance docs. Documents are stored in S3 and accessible at any time from the asset record.
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon size="md" color="green" variant="light" radius="md"><IconTool size={16} /></ThemeIcon>
              <Text fw={600} size="sm">Service History & Logging</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Every completed Live Service logs an event against the asset automatically. Use <strong>Log Service Event</strong> (in the Service & Maintenance tab or Quick Actions) to manually record ad-hoc visits — enter the engineer, date, summary, and outcome (Pass / Fail / Advisory / Parts Required).
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon size="md" color="green" variant="light" radius="md"><IconUsers size={16} /></ThemeIcon>
              <Text fw={600} size="sm">Customer Contacts</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Link one or more contacts to each asset — the people who receive renewal reminders and service notifications. Contacts can be added, updated, or removed at any time.
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="md" bg="green.0">
        <Group gap="xs" mb={4}>
          <IconAlertCircle size={16} color="var(--mantine-color-green-7)" />
          <Text size="sm" fw={600}>Automatic Service Date Calculation</Text>
        </Group>
        <Text size="sm" c="dimmed">
          Set a <strong>Service Frequency (months)</strong> and a <strong>Last Service Date</strong> — the system automatically calculates <strong>Next Service Date</strong> and a <strong>Renewal Alert Date</strong> (30 days before next service). These fields are read-only and update whenever the frequency or last service date changes. The asset status badge (LIVE_ACTIVE / SERVICE_DUE / OVERDUE) and the countdown header are driven by these computed dates.
        </Text>
      </Paper>
    </Stack>
  );
}

function RolesTab() {
  const roles = [
    {
      name: 'Admin',
      color: 'red',
      description: 'Full access to everything. Can perform all actions across all workflows.',
      can: ['Create, edit, delete any record', 'Access formula/admin tools', 'View audit logs', 'Override stage gates', 'Manage staff and parts'],
    },
    {
      name: 'Office / Operations',
      color: 'blue',
      description: 'Day-to-day CRM users. Manages the full job lifecycle from quote to distribution.',
      can: ['Full quote and project pipeline', 'Service operations', 'Asset management', 'Distribution and manufacturing visibility', 'Staff management', 'Audit logs'],
    },
    {
      name: 'Finance / Accounts',
      color: 'green',
      description: 'Financial sign-off and invoice approval. Read access to most records.',
      can: ['Approve distribution financial release', 'Issue release certificates', 'Read parts and staff directory'],
    },
    {
      name: 'Production',
      color: 'orange',
      description: 'Factory floor access. Works in the Manufacturing queue and Parts Library.',
      can: ['View and update manufacturing jobs', 'QC checkpoints', 'Read/write parts library'],
    },
    {
      name: 'Field Engineer',
      color: 'violet',
      description: 'Mobile/PWA access only. Sees their own assigned jobs for today.',
      can: ['View assigned distribution jobs', 'Submit day reports', 'Upload site photos', 'Works offline — syncs when connected'],
    },
    {
      name: 'Customer',
      color: 'gray',
      description: 'Reserved for a future customer-facing portal. No current UI access.',
      can: ['Not yet active'],
    },
  ];

  return (
    <Stack gap="lg">
      <Paper withBorder p="lg" radius="md" bg="gray.0">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" color="gray" variant="light">
            <IconUsers size={22} />
          </ThemeIcon>
          <div>
            <Title order={4}>Roles & Access</Title>
            <Text size="sm" c="dimmed">What each role can see and do in the system</Text>
          </div>
        </Group>
      </Paper>

      <Text size="sm" c="dimmed">
        Roles are assigned by adding a user to the corresponding <strong>Cognito Group</strong> in AWS. The role is embedded in every login token — no re-configuration needed in this app. Users must sign out and back in after a role change.
      </Text>

      <Grid>
        {roles.map(role => (
          <Grid.Col key={role.name} span={{ base: 12, sm: 6 }}>
            <Paper withBorder p="md" radius="md" h="100%">
              <Group gap="sm" mb="xs">
                <Badge color={role.color} variant="filled" size="md">{role.name}</Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="sm">{role.description}</Text>
              <Divider mb="sm" />
              <List size="xs" spacing={4} c="dimmed"
                icon={<ThemeIcon size={14} radius="xl" color={role.color} variant="light"><IconCircleCheck size={10} /></ThemeIcon>}>
                {role.can.map(item => <List.Item key={item}>{item}</List.Item>)}
              </List>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HowToPage() {
  return (
    <Box py="xl">
      <Container size="lg">
        <Stack gap={rem(4)} mb="xl">
          <Title order={2}>How It Works</Title>
          <Text c="dimmed" size="sm">
            A guide to the major workflows — from first enquiry through to installed asset.
          </Text>
        </Stack>

        <Tabs defaultValue="pipeline" keepMounted={false}>
          <Tabs.List mb="xl">
            <Tabs.Tab value="pipeline" leftSection={<IconFileText size={16} />}>
              Quote Pipeline
            </Tabs.Tab>
            <Tabs.Tab value="production" leftSection={<IconBuildingFactory2 size={16} />}>
              Production
            </Tabs.Tab>
            <Tabs.Tab value="distribution" leftSection={<IconTruck size={16} />}>
              Distribution & Installation
            </Tabs.Tab>
            <Tabs.Tab value="service" leftSection={<IconTool size={16} />}>
              Service Operations
            </Tabs.Tab>
            <Tabs.Tab value="assets" leftSection={<IconShieldCheck size={16} />}>
              Asset Management
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconUsers size={16} />}>
              Roles
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pipeline"><QuotePipelineTab /></Tabs.Panel>
          <Tabs.Panel value="production"><ProductionTab /></Tabs.Panel>
          <Tabs.Panel value="distribution"><DistributionTab /></Tabs.Panel>
          <Tabs.Panel value="service"><ServiceTab /></Tabs.Panel>
          <Tabs.Panel value="assets"><AssetsTab /></Tabs.Panel>
          <Tabs.Panel value="roles"><RolesTab /></Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
}
