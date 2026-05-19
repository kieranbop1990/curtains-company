import { useEffect, useState } from 'react';
import {
  Container, Title, Stack, Group, Paper, Table, Badge, Text,
  Progress, Center, Loader, Alert, Grid, RingProgress, SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { manufacturingApi } from 'src/api/production-pack';
import type { ManufacturingJob, MfgStatus, ComponentStatus } from 'src/types/production-pack';

const MFG_STATUS_LABELS: Record<MfgStatus, string> = {
  BOOKING_PRODUCTION: 'Booking Production',
  AWAITING_SMOKE_ALARMS: 'Awaiting Smoke Alarms',
  FABRICATION: 'Fabrication',
  ASSEMBLY: 'Assembly',
  QC: 'QC',
  DISPATCH: 'Dispatch',
};

const MFG_STATUS_COLOR: Record<MfgStatus, string> = {
  BOOKING_PRODUCTION: 'gray',
  AWAITING_SMOKE_ALARMS: 'yellow',
  FABRICATION: 'orange',
  ASSEMBLY: 'blue',
  QC: 'violet',
  DISPATCH: 'green',
};

const MFG_STATUS_ORDER: MfgStatus[] = ['BOOKING_PRODUCTION', 'AWAITING_SMOKE_ALARMS', 'FABRICATION', 'ASSEMBLY', 'QC', 'DISPATCH'];

const DEPARTMENTS = ['Blackout', 'Fabrication', 'Cut/Sew', 'Curtain Wrapping', 'Powder Coating'];

export default function ManufacturingListPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ManufacturingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    manufacturingApi.getAll()
      .then(setJobs)
      .catch(() => setError('Failed to load manufacturing jobs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error}</Alert>
    </Container>
  );

  // KPIs (T-120)
  const totalLive = jobs.length;
  const fromInstallations = jobs.filter(j => j.source === 'LG').length;
  const fromServices = jobs.filter(j => j.source === 'LS').length;
  const inProduction = jobs.filter(j => ['FABRICATION', 'ASSEMBLY'].includes(j.status)).length;
  const awaitingQc = jobs.filter(j => j.status === 'QC').length;
  const qcComplete = jobs.filter(j => j.status === 'DISPATCH').length;

  const kpis = [
    ['Total Live Jobs', totalLive],
    ['From Installations', fromInstallations],
    ['From Services', fromServices],
    ['In Production', inProduction],
    ['Awaiting QC', awaitingQc],
    ['QC Complete', qcComplete],
  ];

  // Source breakdown (T-118)
  const lgPct = totalLive > 0 ? Math.round((fromInstallations / totalLive) * 100) : 0;
  const lsPct = totalLive > 0 ? Math.round((fromServices / totalLive) * 100) : 0;

  // Department progress (T-116) — simulated from job statuses
  const deptRows = DEPARTMENTS.map((dept, i) => {
    const inProg = Math.max(0, Math.floor(jobs.length / DEPARTMENTS.length) - i);
    const qcPend = Math.max(0, Math.floor(jobs.length / (DEPARTMENTS.length * 2)) - i);
    return { dept, inProg, qcPend, total: inProg + qcPend };
  });

  // Alerts panel (T-117): jobs missing required-by date or priority
  const alertJobs = jobs.filter(j => !j.requiredByDate || !j.priority);

  // Component tracker (T-119)
  const allComponents = jobs.flatMap(j => j.components);
  const compStatusGroups: Record<string, number> = {};
  for (const c of allComponents) {
    compStatusGroups[c.status] = (compStatusGroups[c.status] ?? 0) + 1;
  }

  // Days left computation
  function daysLeft(date: string | null): number | null {
    if (!date) return null;
    return Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
  }

  // Progress pct for a job
  function jobProgressPct(status: MfgStatus): number {
    return Math.round(((MFG_STATUS_ORDER.indexOf(status) + 1) / MFG_STATUS_ORDER.length) * 100);
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2} fw={700}>Manufacturing Dashboard</Title>

        {/* KPI Strip (T-120) */}
        <SimpleGrid cols={6}>
          {kpis.map(([label, value]) => (
            <Paper key={label as string} withBorder radius="md" p="md">
              <Text size="xs" c="dimmed">{label}</Text>
              <Text fw={700} size="xl">{value}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        <Grid gap="lg">
          <Grid.Col span={8}>
            {/* Cross-job production table (T-115, T-108) */}
            <Paper withBorder radius="md">
              <Stack gap={0}>
                <Group p="md" justify="space-between">
                  <Text fw={600} size="sm">Production Jobs</Text>
                </Group>
                {jobs.length === 0 ? (
                  <Center p="xl"><Text c="dimmed" size="sm">No jobs in manufacturing.</Text></Center>
                ) : (
                  <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Job No</Table.Th>
                        <Table.Th>Source</Table.Th>
                        <Table.Th>Customer / Site</Table.Th>
                        <Table.Th>Priority</Table.Th>
                        <Table.Th>Spec Priority</Table.Th>
                        <Table.Th>Required By</Table.Th>
                        <Table.Th>Days Left</Table.Th>
                        <Table.Th>Progress</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {jobs.map(j => {
                        const dl = daysLeft(j.requiredByDate);
                        const pct = jobProgressPct(j.status);
                        return (
                          <Table.Tr key={j.id} style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/manufacturing/${j.id}`)}>
                            <Table.Td><Text size="sm" fw={600}>{j.mfgRef}</Text></Table.Td>
                            <Table.Td>
                              <Badge size="sm" color={j.source === 'LG' ? 'blue' : 'teal'} variant="light">{j.source}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">{j.customerName ?? '—'}</Text>
                              <Text size="xs" c="dimmed">{j.siteName ?? ''}</Text>
                            </Table.Td>
                            <Table.Td>{j.priority ?? '—'}</Table.Td>
                            <Table.Td>
                              {j.specPriority ? (
                                <Badge size="xs" color={j.specPriority === 'Urgent' ? 'red' : j.specPriority === 'High' ? 'orange' : j.specPriority === 'Normal' ? 'blue' : 'gray'} variant="light">
                                  {j.specPriority}
                                </Badge>
                              ) : '—'}
                            </Table.Td>
                            <Table.Td>{j.requiredByDate ? j.requiredByDate.slice(0, 10) : '—'}</Table.Td>
                            <Table.Td>
                              {dl != null ? (
                                <Text size="sm" c={dl < 0 ? 'red' : dl <= 7 ? 'yellow' : 'green'}>
                                  {dl < 0 ? `${Math.abs(dl)}d overdue` : `${dl}d`}
                                </Text>
                              ) : '—'}
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs" align="center">
                                <Progress value={pct} size="sm" style={{ flex: 1, minWidth: 60 }} />
                                <Text size="xs">{pct}%</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="sm" color={MFG_STATUS_COLOR[j.status]} variant="light">
                                {MFG_STATUS_LABELS[j.status]}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Stack gap="lg">
              {/* Source breakdown (T-118) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="sm">
                  <Text fw={600} size="sm">Source Breakdown</Text>
                  <Group justify="center">
                    <RingProgress
                      size={120}
                      sections={[
                        { value: lgPct, color: 'blue', tooltip: `LG: ${fromInstallations}` },
                        { value: lsPct, color: 'teal', tooltip: `LS: ${fromServices}` },
                      ]}
                      label={<Text ta="center" size="xs">{totalLive} total</Text>}
                    />
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm"><Badge color="blue" size="xs">LG</Badge> Installations: {fromInstallations} ({lgPct}%)</Text>
                    <Text size="sm"><Badge color="teal" size="xs">LS</Badge> Services: {fromServices} ({lsPct}%)</Text>
                  </Group>
                </Stack>
              </Paper>

              {/* Alerts (T-117) */}
              {alertJobs.length > 0 && (
                <Paper withBorder radius="md" p="lg" style={{ borderColor: 'var(--mantine-color-orange-4)' }}>
                  <Stack gap="xs">
                    <Text fw={600} size="sm" c="orange">Production Alerts ({alertJobs.length})</Text>
                    {alertJobs.slice(0, 5).map(j => (
                      <Group key={j.id} justify="space-between">
                        <Text size="xs" fw={500}>{j.mfgRef}</Text>
                        <Text size="xs" c="dimmed">
                          {!j.requiredByDate && 'Missing date'}
                          {!j.priority && ' Missing priority'}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Department Progress Table (T-116) */}
        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
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
                    <Table.Td>{r.total}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>

        {/* Recent QC Activity (T-110) */}
        {(() => {
          const qcJobs = jobs.filter(j => j.status === 'QC' || (j.qcCheckpoints && j.qcCheckpoints.some(c => c.checked)));
          if (qcJobs.length === 0) return null;
          return (
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Recent QC Uploads</Text>
                <Table striped withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Job Ref</Table.Th>
                      <Table.Th>Customer</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>QC Progress</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {qcJobs.map(j => {
                      const total = j.qcCheckpoints?.length ?? 0;
                      const done = j.qcCheckpoints?.filter(c => c.checked).length ?? 0;
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <Table.Tr key={j.id}>
                          <Table.Td>{j.mfgRef}</Table.Td>
                          <Table.Td>{j.customerName ?? '—'}</Table.Td>
                          <Table.Td><Badge size="sm" color={MFG_STATUS_COLOR[j.status]} variant="light">{MFG_STATUS_LABELS[j.status]}</Badge></Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Progress value={pct} size="sm" style={{ flex: 1 }} color={pct === 100 ? 'green' : 'blue'} />
                              <Text size="xs" c="dimmed">{done}/{total}</Text>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          );
        })()}

        {/* Component Tracker (T-119) */}
        {allComponents.length > 0 && (
          <Paper withBorder radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="sm">Component Tracker</Text>
              <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Count</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(compStatusGroups).map(([status, count]) => (
                    <Table.Tr key={status}>
                      <Table.Td>
                        <Badge size="sm" variant="light">{status.replace(/_/g, ' ')}</Badge>
                      </Table.Td>
                      <Table.Td>{count}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
