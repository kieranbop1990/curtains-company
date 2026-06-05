import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, Text, Badge,
  NumberInput, Select, Stepper, Progress, Textarea, TextInput,
  Divider, ActionIcon, Table, Modal, Center, Loader, Alert,
  Switch,
} from '@mantine/core';
import { IconArrowLeft, IconPlus, IconTrash, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { serviceQuotesApi } from 'src/api/service-operations';
import { staffApi } from 'src/api/staff';
import { assetsApi } from 'src/api/assets';
import type { Asset } from 'src/types/asset';
import type { ServiceQuote, ServiceQuoteStatus, ChaseEntry } from 'src/types/service-operations';

const STATUS_STEPS: ServiceQuoteStatus[] = ['QUOTE_DRAFTED', 'SENT', 'CHASING', 'ORDER_PLACED', 'LIVE_CLOSED'];
const STATUS_LABELS: Record<ServiceQuoteStatus, string> = {
  QUOTE_DRAFTED: 'Quote Drafted', SENT: 'Sent', CHASING: 'Chasing',
  ORDER_PLACED: 'Order Placed', LIVE_CLOSED: 'Live / Closed',
};
const STATUS_COLOR: Record<ServiceQuoteStatus, string> = {
  QUOTE_DRAFTED: 'gray', SENT: 'blue', CHASING: 'yellow',
  ORDER_PLACED: 'green', LIVE_CLOSED: 'teal',
};

const FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'SEMI_ANNUAL', label: '6-Monthly' },
  { value: 'ANNUAL', label: 'Annual' },
];

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function fmtDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB');
}

