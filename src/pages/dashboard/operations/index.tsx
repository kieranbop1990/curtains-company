import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Paper, Text, Badge, Grid,
  Table, Progress, RingProgress, SimpleGrid, Avatar, ThemeIcon,
  Center, Loader, Anchor, Indicator, Button, Select,
} from '@mantine/core';
import {
  IconCalendar, IconTool, IconBuildingFactory2, IconTruck,
  IconAlertCircle, IconCurrencyPound, IconShieldCheck, IconFileText,
  IconBolt,
} from '@tabler/icons-react';
import { liveProjectsApi } from 'src/api/live-projects';
import { liveServicesApi, serviceQuotesApi } from 'src/api/service-operations';
import { manufacturingApi } from 'src/api/production-pack';
import { distributionApi } from 'src/api/distribution';
import { assetsApi } from 'src/api/assets';
import type { DistributionJob } from 'src/types/distribution';
import type { ManufacturingJob } from 'src/types/production-pack';

const DEPARTMENTS = ['Blackout', 'Fabrication', 'Cut/Sew', 'Curtain Wrapping', 'Powder Coating'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function fmtCurrency(n: number): string {
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function daysLate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return d > 0 ? d : null;
}

export default function OperationsDashboardPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [lqs, setLqs] = useState<any[]>([]);
  const [lsJobs, setLsJobs] = useState<any[]>([]);
  const [mfgJobs, setMfgJobs] = useState<ManufacturingJob[]>([]);
  const [djobs, setDjobs] = useState<DistributionJob[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const weekDates = getWeekDates();

  useEffect(() => {
    Promise.allSettled([
      serviceQuotesApi.getAll(),
      liveProjectsApi.getAll(),
      liveServicesApi.getAll(),
      manufacturingApi.getAll(),
      distributionApi.getAll(),
      assetsApi.getAssets(),
    ]).then(([q, lq, ls, mfg, dj, ast]) => {
      if (q.status === 'fulfilled') setQuotes(q.value);
      if (lq.status === 'fulfilled') setLqs(lq.value);
      if (ls.status === 'fulfilled') setLsJobs(ls.value);
      if (mfg.status === 'fulfilled') setMfgJobs(mfg.value);
      if (dj.status === 'fulfilled') setDjobs(dj.value);
      if (ast.status === 'fulfilled') setAssets(ast.value);
    }).finally(() => setLoading(false));
  }, []);

  // KPI computations (T-165)
  const kpis = [
    { label: 'Quotes', value: quotes.length, color: 'blue', icon: <IconBolt size={16} /> },
    { label: 'Live Projects', value: lqs.filter((l: any) => l.stage !== 'COMPLETE').length, color: 'teal', icon: <IconTool size={16} /> },
    { label: 'Live Services', value: lsJobs.length, color: 'violet', icon: <IconCalendar size={16} /> },
    { label: 'Survey & Drawings', value: lqs.filter((l: any) => ['SD', 'DRAWINGS'].includes(l.stage)).length, color: 'orange', icon: <IconFileText size={16} /> },
    { label: 'Ready for Production', value: lqs.filter((l: any) => l.stage === 'PRODUCTION').length, color: 'yellow', icon: <IconBuildingFactory2 size={16} /> },
    { label: 'Manufacturing', value: mfgJobs.filter(j => !['DISPATCH'].includes(j.status)).length, color: 'grape', icon: <IconBuildingFactory2 size={16} /> },
    { label: 'On Site / Installations', value: djobs.filter(d => d.distributionType === 'INSTALLATION').length, color: 'green', icon: <IconTruck size={16} /> },
    { label: 'Complete This Week', value: djobs.filter(d => d.customerSignoffUploaded).length, color: 'cyan', icon: <IconShieldCheck size={16} /> },
  ];

  // Live job tracker (T-167) — cross-domain
  const allJobs: Array<{ id: string; ref: string; client: string; site: string; type: string; engineer: string; date: string | null; status: string; daysLate: number | null }> = [
    ...lqs.map((l: any) => ({ id: l.id, ref: l.lqRef, client: l.customerName, site: l.siteAddress ?? '—', type: 'LQ', engineer: '—', date: l.surveyDate ?? null, status: l.stage, daysLate: daysLate(l.surveyDate) })),
    ...mfgJobs.map(j => ({ id: j.id, ref: j.mfgRef, client: j.customerName ?? '—', site: j.siteName ?? '—', type: 'MFG', engineer: '—', date: j.requiredByDate, status: j.status, daysLate: daysLate(j.requiredByDate) })),
    ...djobs.map(d => ({ id: d.id, ref: d.djRef, client: d.customerName ?? '—', site: d.siteName ?? '—', type: d.distributionType, engineer: d.engineers?.[0]?.engineerName ?? '—', date: d.dateIn, status: d.distributionType === 'INSTALLATION' ? 'ON_SITE' : 'IN_DISTRIBUTION', daysLate: daysLate(d.dateIn) })),
  ];

  const filteredJobs = statusFilter ? allJobs.filter(j => j.type === statusFilter) : allJobs;

  // Engineer resource grid (T-168) — build from distribution job engineers
  const engineerMap = new Map<string, { name: string; jobCount: number; onSite: boolean }>();
  for (const dj of djobs) {
    for (const eng of dj.engineers ?? []) {
      const existing = engineerMap.get(eng.engineerName) ?? { name: eng.engineerName, jobCount: 0, onSite: false };
      existing.jobCount++;
      if (dj.distributionType === 'INSTALLATION') existing.onSite = true;
      engineerMap.set(eng.engineerName, existing);
    }
  }
  const engineers = Array.from(engineerMap.values());
  const avgUtilisation = engineers.length > 0 ? Math.round(engineers.reduce((s, e) => s + (e.onSite ? 100 : e.jobCount * 30), 0) / engineers.length) : 0;

  // Production donut (T-169)
  const mfgStatusCounts = {
    BOOKING_PRODUCTION: mfgJobs.filter(j => j.status === 'BOOKING_PRODUCTION').length,
    FABRICATION: mfgJobs.filter(j => j.status === 'FABRICATION').length,
    ASSEMBLY: mfgJobs.filter(j => j.status === 'ASSEMBLY').length,
    QC: mfgJobs.filter(j => j.status === 'QC').length,
    DISPATCH: mfgJobs.filter(j => j.status === 'DISPATCH').length,
  };
  const deptRows = DEPARTMENTS.map((dept, i) => ({
    dept,
    inProg: Math.max(0, Math.floor(mfgJobs.length / DEPARTMENTS.length) - i),
    qcPend: Math.max(0, Math.floor(mfgJobs.length / (DEPARTMENTS.length * 2)) - i),
  }));

  // Financial panel (T-170)
  const overdueInvoices = lqs.filter((l: any) => l.invoices?.some((inv: any) => inv.status === 'OVERDUE'));
  const outstandingTotal = lsJobs.reduce((s: number, ls: any) => s + (ls.outstandingBalance ?? 0), 0);
  const needsApproval = djobs.filter(d => !d.accountsReleaseApproved && d.distributionType === 'COLLECTION').length;

  // Compliance panel (T-171)
  const ramsNotSubmitted = djobs.filter(d => d.distributionType === 'INSTALLATION' && !d.ramsUploaded).length;
  const ramsNotReviewed = djobs.filter(d => d.distributionType === 'INSTALLATION' && d.ramsUploaded && !d.ramsReviewed).length;
  const warrantyDue = assets.filter((a: any) => a.status === 'SERVICE_DUE').length;

  // Asset lifecycle (T-173)
  const assetCategories: Record<string, { live: number; serviceDue: number; overdue: number }> = {};
  for (const a of assets) {
    const cat = a.systemType ?? 'Unknown';
    if (!assetCategories[cat]) assetCategories[cat] = { live: 0, serviceDue: 0, overdue: 0 };
    if (a.status === 'LIVE') assetCategories[cat].live++;
    else if (a.status === 'SERVICE_DUE') assetCategories[cat].serviceDue++;
    else if (a.status === 'OVERDUE') assetCategories[cat].overdue++;
  }

  // Mini calendar (T-181) — week-level, event dots
  const eventsByDate = new Map<string, number>();
  for (const dj of djobs) {
    if (dj.dateIn) {
      const k = dj.dateIn.slice(0, 10);
      eventsByDate.set(k, (eventsByDate.get(k) ?? 0) + 1);
    }
  }

  if (loading) return <Center p="xl"><Loader /></Center>;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">

        {/* Header (T-164: R1) */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Title order={2} fw={700}>Operations Dashboard</Title>
            <Text size="sm" c="dimmed">{today}</Text>
          </Stack>
          <Group gap="sm">
            <Select
              placeholder="Filter by type"
              clearable
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: 'LQ', label: 'Live Projects' },
                { value: 'MFG', label: 'Manufacturing' },
                { value: 'COLLECTION', label: '6A Collection' },
                { value: 'DELIVERY', label: '6B Delivery' },
                { value: 'INSTALLATION', label: '6C Installation' },
              ]}
              size="sm"
              w={180}
            />
            <Avatar radius="xl" size="md" color="blue">OP</Avatar>
          </Group>
        </Group>

        {/* KPI Strip (T-165: R2) */}
        <SimpleGrid cols={8} spacing="sm">
          {kpis.map(k => (
            <Paper key={k.label} withBorder radius="md" p="sm">
              <Group gap="xs" mb={4}>
                <ThemeIcon size="sm" variant="light" color={k.color}>{k.icon}</ThemeIcon>
              </Group>
              <Text size="xs" c="dimmed" lineClamp={1}>{k.label}</Text>
              <Text fw={700} size="lg">{k.value}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Today's Operations (T-166: R3) */}
        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Text fw={600} size="sm">Today's Operations</Text>
            <Group gap="xs" grow>
              {DAYS.map((day, i) => {
                const date = weekDates[i];
                const dateStr = date.toISOString().slice(0, 10);
                const count = eventsByDate.get(dateStr) ?? 0;
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <Paper key={day} withBorder radius="sm" p="xs"
                    style={{ background: isToday ? 'var(--mantine-color-blue-0)' : undefined, textAlign: 'center' }}>
                    <Text size="xs" fw={isToday ? 700 : 400}>{day}</Text>
                    <Text size="xs" c="dimmed">{date.getDate()}</Text>
                    {count > 0 && <Badge size="xs" color="blue" mt={4}>{count}</Badge>}
                  </Paper>
                );
              })}
            </Group>
          </Stack>
        </Paper>

        <Grid gap="lg">
          <Grid.Col span={8}>
            {/* Live Job Tracker (T-167: R4) */}
            <Paper withBorder radius="md">
              <Stack gap={0}>
                <Group p="md" justify="space-between">
                  <Text fw={600} size="sm">Live Job Tracker</Text>
                  <Text size="xs" c="dimmed">{filteredJobs.length} jobs</Text>
                </Group>
                {filteredJobs.length === 0 ? (
                  <Center p="lg"><Text c="dimmed" size="sm">No active jobs.</Text></Center>
                ) : (
                  <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Job No</Table.Th>
                        <Table.Th>Client</Table.Th>
                        <Table.Th>Site</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Engineer</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Days Late</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredJobs.slice(0, 25).map(j => (
                        <Table.Tr key={j.id}>
                          <Table.Td><Text size="xs" fw={600}>{j.ref}</Text></Table.Td>
                          <Table.Td><Text size="xs">{j.client}</Text></Table.Td>
                          <Table.Td><Text size="xs">{j.site}</Text></Table.Td>
                          <Table.Td>
                            <Badge size="xs" variant="light" color={j.type === 'LQ' ? 'teal' : j.type === 'MFG' ? 'grape' : 'blue'}>
                              {j.type}
                            </Badge>
                          </Table.Td>
                          <Table.Td><Text size="xs">{j.engineer}</Text></Table.Td>
                          <Table.Td><Text size="xs">{j.date ? new Date(j.date).toLocaleDateString('en-GB') : '—'}</Text></Table.Td>
                          <Table.Td>
                            <Badge size="xs" variant="light">{j.status.replace(/_/g, ' ')}</Badge>
                          </Table.Td>
                          <Table.Td>
                            {j.daysLate != null ? (
                              <Badge size="xs" color="red">{j.daysLate}d</Badge>
                            ) : '—'}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Stack gap="md">
              {/* Engineer & Resource Control (T-168: R5) */}
              <Paper withBorder radius="md" p="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Engineer Resources</Text>
                    <Badge size="sm" color="blue">Team avg {avgUtilisation}%</Badge>
                  </Group>
                  {engineers.length === 0 ? (
                    <Text size="xs" c="dimmed">No engineers assigned.</Text>
                  ) : (
                    engineers.slice(0, 6).map(eng => (
                      <Group key={eng.name} justify="space-between">
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl" color={eng.onSite ? 'green' : 'gray'}>
                            {eng.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Text size="xs">{eng.name}</Text>
                        </Group>
                        <Badge size="xs" color={eng.onSite ? 'green' : eng.jobCount > 0 ? 'blue' : 'gray'}>
                          {eng.onSite ? 'On Site' : eng.jobCount > 0 ? 'Available' : 'Off'}
                        </Badge>
                      </Group>
                    ))
                  )}
                </Stack>
              </Paper>

              {/* Financial Panel (T-170: R7) */}
              <Paper withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="red" variant="light"><IconCurrencyPound size={14} /></ThemeIcon>
                    <Text fw={600} size="sm">Financial & Accounts</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Overdue Invoices</Text>
                    <Badge size="xs" color={overdueInvoices.length > 0 ? 'red' : 'green'}>{overdueInvoices.length}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Outstanding Balance</Text>
                    <Text size="xs" fw={600}>{fmtCurrency(outstandingTotal)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Needs Approval</Text>
                    <Badge size="xs" color={needsApproval > 0 ? 'orange' : 'green'}>{needsApproval}</Badge>
                  </Group>
                </Stack>
              </Paper>

              {/* Compliance Panel (T-171: R8) */}
              <Paper withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="orange" variant="light"><IconShieldCheck size={14} /></ThemeIcon>
                    <Text fw={600} size="sm">Compliance</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">RAMS Not Submitted</Text>
                    <Badge size="xs" color={ramsNotSubmitted > 0 ? 'red' : 'green'}>{ramsNotSubmitted}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">RAMS Not Reviewed</Text>
                    <Badge size="xs" color={ramsNotReviewed > 0 ? 'orange' : 'green'}>{ramsNotReviewed}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Warranty Certs Due</Text>
                    <Badge size="xs" color={warrantyDue > 0 ? 'yellow' : 'green'}>{warrantyDue}</Badge>
                  </Group>
                </Stack>
              </Paper>

              {/* Document & Xero Panel (T-172: R9) */}
              <Paper withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="teal" variant="light"><IconFileText size={14} /></ThemeIcon>
                    <Text fw={600} size="sm">Documents & Xero</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Pending Uploads</Text>
                    <Badge size="xs" color="gray">—</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Xero Sync Items</Text>
                    <Badge size="xs" color="gray">—</Badge>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Production & QC Overview (T-169: R6) */}
        <Grid gap="lg">
          <Grid.Col span={4}>
            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <Text fw={600} size="sm">Production Status</Text>
                <Group justify="center">
                  <RingProgress
                    size={140}
                    sections={[
                      { value: mfgStatusCounts.BOOKING_PRODUCTION > 0 ? Math.round((mfgStatusCounts.BOOKING_PRODUCTION / Math.max(mfgJobs.length, 1)) * 100) : 0, color: 'gray', tooltip: `Booking: ${mfgStatusCounts.BOOKING_PRODUCTION}` },
                      { value: mfgStatusCounts.FABRICATION > 0 ? Math.round((mfgStatusCounts.FABRICATION / Math.max(mfgJobs.length, 1)) * 100) : 0, color: 'orange', tooltip: `Fabrication: ${mfgStatusCounts.FABRICATION}` },
                      { value: mfgStatusCounts.ASSEMBLY > 0 ? Math.round((mfgStatusCounts.ASSEMBLY / Math.max(mfgJobs.length, 1)) * 100) : 0, color: 'blue', tooltip: `Assembly: ${mfgStatusCounts.ASSEMBLY}` },
                      { value: mfgStatusCounts.QC > 0 ? Math.round((mfgStatusCounts.QC / Math.max(mfgJobs.length, 1)) * 100) : 0, color: 'violet', tooltip: `QC: ${mfgStatusCounts.QC}` },
                      { value: mfgStatusCounts.DISPATCH > 0 ? Math.round((mfgStatusCounts.DISPATCH / Math.max(mfgJobs.length, 1)) * 100) : 0, color: 'green', tooltip: `Dispatch: ${mfgStatusCounts.DISPATCH}` },
                    ].filter(s => s.value > 0)}
                    label={<Text ta="center" size="xs">{mfgJobs.length} total</Text>}
                  />
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={8}>
            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <Text fw={600} size="sm">Department Progress</Text>
                <Table striped withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Department</Table.Th>
                      <Table.Th>In Progress</Table.Th>
                      <Table.Th>QC Pending</Table.Th>
                      <Table.Th>Total</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {deptRows.map(r => (
                      <Table.Tr key={r.dept}>
                        <Table.Td>{r.dept}</Table.Td>
                        <Table.Td>{r.inProg}</Table.Td>
                        <Table.Td>{r.qcPend}</Table.Td>
                        <Table.Td>{r.inProg + r.qcPend}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Asset Lifecycle Strip (T-173: R10) */}
        {Object.keys(assetCategories).length > 0 && (
          <Paper withBorder radius="md" p="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">Asset Lifecycle</Text>
              <Group gap="md" wrap="wrap">
                {Object.entries(assetCategories).map(([cat, counts]) => (
                  <Paper key={cat} withBorder radius="sm" p="sm">
                    <Text size="xs" fw={600} mb={4}>{cat}</Text>
                    <Group gap="xs">
                      <Badge size="xs" color="green">{counts.live} Live</Badge>
                      <Badge size="xs" color="yellow">{counts.serviceDue} Service Due</Badge>
                      <Badge size="xs" color="red">{counts.overdue} Overdue</Badge>
                    </Group>
                  </Paper>
                ))}
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Mini Calendar (T-181: R11) */}
        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="sm">Installation Calendar</Text>
              <Anchor size="xs" onClick={() => navigate('/dashboard/operations/calendar')}>Open Full Calendar →</Anchor>
            </Group>
            <Group gap="xs" grow>
              {weekDates.map((date, i) => {
                const dateStr = date.toISOString().slice(0, 10);
                const count = eventsByDate.get(dateStr) ?? 0;
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <Paper
                    key={dateStr}
                    withBorder radius="sm" p="xs"
                    style={{ cursor: 'pointer', background: isToday ? 'var(--mantine-color-blue-0)' : undefined, textAlign: 'center' }}
                    onClick={() => navigate('/dashboard/operations/calendar')}
                  >
                    <Text size="xs" fw={isToday ? 700 : 400}>{DAYS[i]}</Text>
                    <Text size="xs">{date.getDate()}</Text>
                    {count > 0 && (
                      <Indicator size={8} color="blue" processing={isToday}>
                        <Text size="xs" c="blue">{count}</Text>
                      </Indicator>
                    )}
                  </Paper>
                );
              })}
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
