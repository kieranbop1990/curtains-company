import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Text, Badge,
  Grid, Select, NumberInput, Textarea, TextInput, Alert,
  Divider, List, ThemeIcon, Loader, Center, Anchor, Breadcrumbs,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconChevronRight, IconArrowLeft } from '@tabler/icons-react';
import { quotesApi } from 'src/api/quotes';
import type { Quote, QuoteStatus, EnquirySource } from 'src/types/quote';
import { ENQUIRY_SOURCES } from 'src/types/quote';

const STATUS_COLOR: Record<QuoteStatus, string> = {
  NEW: 'cyan',
  ACTIVE: 'yellow',
  WON: 'blue',
  LOST: 'red',
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: 'New',
  ACTIVE: 'Active',
  WON: 'Won',
  LOST: 'Lost',
};

const SOURCE_LABELS: Record<EnquirySource, string> = {
  REFERRAL: 'Referral',
  WEBSITE: 'Website',
  COLD_CALL: 'Cold Call',
  REPEAT_CUSTOMER: 'Repeat Customer',
  TRADE_SHOW: 'Trade Show',
  XERO_IMPORT: 'Xero Import',
  OTHER: 'Other',
};

const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  NEW: ['ACTIVE', 'LOST'],
  ACTIVE: ['WON', 'LOST'],
  WON: [],
  LOST: [],
};

