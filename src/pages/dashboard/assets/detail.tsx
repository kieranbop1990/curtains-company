import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Text, Badge,
  Tabs, Grid, Select, NumberInput, TextInput, Switch, Alert,
  Table, Timeline, Loader, Center, Anchor, Breadcrumbs, ThemeIcon,
  SimpleGrid, Divider, ActionIcon, Modal, Textarea,
} from '@mantine/core';
import {
  IconAlertCircle, IconChevronRight, IconCalendar, IconTool,
  IconEdit, IconDownload, IconPlus, IconTrash, IconCheck,
} from '@tabler/icons-react';
import { assetsApi } from 'src/api/assets';
import type { Asset, AssetStatus, AssetPriority, AssetContact, AssetDocument } from 'src/types/asset';

function computeServiceDates(
  lastServiceDate: string | null,
  serviceFrequencyMonths: number | null,
): { nextServiceDate: string | null; renewalAlertDate: string | null } {
  if (!lastServiceDate || !serviceFrequencyMonths) return { nextServiceDate: null, renewalAlertDate: null };
  const next = new Date(lastServiceDate);
  next.setMonth(next.getMonth() + serviceFrequencyMonths);
  const renewal = new Date(next);
  renewal.setDate(renewal.getDate() - 30);
  return { nextServiceDate: next.toISOString(), renewalAlertDate: renewal.toISOString() };
}

const STATUS_COLOR: Record<AssetStatus, string> = {
  LIVE_ACTIVE: 'green',
  SERVICE_DUE: 'yellow',
  OVERDUE: 'red',
  UNKNOWN: 'gray',
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  LIVE_ACTIVE: 'Live / Active',
  SERVICE_DUE: 'Service Due',
  OVERDUE: 'Overdue',
  UNKNOWN: 'Unknown',
};

const PRIORITY_LABELS: Record<AssetPriority, string> = { HOT: 'Hot', HIGH: 'High', NORMAL: 'Normal' };
const PRIORITY_COLOR: Record<AssetPriority, string> = { HOT: 'red', HIGH: 'orange', NORMAL: 'gray' };

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  return Math.floor((new Date(d).getTime() - Date.now()) / 86400000);
}

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

