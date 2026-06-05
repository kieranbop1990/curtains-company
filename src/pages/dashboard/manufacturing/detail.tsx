import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, Text, Badge,
  NumberInput, TextInput, Textarea, Center, Loader, Alert,
  Stepper, Table, Checkbox, Divider, Progress, ThemeIcon, ActionIcon, Select,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { manufacturingApi } from 'src/api/production-pack';
import { staffApi } from 'src/api/staff';
import type { ManufacturingJob, MfgStatus, MfgQcCheckpoint, MfgFabricRow, MfgComponent } from 'src/types/production-pack';

const MFG_STATUS_STEPS: MfgStatus[] = [
  'BOOKING_PRODUCTION', 'AWAITING_SMOKE_ALARMS', 'FABRICATION', 'ASSEMBLY', 'QC', 'DISPATCH',
];
const MFG_STATUS_LABELS: Record<MfgStatus, string> = {
  BOOKING_PRODUCTION: 'Booking Production',
  AWAITING_SMOKE_ALARMS: 'Awaiting Smoke Alarms',
  FABRICATION: 'Fabrication',
  ASSEMBLY: 'Assembly',
  QC: 'QC',
  DISPATCH: 'Dispatch',
};

const COMPONENT_STATUS_OPTIONS = [
  { value: 'AWAITING_STOCK_OUT', label: 'Awaiting Stock Out' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'AWAITING_QC', label: 'Awaiting QC' },
  { value: 'READY_TO_RELEASE', label: 'Ready to Release' },
  { value: 'MADE_FOR_REUSE', label: 'Made for Reuse' },
];