export default function ServiceQuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<ServiceQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chaseModalOpen, setChaseModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [linkedAsset, setLinkedAsset] = useState<Asset | null>(null);

  // Chase form state
  const [chaseDate, setChaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [chasedBy, setChasedBy] = useState('');
  const [chaseMethod, setChaseMethod] = useState('');
  const [officeStaff, setOfficeStaff] = useState<{ value: string; label: string }[]>([]);
  const [chaseOutcome, setChaseOutcome] = useState('');
  const [chaseNextDate, setChaseNextDate] = useState('');

  const load = useCallback(() => {
    if (!quoteId) return;
    setLoading(true);
    serviceQuotesApi.get(quoteId)
      .then(setQuote)
      .catch(() => setError('Failed to load service quote'))
      .finally(() => setLoading(false));
  }, [quoteId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (quote?.assetId) {
      assetsApi.getAsset(quote.assetId).then(setLinkedAsset).catch(() => {});
    } else {
      setLinkedAsset(null);
    }
  }, [quote?.assetId]);

  useEffect(() => {
    staffApi.getAll().then(all => {
      setOfficeStaff(all.filter(s => s.active && (s.role === 'OFFICE_OPERATIONS' || s.role === 'ADMIN')).map(s => ({ value: s.name, label: s.name })));
    });
  }, []);

  const save = async (patch: Partial<ServiceQuote>) => {
    if (!quoteId || !quote) return;
    setSaving(true);
    try {
      const updated = await serviceQuotesApi.update(quoteId, patch);
      setQuote(updated);
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async (target: ServiceQuoteStatus) => {
    if (!quoteId) return;
    setSaving(true);
    try {
      const updated = await serviceQuotesApi.advanceStatus(quoteId, target);
      setQuote(updated);
    } finally {
      setSaving(false);
    }
  };

  const convertToLs = async () => {
    if (!quoteId) return;
    setConverting(true);
    try {
      const result = await serviceQuotesApi.convertToLs(quoteId);
      navigate(`/dashboard/service-operations/ls/${result.liveServiceId}`);
    } catch {
      setError('Failed to convert to Live Service');
    } finally {
      setConverting(false);
    }
  };

  const addChaseEntry = async () => {
    if (!quoteId || !chaseDate || !chasedBy) return;
    setSaving(true);
    try {
      await serviceQuotesApi.addChaseEntry(quoteId, {
        chaseDate,
        chasedBy,
        method: chaseMethod,
        outcome: chaseOutcome,
        nextActionDate: chaseNextDate || undefined,
      });
      setChaseModalOpen(false);
      setChasedBy(''); setChaseMethod(''); setChaseOutcome(''); setChaseNextDate('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const deleteChaseEntry = async (entryId: string) => {
    if (!quoteId) return;
    await serviceQuotesApi.deleteChaseEntry(quoteId, entryId);
    load();
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error || !quote) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error ?? 'Quote not found'}</Alert>
    </Container>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(quote.status);
  const nextStatus = currentStepIndex < STATUS_STEPS.length - 1 ? STATUS_STEPS[currentStepIndex + 1] : null;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/dashboard/service-operations')}>Back</Button>
            <Title order={2} fw={700}>{quote.sQuoteRef}</Title>
            <Badge color={STATUS_COLOR[quote.status]} variant="light">{STATUS_LABELS[quote.status]}</Badge>
          </Group>
          {quote.status === 'ORDER_PLACED' && (
            <Button color="teal" loading={converting} onClick={convertToLs}>
              Convert to Live Service
            </Button>
          )}
        </Group>

        {/* Status Stepper */}
        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
            <Stepper active={currentStepIndex} size="sm">
              {STATUS_STEPS.map((s) => (
                <Stepper.Step key={s} label={STATUS_LABELS[s]} />
              ))}
            </Stepper>
            {nextStatus && (
              <Group justify="flex-end">
                <Button size="sm" loading={saving}
                  onClick={() => advanceStatus(nextStatus)}>
                  Advance to {STATUS_LABELS[nextStatus]}
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>

        <Grid gap="lg">
          {/* Left column */}
          <Grid.Col span={8}>
            <Stack gap="lg">
              {/* Core fields */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Quote Details</Text>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <TextInput label="Customer" value={quote.customerName}
                        onChange={(e) => save({ customerName: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Asset Ref" value={quote.assetRef ?? ''}
                        onChange={(e) => save({ assetRef: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Service Category" value={quote.serviceCategory ?? ''}
                        onChange={(e) => save({ serviceCategory: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Contract Type" value={quote.contractType ?? ''}
                        onChange={(e) => save({ contractType: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Select label="Frequency" data={FREQUENCY_OPTIONS}
                        value={quote.frequency ?? null} clearable
                        onChange={(v) => save({ frequency: v as any })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="No. of Visits" value={quote.numVisits ?? ''}
                        onChange={(v) => save({ numVisits: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="SLA Response" value={quote.slaResponse ?? ''}
                        onChange={(e) => save({ slaResponse: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="SLA Resolution" value={quote.slaResolution ?? ''}
                        onChange={(e) => save({ slaResolution: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Switch label="Auto-Renewal" checked={quote.autoRenewal}
                        onChange={(e) => save({ autoRenewal: e.currentTarget.checked })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Switch label="Fabric Included" checked={quote.fabricIncluded}
                        onChange={(e) => save({ fabricIncluded: e.currentTarget.checked })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Switch label="Labour Included" checked={quote.labourIncluded}
                        onChange={(e) => save({ labourIncluded: e.currentTarget.checked })} />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>

              {/* Value fields (T-067) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Value & Contract Terms</Text>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <NumberInput label="Service Rate (ex VAT)" prefix="£"
                        decimalScale={2} value={quote.serviceRate ?? ''}
                        onChange={(v) => save({ serviceRate: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="Annual Revenue (ex VAT)" prefix="£"
                        decimalScale={2} value={quote.annualRevenueExVat ?? ''}
                        onChange={(v) => save({ annualRevenueExVat: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="Annual Revenue (inc VAT)" prefix="£"
                        decimalScale={2} value={quote.annualRevenueIncVat ?? ''}
                        onChange={(v) => save({ annualRevenueIncVat: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="One-Off Payment" prefix="£"
                        decimalScale={2} value={quote.oneOffPayment ?? ''}
                        onChange={(v) => save({ oneOffPayment: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput label="Payment Terms" value={quote.paymentTerms ?? ''}
                        onChange={(e) => save({ paymentTerms: e.currentTarget.value })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput label="Pricing Hold Until" type="date"
                        defaultValue={quote.pricingHoldUntil?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ pricingHoldUntil: e.currentTarget.value || null })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput label="Contract Start" type="date"
                        defaultValue={quote.contractStart?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ contractStart: e.currentTarget.value || null })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput label="Contract End" type="date"
                        defaultValue={quote.contractEnd?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ contractEnd: e.currentTarget.value || null })} />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>

              {/* Xero source (T-070) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Xero Document</Text>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <Select label="Source" clearable
                        data={[
                          { value: 'UPLOAD', label: 'PDF Upload' },
                          { value: 'API', label: 'Xero API Import' },
                        ]}
                        value={quote.xeroSource ?? null}
                        onChange={(v) => save({ xeroSource: v })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Xero Document Key" value={quote.xeroDocumentKey ?? ''}
                        onChange={(e) => save({ xeroDocumentKey: e.currentTarget.value })} />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>

              {/* Chase log (T-068) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Chase / CRM Log</Text>
                    <Button size="xs" leftSection={<IconPlus size={14} />}
                      onClick={() => setChaseModalOpen(true)}>Add Entry</Button>
                  </Group>
                  {quote.chaseEntries.length === 0 ? (
                    <Text c="dimmed" size="sm">No chase entries yet.</Text>
                  ) : (
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Date</Table.Th>
                          <Table.Th>Chased By</Table.Th>
                          <Table.Th>Method</Table.Th>
                          <Table.Th>Outcome</Table.Th>
                          <Table.Th>Next Action</Table.Th>
                          <Table.Th></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {[...quote.chaseEntries]
                          .sort((a, b) => a.chaseDate.localeCompare(b.chaseDate))
                          .map((entry: ChaseEntry) => (
                            <Table.Tr key={entry.id}>
                              <Table.Td>{fmtDate(entry.chaseDate)}</Table.Td>
                              <Table.Td>{entry.chasedBy}</Table.Td>
                              <Table.Td>{entry.method || '—'}</Table.Td>
                              <Table.Td>{entry.outcome || '—'}</Table.Td>
                              <Table.Td>{fmtDate(entry.nextActionDate)}</Table.Td>
                              <Table.Td>
                                <ActionIcon size="sm" color="red" variant="subtle"
                                  onClick={() => deleteChaseEntry(entry.id)}>
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right column */}
          <Grid.Col span={4}>
            <Stack gap="lg">
              {/* Probability (T-069) */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="sm">
                  <Text fw={600} size="sm">Sales Probability</Text>
                  <NumberInput
                    label="Probability (%)"
                    min={0} max={100}
                    value={quote.probability ?? ''}
                    onChange={(v) => save({ probability: typeof v === 'number' ? Math.min(100, Math.max(0, v)) : null })}
                  />
                  {quote.probability != null && (
                    <Stack gap={4}>
                      <Progress
                        value={quote.probability}
                        color={quote.probability >= 70 ? 'green' : quote.probability >= 40 ? 'yellow' : 'red'}
                        size="lg" radius="xl"
                      />
                      <Text size="xs" c="dimmed" ta="right">{quote.probability}%</Text>
                    </Stack>
                  )}
                </Stack>
              </Paper>

              {/* Summary */}
              <Paper withBorder radius="md" p="lg">
                <Stack gap="xs">
                  <Text fw={600} size="sm">Summary</Text>
                  <Divider />
                  {[
                    ['Ref', quote.sQuoteRef],
                    ['Service Rate', fmtCurrency(quote.serviceRate)],
                    ['Annual (ex VAT)', fmtCurrency(quote.annualRevenueExVat)],
                    ['Annual (inc VAT)', fmtCurrency(quote.annualRevenueIncVat)],
                    ['One-Off', fmtCurrency(quote.oneOffPayment)],
                    ['Contract Start', fmtDate(quote.contractStart)],
                    ['Contract End', fmtDate(quote.contractEnd)],
                    ['Created', fmtDate(quote.createdAt)],
                  ].map(([label, value]) => (
                    <Group key={label as string} justify="space-between">
                      <Text size="sm" c="dimmed">{label}</Text>
                      <Text size="sm" fw={500}>{value}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>

              {/* Linked Asset */}
              {(linkedAsset || quote.assetRef) && (
                <Paper withBorder radius="md" p="lg">
                  <Text fw={600} size="sm" mb="sm">Linked Asset</Text>
                  {linkedAsset ? (
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" fw={600}>{linkedAsset.assetRef}</Text>
                        <Badge size="sm" color={
                          linkedAsset.status === 'LIVE_ACTIVE' ? 'green' :
                          linkedAsset.status === 'SERVICE_DUE' ? 'yellow' :
                          linkedAsset.status === 'OVERDUE' ? 'red' : 'gray'
                        } variant="light">{linkedAsset.status.replace('_', ' ')}</Badge>
                      </Group>
                      <Text size="xs" c="dimmed">{linkedAsset.systemType || '—'}</Text>
                      <Text size="xs" c="dimmed">{linkedAsset.siteName || '—'}</Text>
                      {linkedAsset.nextServiceDate && (
                        <Text size="xs" c="dimmed">
                          Next service: {new Date(linkedAsset.nextServiceDate).toLocaleDateString('en-GB')}
                        </Text>
                      )}
                      <Button size="xs" variant="outline" mt="xs"
                        onClick={() => navigate(`/dashboard/assets/${linkedAsset.id}`)}>
                        View Asset Profile
                      </Button>
                    </Stack>
                  ) : (
                    <Stack gap="xs">
                      <Text size="sm">{quote.assetRef}</Text>
                      <Text size="xs" c="dimmed">Asset not found in system</Text>
                    </Stack>
                  )}
                </Paper>
              )}

              <Button variant="light" leftSection={<IconRefresh size={16} />}
                onClick={load} loading={loading}>
                Refresh
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Chase Entry Modal */}
      <Modal opened={chaseModalOpen} onClose={() => setChaseModalOpen(false)} title="Add Chase Entry">
        <Stack gap="sm">
          <TextInput label="Chase Date" type="date" required value={chaseDate} onChange={(e) => setChaseDate(e.currentTarget.value)} />
          <Select label="Chased By" required placeholder="Select staff member"
            data={officeStaff} searchable clearable
            value={chasedBy || null}
            onChange={v => setChasedBy(v ?? '')} />
          <TextInput label="Method" value={chaseMethod} onChange={(e) => setChaseMethod(e.currentTarget.value)} />
          <Textarea label="Outcome" value={chaseOutcome} onChange={(e) => setChaseOutcome(e.currentTarget.value)} />
          <TextInput label="Next Action Date" type="date" value={chaseNextDate} onChange={(e) => setChaseNextDate(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setChaseModalOpen(false)}>Cancel</Button>
            <Button onClick={addChaseEntry} loading={saving} disabled={!chasedBy || !chaseDate}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