export default function AssetDetailPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [linkedAssets, setLinkedAssets] = useState<Asset[]>([]);
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDocType, setPendingDocType] = useState<string | null>(null);
  const [logEventOpen, setLogEventOpen] = useState(false);
  const [logEventForm, setLogEventForm] = useState({ serviceDate: '', engineerName: '', company: '', summary: '', outcome: '' });
  const [logEventSaving, setLogEventSaving] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    assetsApi.getAsset(assetId).then(a => {
      setAsset(a);
      setDocuments(a.documents ?? []);
      setLoading(false);
      assetsApi.getLinkedAssets(assetId).then(setLinkedAssets).catch(() => {});
    }).catch(() => setLoading(false));
  }, [assetId]);

  const handleDocUpload = (docType: string) => {
    setPendingDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!asset || !pendingDocType || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setDocUploading(true);
    try {
      const { url } = await assetsApi.getDocumentUploadUrl(asset.id, pendingDocType, file.type, file.name);
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      // Refresh documents list from DB
      const updated = await assetsApi.getDocuments(asset.id);
      setDocuments(updated);
    } catch { /* upload failed */ }
    finally {
      setDocUploading(false);
      e.target.value = '';
      setPendingDocType(null);
    }
  };

  const handleDocDownload = async (doc: AssetDocument) => {
    if (!asset) return;
    try {
      const { url } = await assetsApi.getDocumentDownloadUrl(asset.id, undefined, doc.id);
      window.open(url, '_blank');
    } catch { /* presign failed */ }
  };

  const handleDocDelete = async (doc: AssetDocument) => {
    if (!asset) return;
    try {
      await assetsApi.deleteDocument(asset.id, doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch { /* delete failed */ }
  };

  const handleField = async (field: string, value: any) => {
    if (!asset) return;
    setSaving(true);
    try {
      const updated = await assetsApi.updateAsset(asset.id, { [field]: value });
      setAsset(updated);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (field: string, checked: boolean) => handleField(field, checked);

  const handleServiceDateChange = async (
    field: 'lastServiceDate' | 'serviceFrequencyMonths',
    value: any,
  ) => {
    await handleField(field, value);
    const freq = field === 'serviceFrequencyMonths' ? value : asset?.serviceFrequencyMonths;
    const last = field === 'lastServiceDate' ? value : asset?.lastServiceDate;
    const { nextServiceDate, renewalAlertDate } = computeServiceDates(last, freq);
    if (nextServiceDate && asset) {
      setSaving(true);
      try {
        const updated = await assetsApi.updateAsset(asset.id, { nextServiceDate, renewalAlertDate });
        setAsset(updated);
      } finally { setSaving(false); }
    }
  };

  const handleLogEventSubmit = async () => {
    if (!asset) return;
    setLogEventSaving(true);
    try {
      await assetsApi.addServiceEvent(asset.id, {
        serviceDate: logEventForm.serviceDate,
        engineerName: logEventForm.engineerName || undefined,
        company: logEventForm.company || undefined,
        summary: logEventForm.summary || undefined,
        statusLabel: logEventForm.outcome || undefined,
      });
      const refreshed = await assetsApi.getAsset(asset.id);
      setAsset(refreshed);
      setLogEventOpen(false);
      setLogEventForm({ serviceDate: '', engineerName: '', company: '', summary: '', outcome: '' });
    } finally { setLogEventSaving(false); }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!asset) return;
    await assetsApi.deleteContact(asset.id, contactId);
    setAsset(prev => prev ? { ...prev, contacts: prev.contacts.filter(c => c.id !== contactId) } : prev);
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (!asset) return <Center p="xl"><Text c="dimmed">Asset not found.</Text></Center>;

  const days = daysUntil(asset.nextServiceDate);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          <Anchor onClick={() => navigate('/dashboard/assets')} size="sm">Assets</Anchor>
          <Text size="sm">{asset.assetRef}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={2} fw={700}>{asset.assetRef}</Title>
              <Badge color={STATUS_COLOR[asset.status]} variant="light" size="lg">
                {STATUS_LABELS[asset.status]}
              </Badge>
              <Badge color={PRIORITY_COLOR[asset.priority]} variant="dot" size="md">
                {PRIORITY_LABELS[asset.priority]}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm">{asset.customerName} · {asset.siteName}</Text>
          </Stack>
          <Group>
            <Button
              variant="outline" size="sm" leftSection={<IconDownload size={14} />}
              onClick={() => window.open(`/api/assets/${asset.id}/pdf`, '_blank')}
            >
              Download Asset PDF
            </Button>
          </Group>
        </Group>

        {error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}

        {/* Days to next service countdown */}
        {asset.nextServiceDate && (
          <Paper withBorder radius="md" p="md">
            <Group gap="sm" align="center">
              <ThemeIcon color={days != null && days < 0 ? 'red' : days != null && days <= 30 ? 'yellow' : 'green'} size="lg" radius="xl" variant="light">
                <IconCalendar size={18} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="sm" c="dimmed">Days to Next Service</Text>
                <Text fw={700} size="lg">
                  {days == null ? '—' : days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`}
                </Text>
              </Stack>
              <Text size="sm" c="dimmed" ml="auto">Next service: {fmtDate(asset.nextServiceDate)}</Text>
            </Group>
          </Paper>
        )}

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="system">System Details</Tabs.Tab>
            <Tabs.Tab value="service">Service & Maintenance</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
            <Tabs.Tab value="documents">Documents</Tabs.Tab>
            <Tabs.Tab value="compliance">Compliance</Tabs.Tab>
            <Tabs.Tab value="sales">Sales & Quotes</Tabs.Tab>
            <Tabs.Tab value="linked">Linked Assets</Tabs.Tab>
            <Tabs.Tab value="activity">News & Activity</Tabs.Tab>
          </Tabs.List>

          {/* OVERVIEW TAB */}
          <Tabs.Panel value="overview" pt="lg">
            <Grid gap="lg">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                  <Paper withBorder radius="md" p="lg">
                    <Title order={4} fw={600} mb="md">Summary</Title>
                    <SimpleGrid cols={2} spacing="md">
                      <div><Text size="sm" c="dimmed">System Type</Text><Text size="sm">{asset.systemType || '—'}</Text></div>
                      <div><Text size="sm" c="dimmed">Serial Number</Text><Text size="sm">{asset.serialNumber || '—'}</Text></div>
                      <div><Text size="sm" c="dimmed">Site</Text><Text size="sm">{asset.siteName || '—'}</Text></div>
                      <div><Text size="sm" c="dimmed">Location on Site</Text><Text size="sm">{asset.locationOnSite || '—'}</Text></div>
                      <div><Text size="sm" c="dimmed">Firing Rating</Text><Text size="sm">{asset.firingRating || '—'}</Text></div>
                      <div><Text size="sm" c="dimmed">Manufacture Date</Text><Text size="sm">{fmtDate(asset.manufactureDate)}</Text></div>
                      <div><Text size="sm" c="dimmed">Warranty Expiry</Text><Text size="sm">{fmtDate(asset.warrantyExpiry)}</Text></div>
                      <div><Text size="sm" c="dimmed">Size (W×H mm)</Text><Text size="sm">{asset.widthMm && asset.heightMm ? `${asset.widthMm}×${asset.heightMm}` : '—'}</Text></div>
                    </SimpleGrid>
                  </Paper>

                  {/* Alerts & Reminders */}
                  <Paper withBorder radius="md" p="lg">
                    <Title order={4} fw={600} mb="md">Alerts & Reminders</Title>
                    <Stack gap="xs">
                      {asset.status === 'OVERDUE' && (
                        <Alert color="red" icon={<IconAlertCircle size={14} />} variant="light">
                          Asset is overdue for service
                        </Alert>
                      )}
                      {asset.status === 'SERVICE_DUE' && (
                        <Alert color="yellow" icon={<IconAlertCircle size={14} />} variant="light">
                          Service due within 30 days
                        </Alert>
                      )}
                      {asset.renewalAlertDate && new Date(asset.renewalAlertDate) <= new Date(Date.now() + 30 * 86400000) && (
                        <Alert color="yellow" icon={<IconCalendar size={14} />} variant="light">
                          Renewal alert: {fmtDate(asset.renewalAlertDate)}
                        </Alert>
                      )}
                      {asset.status === 'LIVE_ACTIVE' && !asset.renewalAlertDate && (
                        <Group gap="xs">
                          <ThemeIcon color="green" size="sm" radius="xl" variant="light"><IconCheck size={12} /></ThemeIcon>
                          <Text size="sm" c="dimmed">No active alerts</Text>
                        </Group>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                  {/* Quick Actions */}
                  <Paper withBorder radius="md" p="lg">
                    <Title order={4} fw={600} mb="md">Quick Actions</Title>
                    <Stack gap="sm">
                      <Button variant="outline" size="sm" fullWidth leftSection={<IconCalendar size={14} />}
                        onClick={async () => {
                          try {
                            await assetsApi.checkAlerts(asset.id);
                            const refreshed = await assetsApi.getAsset(asset.id);
                            setAsset(refreshed);
                          } catch { /* non-fatal */ }
                        }}>
                        Run Service Check
                      </Button>
                      <Button variant="outline" size="sm" fullWidth leftSection={<IconPlus size={14} />}
                        onClick={() => {
                          const params = new URLSearchParams({
                            customerName: asset.customerName,
                            assetId: asset.id,
                            assetRef: asset.assetRef,
                          });
                          navigate(`/dashboard/service-operations/add?${params.toString()}`);
                        }}>
                        Create Service Quote
                      </Button>
                      <Button variant="outline" size="sm" fullWidth leftSection={<IconEdit size={14} />}
                        onClick={() => setLogEventOpen(true)}>Log Activity / Note</Button>
                      <Button variant="outline" size="sm" fullWidth leftSection={<IconTool size={14} />}
                        onClick={() => setLogEventOpen(true)}>Report Fault / Repair</Button>
                      <Button variant="outline" size="sm" fullWidth leftSection={<IconDownload size={14} />}
                        onClick={() => window.open(`/api/assets/${asset.id}/pdf`, '_blank')}>Download Asset PDF</Button>
                    </Stack>
                  </Paper>

                  {/* Priority */}
                  <Paper withBorder radius="md" p="lg">
                    <Title order={4} fw={600} mb="md">Priority</Title>
                    <Select
                      data={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
                      value={asset.priority}
                      onChange={v => v && handleField('priority', v)}
                      disabled={saving}
                    />
                  </Paper>

                  {/* Contacts */}
                  <Paper withBorder radius="md" p="lg">
                    <Group justify="space-between" mb="md">
                      <Title order={4} fw={600}>Contacts</Title>
                      <ActionIcon size="sm" variant="outline" onClick={() => setAddContactOpen(true)}>
                        <IconPlus size={12} />
                      </ActionIcon>
                    </Group>
                    {asset.contacts.length === 0 ? (
                      <Text size="sm" c="dimmed">No contacts added.</Text>
                    ) : (
                      <Stack gap="sm">
                        {asset.contacts.map(c => (
                          <Group key={c.id} justify="space-between" align="flex-start">
                            <Stack gap={0}>
                              <Text size="sm" fw={600}>{c.name}</Text>
                              {c.phone && <Text size="xs" c="dimmed">{c.phone}</Text>}
                              {c.email && <Text size="xs" c="dimmed">{c.email}</Text>}
                            </Stack>
                            <ActionIcon size="xs" color="red" variant="subtle" onClick={() => handleDeleteContact(c.id)}>
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Group>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* SYSTEM DETAILS TAB */}
          <Tabs.Panel value="system" pt="lg">
            <Paper withBorder radius="md" p="lg">
              <Title order={4} fw={600} mb="md">Technical Fields</Title>
              <Grid gap="md">
                {[
                  ['systemType', 'System Type'],
                  ['firingRating', 'Firing Rating'],
                  ['locationOnSite', 'Location on Site'],
                  ['headboxSize', 'Headbox Size'],
                  ['motorType', 'Motor Type'],
                  ['controlPanelType', 'Control Panel Type'],
                  ['mccType', 'MCC Type'],
                  ['driveType', 'Drive Type'],
                  ['motorMake', 'Motor Make'],
                  ['serialNumber', 'Serial Number'],
                  ['fabricType', 'Fabric Type'],
                  ['fabricColour', 'Fabric Colour'],
                ].map(([field, label]) => (
                  <Grid.Col span={6} key={field}>
                    <TextInput
                      label={label}
                      defaultValue={(asset as any)[field] || ''}
                      onBlur={e => { if (e.target.value !== (asset as any)[field]) handleField(field, e.target.value || null); }}
                    />
                  </Grid.Col>
                ))}
                <Grid.Col span={3}>
                  <NumberInput label="Width (mm)" defaultValue={asset.widthMm ?? undefined}
                    onBlur={e => handleField('widthMm', e.target.value ? Number(e.target.value) : null)} />
                </Grid.Col>
                <Grid.Col span={3}>
                  <NumberInput label="Height (mm)" defaultValue={asset.heightMm ?? undefined}
                    onBlur={e => handleField('heightMm', e.target.value ? Number(e.target.value) : null)} />
                </Grid.Col>
                <Grid.Col span={3}>
                  <TextInput label="Manufacture Date" type="date"
                    defaultValue={asset.manufactureDate ? asset.manufactureDate.slice(0, 10) : ''}
                    onBlur={e => handleField('manufactureDate', e.target.value || null)} />
                </Grid.Col>
                <Grid.Col span={3}>
                  <TextInput label="Warranty Expiry" type="date"
                    defaultValue={asset.warrantyExpiry ? asset.warrantyExpiry.slice(0, 10) : ''}
                    onBlur={e => handleField('warrantyExpiry', e.target.value || null)} />
                </Grid.Col>
              </Grid>

              <Divider my="lg" label="Site Access Toggles" labelPosition="left" />
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                {[
                  ['accessRestrictions', 'Access Restrictions'],
                  ['permitsRequired', 'Permits Required'],
                  ['dchiRequired', 'DCHI Required'],
                  ['securityClearance', 'Security Clearance'],
                  ['loadingBay', 'Loading Bay'],
                  ['laddersRequired', 'Ladders Required'],
                  ['inductionRequired', 'Induction Required'],
                ].map(([field, label]) => (
                  <Switch
                    key={field}
                    label={label}
                    checked={(asset as any)[field]}
                    onChange={e => handleToggle(field, e.currentTarget.checked)}
                  />
                ))}
              </SimpleGrid>
            </Paper>
          </Tabs.Panel>

          {/* SERVICE & MAINTENANCE TAB */}
          <Tabs.Panel value="service" pt="lg">
            <Stack gap="lg">
              <Paper withBorder radius="md" p="lg">
                <Title order={4} fw={600} mb="md">Service Settings</Title>
                <Grid gap="md">
                  <Grid.Col span={3}>
                    <NumberInput
                      label="Service Frequency (months)"
                      defaultValue={asset.serviceFrequencyMonths ?? undefined}
                      onBlur={e => handleServiceDateChange('serviceFrequencyMonths', e.target.value ? Number(e.target.value) : null)}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput label="Last Service Date" type="date"
                      defaultValue={asset.lastServiceDate ? asset.lastServiceDate.slice(0, 10) : ''}
                      onBlur={e => handleServiceDateChange('lastServiceDate', e.target.value || null)} />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    {(() => {
                      const computed = computeServiceDates(asset.lastServiceDate, asset.serviceFrequencyMonths);
                      const val = asset.nextServiceDate ?? computed.nextServiceDate;
                      return (
                        <TextInput
                          label="Next Service Date"
                          type="date"
                          readOnly
                          value={val ? val.slice(0, 10) : ''}
                          description="Auto-calculated from last service + frequency"
                        />
                      );
                    })()}
                  </Grid.Col>
                  <Grid.Col span={3}>
                    {(() => {
                      const computed = computeServiceDates(asset.lastServiceDate, asset.serviceFrequencyMonths);
                      const val = asset.renewalAlertDate ?? computed.renewalAlertDate;
                      return (
                        <TextInput
                          label="Renewal Alert Date"
                          type="date"
                          readOnly
                          value={val ? val.slice(0, 10) : ''}
                          description="Auto-set 30 days before next service"
                        />
                      );
                    })()}
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Service History Table */}
              <Paper withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4} fw={600}>Service History</Title>
                  <Button size="sm" variant="outline" leftSection={<IconPlus size={14} />}
                    onClick={() => setLogEventOpen(true)}>
                    Log Service Event
                  </Button>
                </Group>
                {asset.serviceEvents.length === 0 ? (
                  <Text size="sm" c="dimmed">No service records yet.</Text>
                ) : (
                  <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Engineer</Table.Th>
                        <Table.Th>Company</Table.Th>
                        <Table.Th>Summary</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {asset.serviceEvents.map(e => (
                        <Table.Tr key={e.id}>
                          <Table.Td>{fmtDate(e.serviceDate)}</Table.Td>
                          <Table.Td>{e.engineerName || '—'}</Table.Td>
                          <Table.Td>{e.company || '—'}</Table.Td>
                          <Table.Td>{e.summary || '—'}</Table.Td>
                          <Table.Td>
                            {e.statusLabel ? (
                              <Badge size="sm" variant="light">{e.statusLabel}</Badge>
                            ) : '—'}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* HISTORY TAB — Lifecycle Timeline */}
          <Tabs.Panel value="history" pt="lg">
            <Paper withBorder radius="md" p="lg">
              <Title order={4} fw={600} mb="md">Lifecycle Timeline</Title>
              {asset.serviceEvents.length === 0 ? (
                <Text size="sm" c="dimmed">No events recorded.</Text>
              ) : (
                <Timeline active={asset.serviceEvents.length - 1} bulletSize={20} lineWidth={2}>
                  {asset.serviceEvents.map(e => (
                    <Timeline.Item
                      key={e.id}
                      title={e.statusLabel || 'Service'}
                      bullet={<IconTool size={12} />}
                    >
                      <Text size="xs" c="dimmed">{fmtDate(e.serviceDate)}</Text>
                      {e.engineerName && <Text size="sm">{e.engineerName} · {e.company}</Text>}
                      {e.summary && <Text size="sm" c="dimmed">{e.summary}</Text>}
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </Paper>
            <Paper withBorder radius="md" p="lg" mt="lg">
              <Title order={4} fw={600} mb="sm">Asset Metrics</Title>
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                <div>
                  <Text size="sm" c="dimmed">Age</Text>
                  <Text fw={700}>
                    {asset.manufactureDate
                      ? `${Math.floor((Date.now() - new Date(asset.manufactureDate).getTime()) / (365.25 * 86400000))} yrs`
                      : '—'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Services Completed</Text>
                  <Text fw={700}>{asset.serviceEvents.length}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Downtime Logged</Text>
                  <Text fw={700}>—</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">MTBF</Text>
                  <Text fw={700}>
                    {asset.serviceEvents.length >= 2 ? (() => {
                      const sorted = [...asset.serviceEvents].sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());
                      const gaps: number[] = [];
                      for (let i = 1; i < sorted.length; i++) {
                        gaps.push((new Date(sorted[i].serviceDate).getTime() - new Date(sorted[i - 1].serviceDate).getTime()) / 86400000);
                      }
                      const avg = gaps.reduce((s, n) => s + n, 0) / gaps.length;
                      return `${Math.round(avg)} days`;
                    })() : '—'}
                  </Text>
                </div>
              </SimpleGrid>
            </Paper>
          </Tabs.Panel>

          {/* DOCUMENTS TAB */}
          <Tabs.Panel value="documents" pt="lg">
            <Stack gap="md">
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelected} />

              {/* Upload new document */}
              <Paper withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4} fw={600}>Asset Documents</Title>
                  <Select
                    placeholder="Select type to upload…"
                    size="sm"
                    style={{ width: 240 }}
                    data={[
                      'Installation Certificate',
                      'Commissioning Document',
                      'QA Checklist / Electrical',
                      'Test Certificate',
                      'Maintenance Manual',
                      'Warranty Certificate',
                      'RAMS',
                      'Risk Assessment',
                      'Method Statement',
                      'Other',
                    ]}
                    onChange={v => v && handleDocUpload(v)}
                    value={null}
                  />
                </Group>
                {docUploading && (
                  <Alert color="blue" variant="light" mb="md">Uploading…</Alert>
                )}
                {documents.length === 0 ? (
                  <Text c="dimmed" size="sm">No documents uploaded yet. Select a type above to upload the first one.</Text>
                ) : (
                  <Table withTableBorder withColumnBorders striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Document Type</Table.Th>
                        <Table.Th>File Name</Table.Th>
                        <Table.Th>Uploaded By</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {documents.map(doc => (
                        <Table.Tr key={doc.id}>
                          <Table.Td>
                            <Badge size="sm" variant="light">{doc.docType}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.fileName}
                            </Text>
                          </Table.Td>
                          <Table.Td><Text size="sm">{doc.uploadedBy || '—'}</Text></Table.Td>
                          <Table.Td>
                            <Text size="sm">{new Date(doc.uploadedAt).toLocaleDateString('en-GB')}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Button size="xs" variant="outline" leftSection={<IconDownload size={12} />}
                                onClick={() => handleDocDownload(doc)}>
                                Download
                              </Button>
                              <ActionIcon size="sm" color="red" variant="subtle"
                                onClick={() => handleDocDelete(doc)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* COMPLIANCE TAB */}
          <Tabs.Panel value="compliance" pt="lg">
            <Paper withBorder radius="md" p="lg">
              <Text c="dimmed" size="sm">Compliance records will be added in a future stage.</Text>
            </Paper>
          </Tabs.Panel>

          {/* SALES & QUOTES TAB */}
          <Tabs.Panel value="sales" pt="lg">
            <Paper withBorder radius="md" p="lg">
              <Title order={4} fw={600} mb="md">Sales Opportunity</Title>
              <Grid gap="md">
                <Grid.Col span={4}>
                  <TextInput label="Last Quote Date" type="date"
                    defaultValue={asset.lastQuoteDate ? asset.lastQuoteDate.slice(0, 10) : ''}
                    onBlur={e => handleField('lastQuoteDate', e.target.value || null)} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput label="Last Contact Date" type="date"
                    defaultValue={asset.lastContactDate ? asset.lastContactDate.slice(0, 10) : ''}
                    onBlur={e => handleField('lastContactDate', e.target.value || null)} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput label="Next Close Date" type="date"
                    defaultValue={asset.nextCloseDate ? asset.nextCloseDate.slice(0, 10) : ''}
                    onBlur={e => handleField('nextCloseDate', e.target.value || null)} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput label="Contract Value (£)"
                    defaultValue={asset.contractValue ?? undefined}
                    onBlur={e => handleField('contractValue', e.target.value ? Number(e.target.value) : null)} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput label="Annual Revenue (£)"
                    defaultValue={asset.annualRevenue ?? undefined}
                    onBlur={e => handleField('annualRevenue', e.target.value ? Number(e.target.value) : null)} />
                </Grid.Col>
              </Grid>
              <Button mt="lg" variant="outline" leftSection={<IconPlus size={14} />}
                onClick={() => {
                  const params = new URLSearchParams({
                    customerName: asset.customerName,
                    assetId: asset.id,
                    assetRef: asset.assetRef,
                  });
                  navigate(`/dashboard/service-operations/add?${params.toString()}`);
                }}>
                Create &amp; Quote (Service Quote)
              </Button>
            </Paper>
          </Tabs.Panel>

          {/* LINKED ASSETS TAB */}
          <Tabs.Panel value="linked" pt="lg">
            <Paper withBorder radius="md" p="lg">
              <Title order={4} fw={600} mb="md">Linked Assets (Same Site)</Title>
              {linkedAssets.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No other assets at {asset.siteName || 'this site'}.
                </Text>
              ) : (
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ref</Table.Th>
                      <Table.Th>System Type</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Serial No.</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {linkedAssets.map(a => (
                      <Table.Tr key={a.id} style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/dashboard/assets/${a.id}`)}>
                        <Table.Td><Text size="sm" fw={600}>{a.assetRef}</Text></Table.Td>
                        <Table.Td>{a.systemType || '—'}</Table.Td>
                        <Table.Td>
                          <Badge color={STATUS_COLOR[a.status]} variant="light" size="sm">
                            {STATUS_LABELS[a.status]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{a.serialNumber || '—'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </Tabs.Panel>

          {/* NEWS & ACTIVITY TAB */}
          <Tabs.Panel value="activity" pt="lg">
            <Paper withBorder radius="md" p="lg">
              <Text c="dimmed" size="sm">Activity log will be populated as actions are taken on this asset.</Text>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Log Service Event Modal */}
      <Modal opened={logEventOpen} onClose={() => setLogEventOpen(false)} title="Log Service Event" size="md">
        <Stack gap="md">
          <TextInput label="Service Date" type="date" required
            value={logEventForm.serviceDate}
            onChange={e => setLogEventForm(f => ({ ...f, serviceDate: e.currentTarget.value }))} />
          <TextInput label="Engineer Name"
            value={logEventForm.engineerName}
            onChange={e => setLogEventForm(f => ({ ...f, engineerName: e.currentTarget.value }))} />
          <TextInput label="Company"
            value={logEventForm.company}
            onChange={e => setLogEventForm(f => ({ ...f, company: e.currentTarget.value }))} />
          <Textarea label="Summary / Work Done" autosize minRows={3}
            value={logEventForm.summary}
            onChange={e => setLogEventForm(f => ({ ...f, summary: e.currentTarget.value }))} />
          <Select label="Outcome"
            data={[
              { value: 'PASS', label: 'Pass' },
              { value: 'FAIL', label: 'Fail' },
              { value: 'ADVISORY', label: 'Advisory' },
              { value: 'PARTS_REQUIRED', label: 'Parts Required' },
            ]}
            value={logEventForm.outcome || null}
            onChange={v => setLogEventForm(f => ({ ...f, outcome: v ?? '' }))} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setLogEventOpen(false)}>Cancel</Button>
            <Button loading={logEventSaving} disabled={!logEventForm.serviceDate} onClick={handleLogEventSubmit}>
              Save Service Record
            </Button>
          </Group>
        </Stack>
      </Modal>

      <AddContactModal
        opened={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        onAdded={async (contact) => {
          if (!asset) return;
          const c = await assetsApi.addContact(asset.id, contact);
          setAsset(prev => prev ? { ...prev, contacts: [...prev.contacts, c as AssetContact] } : prev);
          setAddContactOpen(false);
        }}
      />
    </Container>
  );
}

function AddContactModal({ opened, onClose, onAdded }: {
  opened: boolean; onClose: () => void;
  onAdded: (c: { name: string; phone?: string; email?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  return (
    <Modal opened={opened} onClose={onClose} title="Add Contact" size="sm">
      <Stack gap="md">
        <TextInput label="Name" required value={name} onChange={e => setName(e.target.value)} />
        <TextInput label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => onAdded({ name, phone: phone || undefined, email: email || undefined })}>
            Add
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
