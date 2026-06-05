import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Text, Badge,
  Grid, TextInput, NumberInput, Checkbox, Select, Alert,
  Table, ActionIcon, Modal, Textarea, Loader, Center,
  Anchor, Breadcrumbs, SimpleGrid, Divider, Stepper, RingProgress,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle, IconChevronRight, IconPlus, IconTrash,
  IconArrowRight, IconCheck, IconExternalLink, IconUpload, IconDownload,
  IconPackage, IconTool,
} from '@tabler/icons-react';
import { liveProjectsApi } from 'src/api/live-projects';
import { staffApi } from 'src/api/staff';
import { StageSummaryBar } from 'src/components/StageSummaryBar';
import { StageProgress } from 'src/components/StageProgress';
import type {
  LiveProject, DrawingStatus, ReviewStatus, LQInvoice, LQDrawing, LQComponent, LQInstallationItem,
} from 'src/types/live-project';

const DRAWING_STATUS_COLOR: Record<DrawingStatus, string> = { ISSUED: 'yellow', APPROVED: 'green', REJECTED: 'red' };
const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  NOT_STARTED: 'gray', IN_REVIEW: 'yellow', CUSTOMER_APPROVED: 'green', CUSTOMER_REJECTED: 'red',
};
const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  NOT_STARTED: 'Not Started', IN_REVIEW: 'In Review',
  CUSTOMER_APPROVED: 'Customer Approved', CUSTOMER_REJECTED: 'Customer Rejected',
};
const STOCK_STATUS_COLOR: Record<string, string> = {
  IN_STOCK: 'green', OUT_OF_STOCK: 'red', ON_ORDER: 'yellow',
};
const STOCK_STATUS_LABELS: Record<string, string> = {
  IN_STOCK: 'In Stock', OUT_OF_STOCK: 'Out of Stock', ON_ORDER: 'On Order',
};

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
}

function isoDate(d: string | null): string {
  if (!d) return '';
  return d.slice(0, 10);
}

function computeOutstanding(lp: LiveProject): number {
  const total = lp.totalContractValue ?? 0;
  const paid = lp.paidToDate ?? 0;
  return total - paid;
}

function computeGates(lp: LiveProject) {
  const gates = [
    { label: 'Customer name', passed: !!lp.customerName },
    { label: 'Contract value set', passed: lp.totalContractValue != null },
    { label: 'Assignee set', passed: !!lp.assigneeName },
  ];
  return gates;
}

function computeStage3Gates(lp: LiveProject) {
  const hasApprovedDrawingWithFile = lp.drawings.some(d => d.status === 'APPROVED' && d.s3Key);
  const gates = [
    { label: 'Survey completed', passed: lp.surveySignedOff },
    { label: 'Drawing approved with file uploaded', passed: hasApprovedDrawingWithFile },
    { label: 'Customer sign-off', passed: lp.reviewStatus === 'CUSTOMER_APPROVED' },
    { label: 'Components listed (≥1)', passed: lp.components.length >= 1 },
  ];
  return gates;
}