export default function ManufacturingDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<ManufacturingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productionStaff, setProductionStaff] = useState<{ value: string; label: string }[]>([]);

  const load = useCallback(() => {
    if (!jobId) return;
    setLoading(true);
    manufacturingApi.get(jobId)
      .then(setJob)
      .catch(() => setError('Failed to load manufacturing job'))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    staffApi.getAll().then(all => {
      const filtered = all.filter(s => s.active && ['PRODUCTION', 'ENGINEER_FIELD', 'ADMIN'].includes(s.role));
      setProductionStaff(filtered.map(s => ({ value: s.name, label: s.name })));
    });
  }, []);

  const save = async (patch: Partial<ManufacturingJob>) => {
    if (!jobId) return;
    setSaving(true);
    try {
      const updated = await manufacturingApi.update(jobId, patch);
      setJob(updated);
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async (target: MfgStatus) => {
    if (!jobId) return;
    setSaving(true);
    try {
      const updated = await manufacturingApi.advanceStatus(jobId, target);
      setJob(updated);
    } finally {
      setSaving(false);
    }
  };

  const toggleQcCheckpoint = async (checkpoint: MfgQcCheckpoint) => {
    if (!jobId) return;
    const updated = await manufacturingApi.updateQcCheckpoint(jobId, checkpoint.id, !checkpoint.checked);
    setJob(updated);
  };

  const updateComponentStatus = async (component: MfgComponent, status: string) => {
    if (!jobId) return;
    await manufacturingApi.updateComponent(jobId, component.id, { status });
    load();
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error || !job) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error ?? 'Job not found'}</Alert>
    </Container>
  );

  const currentStepIdx = MFG_STATUS_STEPS.indexOf(job.status);
  const nextStatus = currentStepIdx < MFG_STATUS_STEPS.length - 1 ? MFG_STATUS_STEPS[currentStepIdx + 1] : null;
  const progressPct = Math.round(((currentStepIdx + 1) / MFG_STATUS_STEPS.length) * 100);

  // Release gate (T-109)
  const releaseChecklist = [
    { key: 'allComponentsDone', label: 'All Components Complete', value: job.allComponentsDone },
    { key: 'qcFormsUploaded', label: 'QC Forms Uploaded', value: job.qcFormsUploaded },
    { key: 'stampChecked', label: 'Stamp Checked', value: job.stampChecked },
    { key: 'productionDocsDone', label: 'Production Documentation', value: job.productionDocsDone },
  ];
  const releaseReady = releaseChecklist.every(i => i.value);

  // QC checkpoints all checked + progress %
  const qcComplete = job.qcCheckpoints.length > 0 && job.qcCheckpoints.every(c => c.checked);
  const qcPct = job.qcCheckpoints.length > 0
    ? Math.round((job.qcCheckpoints.filter(c => c.checked).length / job.qcCheckpoints.length) * 100)
    : 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/dashboard/manufacturing')}>Back</Button>
            <Title order={2} fw={700}>{job.mfgRef}</Title>
            <Badge color={job.source === 'LG' ? 'blue' : 'teal'} variant="light">{job.source}</Badge>
            <Badge color="gray" variant="light">{MFG_STATUS_LABELS[job.status]}</Badge>
          </Group>
          {nextStatus && (
            <Button loading={saving} onClick={() => advanceStatus(nextStatus)}>
              Advance to {MFG_STATUS_LABELS[nextStatus]}
            </Button>
          )}
        </Group>

        {/* Status progress bar (T-103) */}
        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600} size="sm">Manufacturing Progress</Text>
              <Text size="sm" c="dimmed">{progressPct}%</Text>
            </Group>
            <Progress value={progressPct} size="xl" radius="xl"
              color={progressPct === 100 ? 'green' : 'blue'} />
            <Stepper active={currentStepIdx} size="sm">
              {MFG_STATUS_STEPS.map(s => (
                <Stepper.Step key={s} label={MFG_STATUS_LABELS[s]} />
              ))}
            </Stepper>
          </Stack>
        </Paper>

        <Grid gap="lg">
          <Grid.Col span={8}>
            <Stack gap="lg">
              {/* Job details */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Job Details</Text>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <TextInput label="Customer" value={job.customerName ?? ''}
                        onChange={(e) => save({ customerName: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Site" value={job.siteName ?? ''}
                        onChange={(e) => save({ siteName: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Textarea label="Description" value={job.description ?? ''}
                        onChange={(e) => save({ description: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput label="Priority" value={job.priority ?? ''}
                        onChange={(e) => save({ priority: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput label="Required By" type="date"
                        defaultValue={job.requiredByDate?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ requiredByDate: e.currentTarget.value || null })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Select
                        label="Engineer"
                        placeholder="Select engineer"
                        searchable
                        clearable
                        data={productionStaff}
                        value={job.engineerName ?? null}
                        onChange={v => save({ engineerName: v ?? null })}
                        nothingFoundMessage="No production staff found"
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>

              {/* MFG Requirements Table (T-104) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Components &amp; Requirements</Text>
                  {job.components.length === 0 ? (
                    <Text c="dimmed" size="sm">No components tracked.</Text>
                  ) : (
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Component</Table.Th>
                          <Table.Th>Category</Table.Th>
                          <Table.Th>Qty</Table.Th>
                          <Table.Th>Required By</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {job.components.map((comp) => (
                          <Table.Tr key={comp.id}>
                            <Table.Td>{comp.name}</Table.Td>
                            <Table.Td>{comp.category ?? '—'}</Table.Td>
                            <Table.Td>{comp.quantity}</Table.Td>
                            <Table.Td>{comp.requiredByDate ? comp.requiredByDate.slice(0, 10) : '—'}</Table.Td>
                            <Table.Td>
                              <Select size="xs"
                                data={COMPONENT_STATUS_OPTIONS}
                                value={comp.status}
                                onChange={(v) => v && updateComponentStatus(comp, v)} />
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Stack>
              </Paper>

              {/* Fabric Cutting Schedule (T-105) */}
              {job.fabricRows.length > 0 && (
                <Paper withBorder radius="md" p="lg">
                  <Stack gap="md">
                    <Text fw={600} size="sm">Fabric Cutting Schedule</Text>
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>System Ref</Table.Th>
                          <Table.Th>Width (mm)</Table.Th>
                          <Table.Th>Drop (mm)</Table.Th>
                          <Table.Th>Roll / Material</Table.Th>
                          <Table.Th>Qty</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {job.fabricRows.map((row) => (
                          <Table.Tr key={row.id}>
                            <Table.Td>{row.systemRef ?? '—'}</Table.Td>
                            <Table.Td>{row.widthMm ?? '—'}</Table.Td>
                            <Table.Td>{row.dropMm ?? '—'}</Table.Td>
                            <Table.Td>{row.material ?? '—'}</Table.Td>
                            <Table.Td>{row.quantity}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Stack>
                </Paper>
              )}

              {/* QC Checkpoints (T-107) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">QC Label Checkpoints</Text>
                    <Badge color={qcComplete ? 'green' : 'gray'} variant="light">
                      {job.qcCheckpoints.filter(c => c.checked).length}/{job.qcCheckpoints.length} checked
                    </Badge>
                  </Group>
                  <Progress value={qcPct} color={qcComplete ? 'green' : 'blue'} size="sm" />
                  {job.qcCheckpoints.map((cp) => (
                    <Checkbox key={cp.id} label={cp.label} checked={cp.checked}
                      onChange={() => toggleQcCheckpoint(cp)} />
                  ))}
                </Stack>
              </Paper>

              {/* Production Approval (T-106) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Production Approval Sign-Off</Text>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <TextInput label="Approved By" value={job.approvedBy ?? ''}
                        onChange={(e) => save({ approvedBy: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Authorised By" value={job.authorisedBy ?? ''}
                        onChange={(e) => save({ authorisedBy: e.currentTarget.value })} />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right column */}
          <Grid.Col span={4}>
            <Stack gap="lg">
              {/* Release Gate Indicator (T-108, T-109) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="sm">
                  <Text fw={600} size="sm">Release to Engineer</Text>
                  <Divider />
                  {releaseChecklist.map((item) => (
                    <Group key={item.key} justify="space-between">
                      <Text size="sm">{item.label}</Text>
                      <Checkbox checked={item.value}
                        onChange={(e) => save({ [item.key]: e.currentTarget.checked } as any)} />
                    </Group>
                  ))}
                  <Divider />
                  <Group>
                    <ThemeIcon color={releaseReady ? 'green' : 'red'} variant="light" size="sm">
                      {releaseReady ? <IconCheck size={12} /> : <IconX size={12} />}
                    </ThemeIcon>
                    <Text fw={600} size="sm" c={releaseReady ? 'green' : 'red'}>
                      {releaseReady ? 'Ready for Release' : 'Not Ready for Release'}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              {/* Spec for Production (T-081 wiring) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="sm">
                  <Text fw={600} size="sm">Spec for Production</Text>
                  <Textarea label="Notes" value={job.specNotes ?? ''}
                    onChange={(e) => save({ specNotes: e.currentTarget.value })} />
                  <TextInput label="Required By" type="date"
                    defaultValue={job.specRequiredBy?.slice(0, 10) ?? ''}
                    onBlur={(e) => save({ specRequiredBy: e.currentTarget.value || null })} />
                  <Select label="Priority" clearable
                    data={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' }]}
                    value={job.specPriority ?? null}
                    onChange={(v) => save({ specPriority: v })} />
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