function getWorkflowAlerts(q: Quote): string[] {
  const alerts: string[] = [];
  if (!q.enquirySource) alerts.push('Enquiry source not set');
  if (!q.nextAction) alerts.push('Next action not set');
  if (!q.nextActionDate) alerts.push('Next action date not set');
  if (!q.siteAddress) alerts.push('Site address not captured');
  if (!q.productType) alerts.push('Product type not specified');
  if (!q.orderValue) alerts.push('Quote value not entered');
  return alerts;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
}

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function QuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editProb, setEditProb] = useState<number | string>('');
  const [probSaving, setProbSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (!quoteId) return;
    quotesApi.getQuote(quoteId).then(q => {
      setQuote(q);
      setEditProb(q.probabilityScore ?? '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [quoteId]);

  const handleProbSave = async () => {
    if (!quote) return;
    const v = Number(editProb);
    if (isNaN(v) || v < 0 || v > 100) { setError('Probability must be 0–100'); return; }
    setProbSaving(true);
    try {
      const updated = await quotesApi.updateQuote(quote.id, { probabilityScore: v });
      setQuote(updated);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setProbSaving(false); }
  };

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!quote) return;
    setStatusSaving(true);
    try {
      const updated = await quotesApi.updateQuote(quote.id, { status: newStatus });
      setQuote(updated);
    } catch (e: any) { setError(e.message); }
    finally { setStatusSaving(false); }
  };

  const handleFieldSave = async (field: keyof Quote, value: any) => {
    if (!quote) return;
    setSaving(true);
    try {
      const updated = await quotesApi.updateQuote(quote.id, { [field]: value });
      setQuote(updated);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (!quote) return <Center p="xl"><Text c="dimmed">Quote not found.</Text></Center>;

  const alerts = getWorkflowAlerts(quote);
  const allowedNext = ALLOWED_TRANSITIONS[quote.status];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          <Anchor onClick={() => navigate('/dashboard/quotes')} size="sm">Quotes</Anchor>
          <Text size="sm">{quote.quoteRef}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={2} fw={700}>{quote.quoteRef}</Title>
              <Badge color={STATUS_COLOR[quote.status]} variant="light" size="lg">
                {STATUS_LABELS[quote.status]}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm">{quote.customerName}</Text>
          </Stack>
          <Group>
            <Button
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/dashboard/quotes')}
            >
              Back
            </Button>
          </Group>
        </Group>

        {error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}

        <Grid gap="lg">
          {/* Left column */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Customer & Site Info */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Customer & Site Information</Title>
                <Grid gap="md">
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Customer</Text>
                    <Text size="sm">{quote.customerName || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Email</Text>
                    <Text size="sm">{quote.customerEmail || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Phone</Text>
                    <Text size="sm">{quote.customerPhone || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Site Address</Text>
                    <Text size="sm">{quote.siteAddress || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Site Type</Text>
                    <Text size="sm">{quote.siteType || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Supply Type</Text>
                    <Text size="sm">{quote.supplyType || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Product Type</Text>
                    <Text size="sm">{quote.productType || '—'}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Dimensions (W×H mm)</Text>
                    <Text size="sm">
                      {quote.widthMm && quote.heightMm ? `${quote.widthMm} × ${quote.heightMm}` : '—'}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Enquiry Source */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Enquiry Source</Title>
                <Select
                  placeholder="Select enquiry source"
                  data={ENQUIRY_SOURCES.map(s => ({ value: s, label: SOURCE_LABELS[s] }))}
                  value={quote.enquirySource ?? null}
                  onChange={(v) => handleFieldSave('enquirySource', v)}
                  disabled={saving}
                  w={280}
                />
              </Paper>

              {/* AI Probability Score */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">AI Probability Score</Title>
                <Group align="flex-end" gap="sm">
                  <NumberInput
                    label="Win Probability (%)"
                    description="Manual entry, 0–100"
                    min={0}
                    max={100}
                    value={editProb}
                    onChange={setEditProb}
                    w={180}
                  />
                  <Button onClick={handleProbSave} loading={probSaving} variant="outline" mb={4}>
                    Save
                  </Button>
                </Group>
                {quote.probabilityScore != null && (
                  <Text size="sm" c="dimmed" mt="xs">
                    Current: <strong>{quote.probabilityScore}%</strong>
                  </Text>
                )}
              </Paper>

              {/* Next Action */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Next Action</Title>
                <Grid gap="md">
                  <Grid.Col span={8}>
                    <TextInput
                      label="Next Action"
                      defaultValue={quote.nextAction}
                      onBlur={e => { if (e.target.value !== quote.nextAction) handleFieldSave('nextAction', e.target.value); }}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput
                      label="Action Date"
                      type="date"
                      defaultValue={quote.nextActionDate ? quote.nextActionDate.slice(0, 10) : ''}
                      onBlur={e => {
                        const v = e.target.value || null;
                        if (v !== quote.nextActionDate?.slice(0, 10)) handleFieldSave('nextActionDate', v);
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Notes */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Notes</Title>
                <Textarea
                  rows={4}
                  defaultValue={quote.notes}
                  onBlur={e => { if (e.target.value !== quote.notes) handleFieldSave('notes', e.target.value); }}
                />
              </Paper>

              {/* Timeline placeholder */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Timeline</Title>
                <Text c="dimmed" size="sm">
                  Created {fmtDate(quote.createdAt)} · Last updated {fmtDate(quote.updatedAt)}
                </Text>
              </Paper>

              {/* What Happens Next */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">What Happens Next?</Title>
                <Text size="sm">
                  When this quote is marked as <strong>Won</strong>, you can promote it to a
                  <strong> Stage 2 Live Quote (LQ)</strong>. The LQ record will be pre-populated
                  with the customer and site information from this quote.
                </Text>
                <Divider my="sm" />
                <Text size="sm" c="dimmed">
                  Trigger: Won status + &quot;Convert to Live Quote&quot; action
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right column */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Status */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Status</Title>
                <Stack gap="xs">
                  {(['NEW', 'ACTIVE', 'WON', 'LOST'] as QuoteStatus[]).map(s => (
                    <Button
                      key={s}
                      variant={quote.status === s ? 'filled' : 'outline'}
                      color={STATUS_COLOR[s]}
                      size="sm"
                      fullWidth
                      disabled={!allowedNext.includes(s) && quote.status !== s}
                      loading={statusSaving && quote.status !== s}
                      onClick={() => allowedNext.includes(s) ? handleStatusChange(s) : undefined}
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </Stack>
                {quote.status === 'WON' && (
                  <Button mt="md" color="blue" fullWidth
                    onClick={async () => {
                      try {
                        const result = await quotesApi.convertToLq(quote.id);
                        navigate(`/dashboard/live-projects/${result.liveProjectId}`);
                      } catch (e: any) { setError(e.message); }
                    }}>
                    Convert to Live Quote
                  </Button>
                )}
              </Paper>

              {/* Workflow Alerts */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Workflow Alerts</Title>
                {alerts.length === 0 ? (
                  <Group gap="xs">
                    <ThemeIcon color="green" size="sm" radius="xl" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm" c="green">All items complete</Text>
                  </Group>
                ) : (
                  <List spacing="xs" size="sm">
                    {alerts.map(a => (
                      <List.Item
                        key={a}
                        icon={
                          <ThemeIcon color="red" size="sm" radius="xl" variant="light">
                            <IconAlertCircle size={12} />
                          </ThemeIcon>
                        }
                      >
                        {a}
                      </List.Item>
                    ))}
                  </List>
                )}
              </Paper>

              {/* Quick Actions */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Quick Actions</Title>
                <Stack gap="sm">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftSection={<IconArrowLeft size={14} />}
                    onClick={() => navigate('/dashboard/quotes?create=1')}
                  >
                    Create New Quote
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    color="gray"
                    disabled
                    title="Select a quote first"
                  >
                    Email Quick Quote
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    color="gray"
                    disabled
                    title="Generate PDF"
                  >
                    Generate Quick Quote PDF
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