export default function LiveProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [lp, setLp] = useState<LiveProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [addInvOpen, setAddInvOpen] = useState(false);
  const [addDrawingOpen, setAddDrawingOpen] = useState(false);
  const [addCostOpen, setAddCostOpen] = useState(false);
  const [addInstOpen, setAddInstOpen] = useState(false);
  const [addCompOpen, setAddCompOpen] = useState(false);
  const [xeroSyncing, setXeroSyncing] = useState(false);
  const [officeStaff, setOfficeStaff] = useState<{ value: string; label: string }[]>([]);
  const [surveyStaff, setSurveyStaff] = useState<{ value: string; label: string }[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<{ type: 'drawing' | 'invoice'; id: string } | null>(null);
  const [routingCreating, setRoutingCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;
    liveProjectsApi.get(projectId).then(p => { setLp(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    staffApi.getAll().then(all => {
      const active = all.filter(s => s.active);
      setOfficeStaff(active.filter(s => s.role === 'OFFICE_OPERATIONS' || s.role === 'ADMIN').map(s => ({ value: s.name, label: s.name })));
      setSurveyStaff(active.map(s => ({ value: s.name, label: `${s.name} (${s.role.replace(/_/g, ' ')})` })));
    });
  }, []);

  const reload = async () => {
    if (!projectId) return;
    const p = await liveProjectsApi.get(projectId);
    setLp(p);
  };

  const handleField = async (field: string, value: any) => {
    if (!lp) return;
    setSaving(true);
    try {
      const updated = await liveProjectsApi.update(lp.id, { [field]: value });
      setLp(updated);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleAdvanceToStage3 = async () => {
    if (!lp) return;
    try {
      const updated = await liveProjectsApi.advanceToStage3(lp.id);
      setLp(updated);
    } catch (e: any) { setError(e.message); }
  };

  const handleRoute = async (decision: 'PRODUCTION_PACK' | 'LIVE_SERVICES') => {
    if (!lp) return;
    try {
      const updated = await liveProjectsApi.route(lp.id, decision);
      setLp(updated);
    } catch (e: any) { setError(e.message); }
  };

  const handleXeroSync = async () => {
    if (!lp) return;
    setXeroSyncing(true);
    try {
      await liveProjectsApi.syncXeroInvoices(lp.id);
      await reload();
    } catch (e: any) { setError(e.message); }
    finally { setXeroSyncing(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!lp || !pendingUpload || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadingId(pendingUpload.id);
    try {
      if (pendingUpload.type === 'drawing') {
        const { url } = await liveProjectsApi.getDrawingUploadUrl(lp.id, pendingUpload.id, file.type, file.name);
        await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      } else {
        const { url } = await liveProjectsApi.getInvoiceUploadUrl(lp.id, pendingUpload.id, file.type, file.name);
        await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      }
      await reload();
    } catch { /* upload failed */ }
    finally {
      setUploadingId(null);
      setPendingUpload(null);
      e.target.value = '';
    }
  };

  const triggerUpload = (type: 'drawing' | 'invoice', id: string) => {
    setPendingUpload({ type, id });
    fileInputRef.current?.click();
  };

  const handleRoutingNav = async (decision: 'PRODUCTION_PACK' | 'LIVE_SERVICES') => {
    if (!lp) return;
    setRoutingCreating(true);
    try {
      if (decision === 'PRODUCTION_PACK') {
        const { productionPackApi } = await import('src/api/production-pack');
        const pack = await productionPackApi.create({ liveProjectId: lp.id });
        navigate(`/dashboard/production-packs/${pack.id}`);
      } else {
        navigate(`/dashboard/service-operations/add?customerName=${encodeURIComponent(lp.customerName)}&lqRef=${encodeURIComponent(lp.lqRef)}`);
      }
    } catch { /* navigation fallback */ }
    finally { setRoutingCreating(false); }
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (!lp) return <Center p="xl"><Text c="dimmed">Project not found.</Text></Center>;

  const outstanding = computeOutstanding(lp);
  const totalPaid = lp.paidToDate ?? 0;
  const stage2Gates = computeGates(lp);
  const stage3Gates = computeStage3Gates(lp);
  const stage2Blocked = stage2Gates.some(g => !g.passed);
  const stage3Blocked = stage3Gates.some(g => !g.passed);
  const stageIndex = lp.stage === 'LQ' ? 1 : 2;

  // Donut chart data for components
  const componentGroups = ['IN_STOCK', 'OUT_OF_STOCK', 'ON_ORDER'].map(status => ({
    status, count: lp.components.filter(c => c.stockStatus === status).length,
  }));
  const totalComponents = lp.components.length;

  return (
    <Container size="xl" py="xl">
      <input ref={fileInputRef} type="file" accept=".pdf,.dwg,.dxf,.png,.jpg" style={{ display: 'none' }} onChange={handleFileUpload} />
      <Stack gap="lg">
        <StageProgress current={lp.stage === 'LQ' ? 'live-quotes' : 'survey-drawings'} />

        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          <Anchor onClick={() => navigate('/dashboard/live-projects')} size="sm">Live Projects</Anchor>
          <Text size="sm">{lp.lqRef}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={2} fw={700}>{lp.lqRef}</Title>
              <Badge color={lp.stage === 'LQ' ? 'blue' : 'violet'} variant="light" size="lg">
                {lp.stage === 'LQ' ? 'Stage 2 — Live Quote' : 'Stage 3 — Survey & Drawings'}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm">{lp.customerName}</Text>
          </Stack>
        </Group>

        {error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}

        {/* Stage progress */}
        <Stepper active={stageIndex} size="sm">
          <Stepper.Step label="Stage 1" description="Quote" />
          <Stepper.Step label="Stage 2" description="Live Quote (LQ)" />
          <Stepper.Step label="Stage 3" description="Survey & Drawings" />
          <Stepper.Step label="Stage 4" description="Production / Live Services" />
        </Stepper>

        <Grid gap="lg">
          {/* Main column */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Financial Summary (R1) */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Financial Summary</Title>
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                  <div><Text size="sm" c="dimmed">Total Contract Value</Text><Text fw={700}>{fmtCurrency(lp.totalContractValue)}</Text></div>
                  <div><Text size="sm" c="dimmed">Paid to Date</Text><Text fw={700} c="green">{fmtCurrency(totalPaid)}</Text></div>
                  <div><Text size="sm" c="dimmed">Outstanding Balance</Text><Text fw={700} c={outstanding > 0 ? 'red' : 'green'}>{fmtCurrency(outstanding)}</Text></div>
                  <div><Text size="sm" c="dimmed">VAT</Text><Text fw={700}>{fmtCurrency(lp.vatAmount)}</Text></div>
                  <div><Text size="sm" c="dimmed">Forecast Balance</Text><Text fw={700}>{fmtCurrency((lp.totalContractValue ?? 0) + (lp.vatAmount ?? 0) - totalPaid)}</Text></div>
                </SimpleGrid>
                <Divider my="sm" />
                <Group gap="sm" align="flex-end">
                  <NumberInput label="Total Contract Value (£)" defaultValue={lp.totalContractValue ?? undefined}
                    onBlur={e => handleField('totalContractValue', e.target.value ? Number(e.target.value) : null)} w={200} />
                  <NumberInput label="Paid to Date (£)" defaultValue={lp.paidToDate ?? undefined}
                    onBlur={e => handleField('paidToDate', e.target.value ? Number(e.target.value) : null)} w={160} />
                  <NumberInput label="VAT (£)" defaultValue={lp.vatAmount ?? undefined}
                    onBlur={e => handleField('vatAmount', e.target.value ? Number(e.target.value) : null)} w={140} />
                  <TextInput label="Payment Terms"
                    defaultValue={lp.paymentTerms}
                    onBlur={e => { if (e.target.value !== lp.paymentTerms) handleField('paymentTerms', e.target.value); }}
                    w={180} />
                </Group>
              </Paper>

              {/* Costing Breakdown — Installation & Commissioning Allowance */}
              <Paper withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4} fw={600}>Costing — Installation & Commissioning</Title>
                  <Button size="xs" variant="outline" leftSection={<IconPlus size={12} />} onClick={() => setAddCostOpen(true)}>Add Line</Button>
                </Group>
                {(lp.costingItems ?? []).length === 0 ? (
                  <Text size="sm" c="dimmed">No costing lines added. Click "Add Line" to break down costs.</Text>
                ) : (
                  <Table withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Unit Cost (£)</Table.Th>
                        <Table.Th>Total (£)</Table.Th>
                        <Table.Th></Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {(lp.costingItems ?? []).map(item => (
                        <Table.Tr key={item.id}>
                          <Table.Td>{item.description}</Table.Td>
                          <Table.Td>{item.qty}</Table.Td>
                          <Table.Td>{fmtCurrency(item.unitCost)}</Table.Td>
                          <Table.Td fw={600}>{fmtCurrency(item.total)}</Table.Td>
                          <Table.Td>
                            <ActionIcon size="xs" color="red" variant="subtle"
                              onClick={async () => { await liveProjectsApi.deleteCostingItem(lp.id, item.id); reload(); }}>
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      <Table.Tr style={{ fontWeight: 700 }}>
                        <Table.Td colSpan={3}>Total before VAT</Table.Td>
                        <Table.Td>{fmtCurrency((lp.costingItems ?? []).reduce((s, i) => s + i.total, 0))}</Table.Td>
                        <Table.Td />
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                )}
              </Paper>

              {/* Key Milestone Dates (R2) */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Key Milestone Dates</Title>
                <Grid gap="md">
                  {[
                    ['surveyDate', 'Survey Date'],
                    ['drawingsDue', 'Drawings Due'],
                    ['drawingsApprovedDate', 'Drawings Approved'],
                    ['installationBooked', 'Installation Booked'],
                    ['expectedCompletion', 'Expected Completion'],
                  ].map(([field, label]) => (
                    <Grid.Col span={4} key={field}>
                      <TextInput label={label} type="date"
                        defaultValue={isoDate((lp as any)[field])}
                        onBlur={e => handleField(field, e.target.value || null)} />
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>

              {/* Installation & Commission Schedule (R3) */}
              <Paper withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4} fw={600}>Installation & Commission Schedule</Title>
                  <Button size="xs" variant="outline" leftSection={<IconPlus size={12} />} onClick={() => setAddInstOpen(true)}>Add</Button>
                </Group>
                <Table withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>System</Table.Th>
                      <Table.Th>Installation</Table.Th>
                      <Table.Th>Commission</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Paid</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {lp.installationSchedule.map(item => (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.systemName}</Table.Td>
                        <Table.Td>{fmtDate(item.installationDate)}</Table.Td>
                        <Table.Td>{fmtDate(item.commissionDate)}</Table.Td>
                        <Table.Td>{fmtCurrency(item.amount)}</Table.Td>
                        <Table.Td>
                          <Checkbox checked={item.paid}
                            onChange={async e => {
                              await liveProjectsApi.updateInstallationItem(lp.id, item.id, { paid: e.target.checked });
                              reload();
                            }} />
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon size="xs" color="red" variant="subtle"
                            onClick={async () => { await liveProjectsApi.deleteInstallationItem(lp.id, item.id); reload(); }}>
                            <IconTrash size={12} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {lp.installationSchedule.length === 0 && (
                      <Table.Tr><Table.Td colSpan={6}><Text size="sm" c="dimmed" ta="center">No items</Text></Table.Td></Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Paper>

              {/* Invoice Management (R4) */}
              <Paper withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4} fw={600}>Invoice Management</Title>
                  <Group gap="xs">
                    <Button size="xs" variant="outline" loading={xeroSyncing} onClick={handleXeroSync}>Sync Xero</Button>
                    <Button size="xs" variant="outline" leftSection={<IconPlus size={12} />} onClick={() => setAddInvOpen(true)}>Add Invoice</Button>
                  </Group>
                </Group>
                <Table withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Invoice No.</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>PDF</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {lp.invoices.map(inv => (
                      <Table.Tr key={inv.id}>
                        <Table.Td><Text size="sm" fw={600}>{inv.invoiceNumber}</Text></Table.Td>
                        <Table.Td>
                          <Select size="xs" data={['PENDING', 'PAID'].map(v => ({ value: v, label: v }))}
                            value={inv.status} w={100}
                            onChange={async v => { await liveProjectsApi.updateInvoice(lp.id, inv.id, { status: v }); reload(); }} />
                        </Table.Td>
                        <Table.Td>{fmtCurrency(inv.amount)}</Table.Td>
                        <Table.Td>{fmtDate(inv.dueDate)}</Table.Td>
                        <Table.Td>
                          {inv.s3Key ? (
                            <Button size="xs" variant="light" color="green" leftSection={<IconDownload size={11} />}
                              loading={uploadingId === inv.id}
                              onClick={() => liveProjectsApi.downloadInvoice(lp.id, inv.id).catch(() => {})}>
                              PDF ✓
                            </Button>
                          ) : (
                            <Button size="xs" variant="subtle" color="gray" leftSection={<IconUpload size={11} />}
                              loading={uploadingId === inv.id}
                              onClick={() => triggerUpload('invoice', inv.id)}>
                              Upload
                            </Button>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon size="xs" color="red" variant="subtle"
                            onClick={async () => { await liveProjectsApi.deleteInvoice(lp.id, inv.id); reload(); }}>
                            <IconTrash size={12} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {lp.invoices.length === 0 && (
                      <Table.Tr><Table.Td colSpan={6}><Text size="sm" c="dimmed" ta="center">No invoices</Text></Table.Td></Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Paper>

              {/* Stage gate summary bar — bottom of main column */}
              {lp.stage === 'LQ' && (
                <StageSummaryBar
                  gates={stage2Gates}
                  actionLabel="Move to Stage 3 — Survey & Drawings"
                  actionColor="blue"
                  onAction={handleAdvanceToStage3}
                />
              )}
              {lp.stage === 'SD' && !lp.routingDecision && (
                <StageSummaryBar
                  gates={stage3Gates}
                  actionLabel="All gates pass — route via sidebar"
                  actionColor="violet"
                  onAction={() => {}}
                  actionDisabledOverride={true}
                />
              )}

              {/* Stage 3 fields (visible only in SD stage) */}
              {lp.stage === 'SD' && (
                <>
                  {/* Survey Record (R9) */}
                  <Paper withBorder radius="md" p="lg">
                    <Title order={4} fw={600} mb="md">Survey Record</Title>
                    <Grid gap="md">
                      <Grid.Col span={3}>
                        <TextInput label="Survey Date" type="date"
                          defaultValue={isoDate(lp.surveyCompletionDate)}
                          onBlur={e => handleField('surveyCompletionDate', e.target.value || null)} />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <Select label="Surveyor Name" placeholder="Select surveyor"
                          data={surveyStaff} searchable clearable
                          value={lp.surveyorName || null}
                          onChange={v => handleField('surveyorName', v ?? '')} />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <TextInput label="Survey Method"
                          defaultValue={lp.surveyMethod}
                          onBlur={e => { if (e.target.value !== lp.surveyMethod) handleField('surveyMethod', e.target.value); }} />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <TextInput label="Access Type"
                          defaultValue={lp.surveyAccessType}
                          onBlur={e => { if (e.target.value !== lp.surveyAccessType) handleField('surveyAccessType', e.target.value); }} />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <Checkbox label="Customer signed off survey"
                          checked={lp.surveySignedOff}
                          onChange={e => handleField('surveySignedOff', e.target.checked)} />
                      </Grid.Col>
                    </Grid>
                  </Paper>

                  {/* Drawings Package (R10) */}
                  <Paper withBorder radius="md" p="lg">
                    <Group justify="space-between" mb="md">
                      <Title order={4} fw={600}>Drawings Package</Title>
                      <Button size="xs" variant="outline" leftSection={<IconPlus size={12} />} onClick={() => setAddDrawingOpen(true)}>Add Drawing</Button>
                    </Group>
                    <Table withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Drawing No.</Table.Th>
                          <Table.Th>Description</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>File</Table.Th>
                          <Table.Th></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {lp.drawings.map(d => (
                          <Table.Tr key={d.id}>
                            <Table.Td>{d.drawingNumber}</Table.Td>
                            <Table.Td>{d.description || '—'}</Table.Td>
                            <Table.Td>
                              <Select size="xs" data={['ISSUED', 'APPROVED', 'REJECTED'].map(v => ({ value: v, label: v }))}
                                value={d.status} w={120}
                                onChange={async v => { await liveProjectsApi.updateDrawing(lp.id, d.id, { status: v as DrawingStatus }); reload(); }} />
                            </Table.Td>
                            <Table.Td>
                              {d.s3Key ? (
                                <Button size="xs" variant="light" color="green" leftSection={<IconDownload size={11} />}
                                  loading={uploadingId === d.id}
                                  onClick={() => liveProjectsApi.downloadDrawing(lp.id, d.id).catch(() => {})}>
                                  {d.fileName ?? 'Download'} ✓
                                </Button>
                              ) : (
                                <Button size="xs" variant="subtle" color="gray" leftSection={<IconUpload size={11} />}
                                  loading={uploadingId === d.id}
                                  onClick={() => triggerUpload('drawing', d.id)}>
                                  Upload file
                                </Button>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon size="xs" color="red" variant="subtle"
                                onClick={async () => { await liveProjectsApi.deleteDrawing(lp.id, d.id); reload(); }}>
                                <IconTrash size={12} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        {lp.drawings.length === 0 && (
                          <Table.Tr><Table.Td colSpan={5}><Text size="sm" c="dimmed" ta="center">No drawings</Text></Table.Td></Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </Paper>

                  {/* Customer Review & Sign-Off (R11) */}
                  <Paper withBorder radius="md" p="lg">
                    <Title order={4} fw={600} mb="md">Customer Review & Sign-Off</Title>
                    <Grid gap="md">
                      <Grid.Col span={4}>
                        <Select label="Sign-Off Status"
                          data={[
                            { value: 'NOT_STARTED', label: 'Not Started' },
                            { value: 'IN_REVIEW', label: 'In Review' },
                            { value: 'CUSTOMER_APPROVED', label: 'Customer Approved' },
                            { value: 'CUSTOMER_REJECTED', label: 'Customer Rejected' },
                          ]}
                          value={lp.reviewStatus}
                          onChange={v => v && handleField('reviewStatus', v as ReviewStatus)} />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <TextInput label="Approval Date" type="date"
                          defaultValue={isoDate(lp.reviewApprovalDate)}
                          onBlur={e => handleField('reviewApprovalDate', e.target.value || null)} />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <Textarea label="Customer Comments" rows={3}
                          defaultValue={lp.reviewComments}
                          onBlur={e => { if (e.target.value !== lp.reviewComments) handleField('reviewComments', e.target.value); }} />
                      </Grid.Col>
                    </Grid>
                    {lp.reviewStatus && (
                      <Badge mt="sm" color={REVIEW_STATUS_COLOR[lp.reviewStatus]} variant="light">
                        {REVIEW_STATUS_LABELS[lp.reviewStatus]}
                      </Badge>
                    )}
                  </Paper>

                  {/* Components & Summary (R13, R12) */}
                  <Paper withBorder radius="md" p="lg">
                    <Group justify="space-between" mb="md">
                      <Title order={4} fw={600}>Components & Production Spec</Title>
                      <Button size="xs" variant="outline" leftSection={<IconPlus size={12} />} onClick={() => setAddCompOpen(true)}>Add Component</Button>
                    </Group>
                    <Table withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Component Name</Table.Th>
                          <Table.Th>Qty</Table.Th>
                          <Table.Th>Stock Status</Table.Th>
                          <Table.Th>Cost</Table.Th>
                          <Table.Th></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {lp.components.map(comp => (
                          <Table.Tr key={comp.id}>
                            <Table.Td>{comp.componentName}</Table.Td>
                            <Table.Td>{comp.qty}</Table.Td>
                            <Table.Td>
                              <Badge color={STOCK_STATUS_COLOR[comp.stockStatus] ?? 'gray'} variant="light" size="sm">
                                {STOCK_STATUS_LABELS[comp.stockStatus] ?? comp.stockStatus}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{fmtCurrency(comp.cost)}</Table.Td>
                            <Table.Td>
                              <ActionIcon size="xs" color="red" variant="subtle"
                                onClick={async () => { await liveProjectsApi.deleteComponent(lp.id, comp.id); reload(); }}>
                                <IconTrash size={12} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        {lp.components.length === 0 && (
                          <Table.Tr><Table.Td colSpan={5}><Text size="sm" c="dimmed" ta="center">No components added</Text></Table.Td></Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>

                    {/* Production Spec Summary with donut (R12) */}
                    {totalComponents > 0 && (
                      <>
                        <Divider my="md" label="Production Spec Summary" labelPosition="left" />
                        <Group gap="xl" align="flex-start">
                          <RingProgress
                            size={120} thickness={16}
                            sections={componentGroups
                              .filter(g => g.count > 0)
                              .map(g => ({
                                value: (g.count / totalComponents) * 100,
                                color: STOCK_STATUS_COLOR[g.status] ?? 'gray',
                              }))}
                          />
                          <SimpleGrid cols={3} spacing="md">
                            {componentGroups.map(g => (
                              <div key={g.status}>
                                <Badge color={STOCK_STATUS_COLOR[g.status]} variant="light" size="sm">{STOCK_STATUS_LABELS[g.status]}</Badge>
                                <Text fw={700} size="lg">{g.count}</Text>
                              </div>
                            ))}
                          </SimpleGrid>
                        </Group>
                      </>
                    )}
                  </Paper>
                </>
              )}
            </Stack>
          </Grid.Col>

          {/* Right sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* KEY CONTROLS checklist (R5) */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">KEY CONTROLS</Title>
                <Stack gap="sm">
                  {[
                    ['poReceived', 'Purchase Order received'],
                    ['drawingsReceived', 'Drawings received'],
                    ['depositPaid', 'Deposit paid'],
                    ['surveyBooked', 'Survey booked'],
                  ].map(([field, label]) => (
                    <Checkbox key={field} label={label}
                      checked={(lp as any)[field]}
                      onChange={e => handleField(field, e.target.checked)} />
                  ))}
                </Stack>
              </Paper>

              {/* Project Sign-Off (R6) */}
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Project Authorisation</Title>
                <Checkbox label="Contract Approved"
                  checked={lp.contractApproved}
                  onChange={e => handleField('contractApproved', e.target.checked)}
                  mb="sm" />
                <Select
                  label="Assignee"
                  placeholder="Select staff member"
                  searchable
                  clearable
                  data={officeStaff}
                  value={lp.assigneeName ?? null}
                  onChange={v => handleField('assigneeName', v ?? '')}
                  nothingFoundMessage="No office staff found"
                />
              </Paper>

              {/* Stage Gate: Move to Stage 3 */}
              {lp.stage === 'LQ' && (
                <Paper withBorder radius="md" p="lg">
                  <Title order={4} fw={600} mb="md">Stage Gate</Title>
                  <Stack gap="xs" mb="md">
                    {stage2Gates.map(g => (
                      <Group key={g.label} gap="xs">
                        <ThemeIcon color={g.passed ? 'green' : 'red'} size="sm" radius="xl" variant="light">
                          {g.passed ? <IconCheck size={10} /> : <IconAlertCircle size={10} />}
                        </ThemeIcon>
                        <Text size="xs">{g.label}</Text>
                      </Group>
                    ))}
                  </Stack>
                  <Button fullWidth color="blue" size="sm"
                    disabled={stage2Blocked}
                    leftSection={<IconArrowRight size={14} />}
                    onClick={handleAdvanceToStage3}>
                    Ready to move to Stage 3
                  </Button>
                </Paper>
              )}

              {/* Routing Decision (Stage 3) */}
              {lp.stage === 'SD' && !lp.routingDecision && (
                <Paper withBorder radius="md" p="lg">
                  <Title order={4} fw={600} mb="md">Routing Decision</Title>
                  <Stack gap="xs" mb="md">
                    {stage3Gates.map(g => (
                      <Group key={g.label} gap="xs">
                        <ThemeIcon color={g.passed ? 'green' : 'red'} size="sm" radius="xl" variant="light">
                          {g.passed ? <IconCheck size={10} /> : <IconAlertCircle size={10} />}
                        </ThemeIcon>
                        <Text size="xs">{g.label}</Text>
                      </Group>
                    ))}
                  </Stack>
                  <Stack gap="sm">
                    <Button fullWidth color="blue" size="sm" disabled={stage3Blocked}
                      onClick={() => handleRoute('PRODUCTION_PACK')}>
                      Send to Stage 4A — Production Pack
                    </Button>
                    <Button fullWidth color="violet" size="sm" disabled={stage3Blocked}
                      onClick={() => handleRoute('LIVE_SERVICES')}>
                      Send to Stage 4B — Live Services
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Admin: reset stage backwards */}
              <Paper withBorder radius="md" p="lg" style={{ borderColor: 'var(--mantine-color-orange-4)' }}>
                <Text size="xs" fw={600} c="orange" mb="sm" tt="uppercase" style={{ letterSpacing: 1 }}>Admin Override</Text>
                <Stack gap="xs">
                  {lp.routingDecision && (
                    <Button size="xs" variant="outline" color="orange" fullWidth
                      onClick={async () => {
                        try { const u = await liveProjectsApi.clearRouting(lp.id); setLp(u); }
                        catch (e: any) { setError(e.message); }
                      }}>
                      Clear Routing Decision
                    </Button>
                  )}
                  {lp.stage === 'SD' && (
                    <Button size="xs" variant="outline" color="red" fullWidth
                      onClick={async () => {
                        try { const u = await liveProjectsApi.resetToLq(lp.id); setLp(u); }
                        catch (e: any) { setError(e.message); }
                      }}>
                      Reset to Stage 2 (LQ)
                    </Button>
                  )}
                  {!lp.routingDecision && lp.stage === 'LQ' && (
                    <Text size="xs" c="dimmed">No resets available at Stage 2.</Text>
                  )}
                </Stack>
              </Paper>

              {lp.routingDecision && (
                <Paper withBorder radius="md" p="lg">
                  <Title order={4} fw={600} mb="sm">Routed to Stage 4</Title>
                  <Badge
                    color={lp.routingDecision === 'PRODUCTION_PACK' ? 'blue' : 'violet'}
                    variant="light" size="lg" mb="md" display="block">
                    {lp.routingDecision === 'PRODUCTION_PACK' ? 'Stage 4A — Production Pack' : 'Stage 4B — Live Services'}
                  </Badge>
                  {lp.routingDecision === 'PRODUCTION_PACK' ? (
                    <Button fullWidth color="blue" leftSection={<IconPackage size={14} />}
                      loading={routingCreating}
                      onClick={() => handleRoutingNav('PRODUCTION_PACK')}>
                      Create &amp; Open Production Pack
                    </Button>
                  ) : (
                    <Button fullWidth color="violet" leftSection={<IconTool size={14} />}
                      loading={routingCreating}
                      onClick={() => handleRoutingNav('LIVE_SERVICES')}>
                      Go to Service Operations
                    </Button>
                  )}
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Modals */}
      <AddInvoiceModal opened={addInvOpen} onClose={() => setAddInvOpen(false)}
        onAdded={async inv => { await liveProjectsApi.addInvoice(lp.id, inv); reload(); setAddInvOpen(false); }} />
      <AddDrawingModal opened={addDrawingOpen} onClose={() => setAddDrawingOpen(false)}
        onAdded={async d => { await liveProjectsApi.addDrawing(lp.id, d); reload(); setAddDrawingOpen(false); }} />
      <AddInstallationItemModal opened={addInstOpen} onClose={() => setAddInstOpen(false)}
        onAdded={async item => { await liveProjectsApi.addInstallationItem(lp.id, item); reload(); setAddInstOpen(false); }} />
      <AddCostingItemModal opened={addCostOpen} onClose={() => setAddCostOpen(false)}
        onAdded={async item => { await liveProjectsApi.addCostingItem(lp.id, item); reload(); setAddCostOpen(false); }} />
      <AddComponentModal opened={addCompOpen} onClose={() => setAddCompOpen(false)}
        onAdded={async comp => { await liveProjectsApi.addComponent(lp.id, comp); reload(); setAddCompOpen(false); }} />
    </Container>
  );
}

function AddInvoiceModal({ opened, onClose, onAdded }: { opened: boolean; onClose: () => void; onAdded: (inv: any) => void }) {
  const [invNo, setInvNo] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [dueDate, setDueDate] = useState('');
  return (
    <Modal opened={opened} onClose={onClose} title="Add Invoice" size="sm">
      <Stack gap="md">
        <TextInput label="Invoice Number" required value={invNo} onChange={e => setInvNo(e.target.value)} />
        <NumberInput label="Amount (£)" required value={amount} onChange={setAmount} />
        <TextInput label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!invNo || !amount} onClick={() => onAdded({ invoiceNumber: invNo, amount: Number(amount), dueDate: dueDate || undefined })}>Add</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function AddDrawingModal({ opened, onClose, onAdded }: { opened: boolean; onClose: () => void; onAdded: (d: any) => void }) {
  const [num, setNum] = useState('');
  const [desc, setDesc] = useState('');
  return (
    <Modal opened={opened} onClose={onClose} title="Add Drawing" size="sm">
      <Stack gap="md">
        <TextInput label="Drawing Number" required value={num} onChange={e => setNum(e.target.value)} />
        <TextInput label="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!num} onClick={() => onAdded({ drawingNumber: num, description: desc || undefined })}>Add</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function AddInstallationItemModal({ opened, onClose, onAdded }: { opened: boolean; onClose: () => void; onAdded: (i: any) => void }) {
  const [sysName, setSysName] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  return (
    <Modal opened={opened} onClose={onClose} title="Add Installation Item" size="sm">
      <Stack gap="md">
        <TextInput label="System Name" required value={sysName} onChange={e => setSysName(e.target.value)} />
        <NumberInput label="Amount (£)" value={amount} onChange={setAmount} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!sysName} onClick={() => onAdded({ systemName: sysName, amount: amount ? Number(amount) : undefined })}>Add</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function AddComponentModal({ opened, onClose, onAdded }: { opened: boolean; onClose: () => void; onAdded: (c: any) => void }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState<number | string>(1);
  const [status, setStatus] = useState('IN_STOCK');
  const [cost, setCost] = useState<number | string>('');
  return (
    <Modal opened={opened} onClose={onClose} title="Add Component" size="sm">
      <Stack gap="md">
        <TextInput label="Component Name" required value={name} onChange={e => setName(e.target.value)} />
        <NumberInput label="Qty" value={qty} onChange={setQty} min={1} />
        <Select label="Stock Status" data={['IN_STOCK', 'OUT_OF_STOCK', 'ON_ORDER'].map(v => ({ value: v, label: STOCK_STATUS_LABELS[v] || v }))}
          value={status} onChange={v => v && setStatus(v)} />
        <NumberInput label="Cost (£)" value={cost} onChange={setCost} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!name} onClick={() => onAdded({ componentName: name, qty: Number(qty), stockStatus: status, cost: cost ? Number(cost) : undefined })}>Add</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function AddCostingItemModal({ opened, onClose, onAdded }: { opened: boolean; onClose: () => void; onAdded: (i: any) => void }) {
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState<number | string>(1);
  const [unitCost, setUnitCost] = useState<number | string>('');
  const total = Number(qty) * Number(unitCost);
  return (
    <Modal opened={opened} onClose={onClose} title="Add Costing Line" size="sm">
      <Stack gap="md">
        <TextInput label="Description" required placeholder="e.g. Fire Curtain FC120, Commissioning" value={description} onChange={e => setDescription(e.target.value)} />
        <NumberInput label="Qty" value={qty} onChange={setQty} min={1} decimalScale={2} />
        <NumberInput label="Unit Cost (£)" value={unitCost} onChange={setUnitCost} min={0} decimalScale={2} />
        {Number(qty) > 0 && Number(unitCost) > 0 && (
          <Text size="sm" c="dimmed">Line total: <strong>£{total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong></Text>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!description || !unitCost} onClick={() => onAdded({ description, qty: Number(qty), unitCost: Number(unitCost) })}>Add Line</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
