import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, Text, Badge,
  NumberInput, TextInput, Textarea, Switch, Center, Loader, Alert,
  Divider, Tabs, Select, Modal, Radio,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconTool, IconShieldCheck, IconBox, IconFileText, IconCurrencyPound, IconClipboardList, IconTruck } from '@tabler/icons-react';
import { liveServicesApi } from 'src/api/service-operations';
import { distributionApi } from 'src/api/distribution';
import { staffApi } from 'src/api/staff';
import type { LiveService } from 'src/types/service-operations';
import type { DistributionType } from 'src/types/distribution';

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

export default function LiveServiceDetailPage() {
  const { lsId } = useParams<{ lsId: string }>();
  const navigate = useNavigate();
  const [ls, setLs] = useState<LiveService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distModalOpen, setDistModalOpen] = useState(false);
  const [distType, setDistType] = useState<DistributionType>('COLLECTION');
  const [sendingToDist, setSendingToDist] = useState(false);
  const [fieldEngineers, setFieldEngineers] = useState<{ value: string; label: string }[]>([]);
  const [officeStaff, setOfficeStaff] = useState<{ value: string; label: string }[]>([]);

  const load = useCallback(() => {
    if (!lsId) return;
    setLoading(true);
    liveServicesApi.get(lsId)
      .then(setLs)
      .catch(() => setError('Failed to load live service'))
      .finally(() => setLoading(false));
  }, [lsId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    staffApi.getAll().then(all => {
      const active = all.filter(s => s.active);
      setFieldEngineers(active.filter(s => s.role === 'ENGINEER_FIELD' || s.role === 'ADMIN').map(s => ({ value: s.name, label: s.name })));
      setOfficeStaff(active.filter(s => s.role === 'OFFICE_OPERATIONS' || s.role === 'ADMIN').map(s => ({ value: s.name, label: s.name })));
    });
  }, []);

  const save = async (patch: Partial<LiveService>) => {
    if (!lsId || !ls) return;
    setSaving(true);
    try {
      const updated = await liveServicesApi.update(lsId, patch);
      setLs(updated);
    } finally {
      setSaving(false);
    }
  };

  const sendToDistribution = async () => {
    if (!lsId || !ls) return;
    setSendingToDist(true);
    try {
      const dj = await distributionApi.create({
        distributionType: distType,
        liveServiceId: lsId,
        customerName: ls.customerName,
      });
      setDistModalOpen(false);
      navigate(`/dashboard/distribution/${dj.id}`);
    } finally {
      setSendingToDist(false);
    }
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error || !ls) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error ?? 'Live service not found'}</Alert>
    </Container>
  );

  // Financial release block (R12)
  const releaseBlocked = ls.creditHold || (ls.outstandingBalance != null && ls.outstandingBalance > 0);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/dashboard/service-operations')}>Back</Button>
            <Title order={2} fw={700}>{ls.lsRef}</Title>
            <Badge color="teal" variant="light">{ls.customerName}</Badge>
          </Group>
          {releaseBlocked && (
            <Badge color="red" size="lg" variant="filled">RELEASE BLOCKED</Badge>
          )}
        </Group>

        <Tabs defaultValue="planning">
          <Tabs.List>
            <Tabs.Tab value="planning" leftSection={<IconTool size={16} />}>Service Planning</Tabs.Tab>
            <Tabs.Tab value="access" leftSection={<IconShieldCheck size={16} />}>Site Access & RAMS</Tabs.Tab>
            <Tabs.Tab value="components" leftSection={<IconBox size={16} />}>Components</Tabs.Tab>
            <Tabs.Tab value="documents" leftSection={<IconFileText size={16} />}>Eng. Documents</Tabs.Tab>
            <Tabs.Tab value="financial" leftSection={<IconCurrencyPound size={16} />}>Financial Control</Tabs.Tab>
            <Tabs.Tab value="spec" leftSection={<IconClipboardList size={16} />}>Production Spec</Tabs.Tab>
            <Tabs.Tab value="step4a">Step 4A Checklist</Tabs.Tab>
          </Tabs.List>

          {/* Service Planning (T-075: R8) */}
          <Tabs.Panel value="planning" pt="md">
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Service Planning</Text>
                <Grid gap="sm">
                  <Grid.Col span={4}>
                    <TextInput label="Service Date" type="date"
                      defaultValue={ls.serviceDate?.slice(0, 10) ?? ''}
                      onBlur={(e) => save({ serviceDate: e.currentTarget.value || null })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="Start Time" type="time"
                      value={ls.startTime ?? ''}
                      onChange={(e) => save({ startTime: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="End Time" type="time"
                      value={ls.endTime ?? ''}
                      onChange={(e) => save({ endTime: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Switch label="Firm Time" checked={ls.firmTime}
                      onChange={(e) => save({ firmTime: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Assigned Engineer"
                      placeholder="Select engineer"
                      searchable
                      clearable
                      data={fieldEngineers}
                      value={ls.engineerName ?? null}
                      onChange={v => save({ engineerName: v ?? undefined })}
                      nothingFoundMessage="No field engineers found"
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Team / Resource" value={ls.team ?? ''}
                      onChange={(e) => save({ team: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput label="Hours Planned" min={0} decimalScale={1}
                      value={ls.hoursPlanned ?? ''}
                      onChange={(v) => save({ hoursPlanned: typeof v === 'number' ? v : null })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Out of Service Required" checked={ls.outOfServiceRequired}
                      onChange={(e) => save({ outOfServiceRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Hold Required" checked={ls.holdRequired}
                      onChange={(e) => save({ holdRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Follow-Up Required" checked={ls.followUpRequired}
                      onChange={(e) => save({ followUpRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Site Access & RAMS (T-076: R9) */}
          <Tabs.Panel value="access" pt="md">
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Site Access & RAMS</Text>
                <Grid gap="sm">
                  <Grid.Col span={12}>
                    <Textarea label="Access Notes" value={ls.accessNotes ?? ''}
                      onChange={(e) => save({ accessNotes: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Site Access Times" value={ls.siteAccessTimes ?? ''}
                      onChange={(e) => save({ siteAccessTimes: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Parking" value={ls.parking ?? ''}
                      onChange={(e) => save({ parking: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="RAMS Uploaded" checked={ls.ramsUploaded}
                      onChange={(e) => save({ ramsUploaded: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="RAMS Reviewed" checked={ls.ramsReviewed}
                      onChange={(e) => save({ ramsReviewed: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Induction Required" checked={ls.inductionRequired}
                      onChange={(e) => save({ inductionRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="PASMA Required" checked={ls.pasmaRequired}
                      onChange={(e) => save({ pasmaRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Height Required" checked={ls.heightRequired}
                      onChange={(e) => save({ heightRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Access Agreed" checked={ls.accessAgreed}
                      onChange={(e) => save({ accessAgreed: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Harness Required" checked={ls.harnessRequired}
                      onChange={(e) => save({ harnessRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Switch label="Camera Required" checked={ls.cameraRequired}
                      onChange={(e) => save({ cameraRequired: e.currentTarget.checked })} />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Components (T-077: R10) */}
          <Tabs.Panel value="components" pt="md">
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Components Identification</Text>
                <Grid gap="sm">
                  <Grid.Col span={3}>
                    <NumberInput label="Total Components" min={0}
                      value={ls.totalComponents}
                      onChange={(v) => save({ totalComponents: typeof v === 'number' ? v : 0 })} />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <NumberInput label="To Order" min={0}
                      value={ls.toOrderComponents}
                      onChange={(v) => save({ toOrderComponents: typeof v === 'number' ? v : 0 })} />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <NumberInput label="Out of Stock" min={0}
                      value={ls.outOfStockComponents}
                      onChange={(v) => save({ outOfStockComponents: typeof v === 'number' ? v : 0 })} />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <NumberInput label="Est. Weight (kg)" min={0} decimalScale={1}
                      value={ls.estimatedWeight ?? ''}
                      onChange={(v) => save({ estimatedWeight: typeof v === 'number' ? v : null })} />
                  </Grid.Col>
                </Grid>
                <Button variant="light" size="sm">Order / Manage Components</Button>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Engineering Documents (T-078: R11) */}
          <Tabs.Panel value="documents" pt="md">
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Engineering Documents Checklist</Text>
                <Grid gap="sm">
                  <Grid.Col span={12}>
                    <Switch label="Drawings / Photos available"
                      checked={ls.drawingsAvailable}
                      onChange={(e) => save({ drawingsAvailable: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Switch label="Method Statement"
                      checked={ls.methodStatement}
                      onChange={(e) => save({ methodStatement: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Switch label="Risk Assessment"
                      checked={ls.riskAssessment}
                      onChange={(e) => save({ riskAssessment: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Switch label="Previous Service Report"
                      checked={ls.prevServiceReport}
                      onChange={(e) => save({ prevServiceReport: e.currentTarget.checked })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Switch label="Site Photos"
                      checked={ls.sitePhotos}
                      onChange={(e) => save({ sitePhotos: e.currentTarget.checked })} />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Financial Control (T-079: R12) */}
          <Tabs.Panel value="financial" pt="md">
            <Stack gap="md">
              {releaseBlocked && (
                <Alert icon={<IconAlertCircle />} color="red" title="Release Blocked">
                  {ls.creditHold && 'Credit hold is active. '}
                  {ls.outstandingBalance != null && ls.outstandingBalance > 0
                    ? `Outstanding balance of ${fmtCurrency(ls.outstandingBalance)} must be cleared.`
                    : ''}
                </Alert>
              )}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Financial Control</Text>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <Select
                        label="Account Manager"
                        placeholder="Select account manager"
                        searchable
                        clearable
                        data={officeStaff}
                        value={ls.accountManager ?? null}
                        onChange={v => save({ accountManager: v ?? undefined })}
                        nothingFoundMessage="No office staff found"
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Account Number" value={ls.accountNumber ?? ''}
                        onChange={(e) => save({ accountNumber: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="Outstanding Balance" prefix="£" decimalScale={2}
                        value={ls.outstandingBalance ?? ''}
                        onChange={(v) => save({ outstandingBalance: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Invoice Status" value={ls.invoiceStatus ?? ''}
                        onChange={(e) => save({ invoiceStatus: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="PO Number" value={ls.poNumber ?? ''}
                        onChange={(e) => save({ poNumber: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Switch label="Warranty Approved" checked={ls.warrantyApproved}
                        onChange={(e) => save({ warrantyApproved: e.currentTarget.checked })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Switch label="Credit Hold" checked={ls.creditHold}
                        onChange={(e) => save({ creditHold: e.currentTarget.checked })} />
                    </Grid.Col>
                  </Grid>
                  <Divider />
                  <Group>
                    <Badge size="lg" color={releaseBlocked ? 'red' : 'green'} variant="filled">
                      {releaseBlocked ? 'Release Blocked' : 'Clear to Release'}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
          {/* Step 4A Checklist (T-080: R14) */}
          <Tabs.Panel value="step4a" pt="md">
            {(() => {
              const items = [
                { key: 'step4aPlanComplete' as const, label: 'Plan Complete' },
                { key: 'step4aEngineerAllocated' as const, label: 'Engineer & Team Allocated' },
                { key: 'step4aSiteRams' as const, label: 'Site Accessed & RAMS' },
                { key: 'step4aComponentsIdentified' as const, label: 'Components Identified' },
                { key: 'step4aEngineeringDocs' as const, label: 'Engineering Docs' },
                { key: 'step4aFinancialControl' as const, label: 'Financial Control' },
              ];
              const allChecked = items.every(i => ls[i.key]);
              return (
                <Paper withBorder radius="md" p="lg">
                  <Stack gap="md">
                    <Text fw={600} size="sm">Ready to Send to Production</Text>
                    <Text size="xs" c="dimmed">All 6 items must be confirmed before the job can be sent to production.</Text>
                    <Stack gap="xs">
                      {items.map(item => (
                        <Group key={item.key} p="xs"
                          style={{ borderRadius: 6, background: ls[item.key] ? 'var(--mantine-color-green-0)' : undefined }}>
                          <Switch
                            label={item.label}
                            checked={ls[item.key]}
                            onChange={(e) => save({ [item.key]: e.currentTarget.checked })} />
                          {ls[item.key] && <Badge size="xs" color="green">✓</Badge>}
                        </Group>
                      ))}
                    </Stack>
                    <Button
                      color="green"
                      leftSection={<IconTruck size={16} />}
                      disabled={!allChecked}
                      onClick={() => setDistModalOpen(true)}
                    >
                      {allChecked ? 'Send to Distribution' : 'Complete all items above'}
                    </Button>
                  </Stack>
                </Paper>
              );
            })()}
          </Tabs.Panel>

          {/* Production Spec (T-081: R13) */}
          <Tabs.Panel value="spec" pt="md">
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Spec for Production</Text>
                <Text size="xs" c="dimmed">These fields feed directly into the Manufacturing dashboard when this LS job is sent to production.</Text>
                <Grid gap="sm">
                  <Grid.Col span={6}>
                    <TextInput label="Required By" type="date"
                      defaultValue={ls.specRequiredBy?.slice(0, 10) ?? ''}
                      onBlur={(e) => save({ specRequiredBy: e.currentTarget.value || null })} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select label="Priority"
                      data={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Normal', label: 'Normal' },
                        { value: 'High', label: 'High' },
                        { value: 'Urgent', label: 'Urgent' },
                      ]}
                      value={ls.specPriority || null}
                      onChange={(v) => save({ specPriority: v ?? '' })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea label="Production Notes" minRows={4}
                      value={ls.specNotes ?? ''}
                      onChange={(e) => save({ specNotes: e.currentTarget.value })} />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Distribution routing modal (T-163: R15) */}
      <Modal opened={distModalOpen} onClose={() => setDistModalOpen(false)} title="Send to Distribution">
        <Stack gap="md">
          <Text size="sm">Select the distribution route for this LS job:</Text>
          <Radio.Group value={distType} onChange={(v) => setDistType(v as DistributionType)}>
            <Stack gap="xs">
              <Radio value="COLLECTION" label="6A — Supply Only / Collection" />
              <Radio value="DELIVERY" label="6B — Delivery" />
              <Radio value="INSTALLATION" label="6C — Installation Team" />
            </Stack>
          </Radio.Group>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDistModalOpen(false)}>Cancel</Button>
            <Button color="green" loading={sendingToDist} onClick={sendToDistribution}>
              Confirm &amp; Route
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
