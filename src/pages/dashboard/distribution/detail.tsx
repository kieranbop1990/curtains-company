import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, Text, Badge,
  NumberInput, TextInput, Textarea, Switch, Center, Loader, Alert,
  Tabs, Table, ActionIcon, Checkbox, Divider, Modal, Select,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconPlus, IconTrash, IconDownload } from '@tabler/icons-react';
import { distributionApi } from 'src/api/distribution';
import { staffApi } from 'src/api/staff';
import type { DistributionJob, InstallationEngineer, PaymentMilestone, InstallationProgressStep } from 'src/types/distribution';
import type { StaffMember } from 'src/types/staff';

const DIST_LABELS = { COLLECTION: '6A — Collection', DELIVERY: '6B — Delivery', INSTALLATION: '6C — Installation' };

const PACK_CHECKLIST_LABELS = [
  ['packMccCert', 'MCC Cert'],
  ['packCurtainScope', 'Curtain Scope'],
  ['packFiringLicence', 'Firing Licence'],
  ['packLabelsId', 'Labels & Identification'],
  ['packControllersManual', 'Controllers & Maintenance Manual'],
  ['packWarrantyCert', 'Warranty Certificate'],
] as const;

const DELIVERY_CHECKLIST_LABELS = [
  ['deliveryMccCert', 'MCC Cert'],
  ['deliveryCurtainScope', 'Curtain Scope'],
  ['deliveryFiringLicence', 'Firing Licence'],
  ['deliveryLabelsId', 'Labels & Identification'],
  ['deliveryControllersManual', 'Controllers & Maintenance Manual'],
  ['deliveryWarrantyCert', 'Warranty Certificate'],
] as const;

const HANDOVER_ITEMS = [
  ['ramsFiledChecked', 'RAMS reviewed and filed'],
  ['teamSignedOffChecked', 'Installation team signed off'],
  ['customerSignoffUploaded', 'Customer sign-off document uploaded'],
  ['handoverPackIssued', 'Handover pack issued'],
  ['returnVisitResolved', 'Return visit flag resolved or N/A marked'],
] as const;

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

export default function DistributionJobDetailPage() {
  const { djId } = useParams<{ djId: string }>();
  const navigate = useNavigate();
  const [dj, setDj] = useState<DistributionJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addEngOpen, setAddEngOpen] = useState(false);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [newEngName, setNewEngName] = useState('');
  const [fieldEngineers, setFieldEngineers] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (addEngOpen) {
      staffApi.getAll().then(all =>
        setFieldEngineers(all.filter(s => s.role === 'ENGINEER_FIELD' && s.active))
      );
    }
  }, [addEngOpen]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState<number | string>('');
  const [newMilestoneEvent, setNewMilestoneEvent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDocType, setUploadDocType] = useState('');

  const load = useCallback(() => {
    if (!djId) return;
    setLoading(true);
    distributionApi.get(djId)
      .then(setDj)
      .catch(() => setError('Failed to load distribution job'))
      .finally(() => setLoading(false));
  }, [djId]);

  useEffect(() => { load(); }, [load]);

  const save = async (patch: Partial<DistributionJob>) => {
    if (!djId) return;
    setSaving(true);
    try {
      const updated = await distributionApi.update(djId, patch);
      setDj(updated);
    } finally {
      setSaving(false);
    }
  };

  const approveRelease = async () => {
    if (!djId) return;
    const updated = await distributionApi.approveRelease(djId, 'Current User');
    setDj(updated);
  };

  const addEngineer = async () => {
    if (!djId || !newEngName) return;
    await distributionApi.addEngineer(djId, { engineerName: newEngName });
    setNewEngName('');
    setAddEngOpen(false);
    load();
  };

  const addMilestone = async () => {
    if (!djId || !newMilestoneName) return;
    await distributionApi.addMilestone(djId, {
      name: newMilestoneName,
      amount: newMilestoneAmount || null,
      triggerEvent: newMilestoneEvent,
    });
    setNewMilestoneName(''); setNewMilestoneAmount(''); setNewMilestoneEvent('');
    setAddMilestoneOpen(false);
    load();
  };

  const toggleMilestoneStatus = async (m: PaymentMilestone) => {
    if (!djId) return;
    await distributionApi.updateMilestone(djId, m.id, {
      status: m.status === 'PAID' ? 'PENDING' : 'PAID',
    });
    load();
  };

  const updateEngineerField = async (eng: InstallationEngineer, field: string, value: any) => {
    if (!djId) return;
    await distributionApi.updateEngineer(djId, eng.id, { [field]: value });
    load();
  };

  const uploadDocument = async (docType: string, file: File) => {
    if (!djId) return;
    const { url } = await distributionApi.getDocumentUploadUrl(djId, docType, file.type);
    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    load();
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error || !dj) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error ?? 'Not found'}</Alert>
    </Container>
  );

  const packChecklistComplete = PACK_CHECKLIST_LABELS.every(([key]) => dj[key]);
  const deliveryChecklistComplete = DELIVERY_CHECKLIST_LABELS.every(([key]) => dj[key]);
  const handoverComplete = HANDOVER_ITEMS.every(([key]) => dj[key]);

  // Engineer totals (T-135)
  const totalMiles = dj.engineers.reduce((s, e) => s + (e.miles ?? 0), 0);
  const totalTravel = dj.engineers.reduce((s, e) => s + (e.travelCost ?? 0), 0);
  const totalNight = dj.engineers.reduce((s, e) => s + (e.nightRate ?? 0), 0);
  const totalHotel = dj.engineers.reduce((s, e) => s + (e.hotelCost ?? 0), 0);

  // Alerts panel (T-140)
  const alerts: string[] = [];
  if (dj.distributionType === 'INSTALLATION') {
    if (!dj.ramsUploaded) alerts.push('RAMS not yet uploaded');
    if (!dj.ramsReviewed) alerts.push('RAMS not reviewed');
    if (!dj.customerSignoffUploaded) alerts.push('Customer sign-off document not uploaded');
    if (dj.returnVisit && !dj.returnVisitResolved) alerts.push('Return visit flagged — not resolved');
    const unpaidMilestones = dj.milestones.filter(m => m.status === 'PENDING');
    if (unpaidMilestones.length > 0) alerts.push(`${unpaidMilestones.length} payment milestone(s) pending`);
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}>Back</Button>
            <Title order={2} fw={700}>{dj.djRef}</Title>
            <Badge color="blue" variant="light">{DIST_LABELS[dj.distributionType]}</Badge>
            {dj.customerName && <Text c="dimmed" size="sm">{dj.customerName}</Text>}
          </Group>
        </Group>

        {/* Live Alerts Panel (T-140) */}
        {alerts.length > 0 && (
          <Alert icon={<IconAlertCircle />} color="orange" title="Live Alerts">
            <Stack gap="xs">
              {alerts.map(a => <Text key={a} size="sm">{a}</Text>)}
            </Stack>
          </Alert>
        )}

        {/* 6A — Collection */}
        {dj.distributionType === 'COLLECTION' && (
          <Stack gap="lg">
            {/* Accounts Release Gate (T-122) */}
            <Paper withBorder radius="md" p="lg"
              style={!dj.accountsReleaseApproved ? { borderColor: 'var(--mantine-color-red-4)' } : {}}>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">Accounts Release Approval</Text>
                  <Badge color={dj.accountsReleaseApproved ? 'green' : 'red'} variant="filled">
                    {dj.accountsReleaseApproved ? 'Released' : 'Blocked'}
                  </Badge>
                </Group>
                {!dj.accountsReleaseApproved && (
                  <Button size="sm" color="green" onClick={approveRelease}>
                    Approve Release (Finance)
                  </Button>
                )}
                {dj.accountsReleaseApprovedBy && (
                  <Text size="sm" c="dimmed">Approved by: {dj.accountsReleaseApprovedBy}</Text>
                )}
              </Stack>
            </Paper>

            {/* Pack Checklist (T-123) */}
            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">Pack Checklist</Text>
                  <Badge color={packChecklistComplete ? 'green' : 'gray'} variant="light">
                    {PACK_CHECKLIST_LABELS.filter(([k]) => dj[k]).length}/{PACK_CHECKLIST_LABELS.length}
                  </Badge>
                </Group>
                {PACK_CHECKLIST_LABELS.map(([key, label]) => (
                  <Checkbox key={key} label={label} checked={dj[key]}
                    onChange={(e) => save({ [key]: e.currentTarget.checked } as any)} />
                ))}
              </Stack>
            </Paper>

            {/* Collection Sign-Off (T-124) */}
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Collection Sign-Off</Text>
                {!packChecklistComplete && (
                  <Text size="sm" c="orange">Complete pack checklist to enable sign-off.</Text>
                )}
                <Grid gap="sm">
                  <Grid.Col span={6}>
                    <TextInput label="Collection Rep" value={dj.collectionRep ?? ''}
                      onChange={(e) => save({ collectionRep: e.currentTarget.value })}
                      disabled={!packChecklistComplete} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Collected At" type="datetime-local"
                      defaultValue={dj.collectedAt ? dj.collectedAt.slice(0, 16) : ''}
                      onBlur={(e) => save({ collectedAt: e.currentTarget.value || null })}
                      disabled={!packChecklistComplete} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea label="Customer Signature (captured)" value={dj.collectionSignature ?? ''}
                      onChange={(e) => save({ collectionSignature: e.currentTarget.value })}
                      disabled={!packChecklistComplete}
                      placeholder="Signature data / confirmation reference" />
                  </Grid.Col>
                </Grid>
                {dj.collectionSignature && (
                  <Button variant="light" size="sm" leftSection={<IconDownload size={14} />}
                    onClick={() => distributionApi.generatePoc(dj.id).catch(() => {})}>
                    Download Proof of Collection (PDF)
                  </Button>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* 6B — Delivery */}
        {dj.distributionType === 'DELIVERY' && (
          <Stack gap="lg">
            {/* Despatch Info (T-127) */}
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Despatch Information</Text>
                <Grid gap="sm">
                  <Grid.Col span={4}>
                    <TextInput label="Despatch Date" type="date"
                      defaultValue={dj.despatchDate?.slice(0, 10) ?? ''}
                      onBlur={(e) => save({ despatchDate: e.currentTarget.value || null })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="Carrier" value={dj.carrier ?? ''}
                      onChange={(e) => save({ carrier: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="Tracking Number" value={dj.trackingNumber ?? ''}
                      onChange={(e) => save({ trackingNumber: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput label="Pallet / Box Count" min={0}
                      value={dj.palletBoxCount ?? ''}
                      onChange={(v) => save({ palletBoxCount: typeof v === 'number' ? v : null })} />
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <TextInput label="Tracking Link (URL)" value={dj.trackingLink ?? ''}
                      onChange={(e) => save({ trackingLink: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Courier Name" value={dj.courierName ?? ''}
                      onChange={(e) => save({ courierName: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Driver Name" value={dj.driverName ?? ''}
                      onChange={(e) => save({ driverName: e.currentTarget.value })} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea label="Notes" value={dj.despatchNotes ?? ''}
                      onChange={(e) => save({ despatchNotes: e.currentTarget.value })} />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>

            {/* Delivery Checklist (T-128) */}
            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">Pack Pick Checklist</Text>
                  <Badge color={deliveryChecklistComplete ? 'green' : 'gray'} variant="light">
                    {DELIVERY_CHECKLIST_LABELS.filter(([k]) => dj[k]).length}/{DELIVERY_CHECKLIST_LABELS.length}
                  </Badge>
                </Group>
                {DELIVERY_CHECKLIST_LABELS.map(([key, label]) => (
                  <Checkbox key={key} label={label} checked={dj[key]}
                    onChange={(e) => save({ [key]: e.currentTarget.checked } as any)} />
                ))}
              </Stack>
            </Paper>

            {/* Delivery Sign-Off + POD (T-129) */}
            <Paper withBorder radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="sm">Delivery Sign-Off</Text>
                {!deliveryChecklistComplete && (
                  <Text size="sm" c="orange">Complete pack pick checklist to enable sign-off.</Text>
                )}
                <Textarea label="Customer Signature" value={dj.deliverySignature ?? ''}
                  onChange={(e) => save({ deliverySignature: e.currentTarget.value })}
                  disabled={!deliveryChecklistComplete}
                  placeholder="Signature data / confirmation reference" />
                <TextInput label="Signed Off At" type="datetime-local"
                  defaultValue={dj.deliverySignedOffAt ? dj.deliverySignedOffAt.slice(0, 16) : ''}
                  onBlur={(e) => save({ deliverySignedOffAt: e.currentTarget.value || null })}
                  disabled={!deliveryChecklistComplete} />
                {dj.deliverySignature && (
                  <Button variant="light" size="sm" leftSection={<IconDownload size={14} />}
                    onClick={() => distributionApi.generatePod(dj.id).catch(() => {})}>
                    Download Proof of Delivery (PDF)
                  </Button>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* 6C — Installation */}
        {dj.distributionType === 'INSTALLATION' && (
          <Tabs defaultValue="rams">
            <Tabs.List>
              <Tabs.Tab value="rams">RAMS</Tabs.Tab>
              <Tabs.Tab value="schedule">Schedule</Tabs.Tab>
              <Tabs.Tab value="team">Team</Tabs.Tab>
              <Tabs.Tab value="documents">Documents</Tabs.Tab>
              <Tabs.Tab value="financial">Financial</Tabs.Tab>
              <Tabs.Tab value="handover">Handover</Tabs.Tab>
              <Tabs.Tab value="progress">Progress</Tabs.Tab>
            </Tabs.List>

            {/* RAMS (T-132) */}
            <Tabs.Panel value="rams" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">RAMS Upload &amp; Review</Text>
                  <Switch label="RAMS Uploaded" checked={dj.ramsUploaded}
                    onChange={(e) => save({ ramsUploaded: e.currentTarget.checked })} />
                  <Switch label="RAMS Reviewed" checked={dj.ramsReviewed}
                    onChange={(e) => save({ ramsReviewed: e.currentTarget.checked })} />
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Installation Schedule (T-133) */}
            <Tabs.Panel value="schedule" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Installation Schedule</Text>
                  <Grid gap="sm">
                    <Grid.Col span={4}>
                      <TextInput label="Date In" type="date"
                        defaultValue={dj.dateIn?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ dateIn: e.currentTarget.value || null })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput label="Days on Site" min={0}
                        value={dj.daysOnSite ?? ''}
                        onChange={(v) => save({ daysOnSite: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput label="Est. Completion" type="date"
                        defaultValue={dj.estimatedCompletion?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ estimatedCompletion: e.currentTarget.value || null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Switch label="Extended Number Flag" checked={dj.extendedFlag}
                        onChange={(e) => save({ extendedFlag: e.currentTarget.checked })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Switch label="Return Visit Required" checked={dj.returnVisit}
                        onChange={(e) => save({ returnVisit: e.currentTarget.checked })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput label="Commission Date" type="date"
                        defaultValue={dj.commissionDate?.slice(0, 10) ?? ''}
                        onBlur={(e) => save({ commissionDate: e.currentTarget.value || null })} />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Team Assignment + Travel (T-134, T-135) */}
            <Tabs.Panel value="team" pt="md">
              <Stack gap="md">
                <Group justify="flex-end">
                  <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setAddEngOpen(true)}>
                    Add Engineer
                  </Button>
                </Group>
                {dj.engineers.length === 0 ? (
                  <Text c="dimmed" size="sm">No engineers assigned.</Text>
                ) : (
                  <Paper withBorder radius="md">
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Engineer</Table.Th>
                          <Table.Th>Sign-On</Table.Th>
                          <Table.Th>Overnight</Table.Th>
                          <Table.Th>Miles</Table.Th>
                          <Table.Th>Travel (£)</Table.Th>
                          <Table.Th>Night Rate (£)</Table.Th>
                          <Table.Th>Hotel (£)</Table.Th>
                          <Table.Th></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {dj.engineers.map((eng) => (
                          <Table.Tr key={eng.id}>
                            <Table.Td>{eng.engineerName}</Table.Td>
                            <Table.Td>
                              <TextInput size="xs" type="time"
                                value={eng.signOnTime ?? ''}
                                onChange={(e) => updateEngineerField(eng, 'signOnTime', e.currentTarget.value)} />
                            </Table.Td>
                            <Table.Td>
                              <Checkbox checked={eng.overnight}
                                onChange={(e) => updateEngineerField(eng, 'overnight', e.currentTarget.checked)} />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput size="xs" min={0}
                                value={eng.miles ?? ''}
                                onChange={(v) => updateEngineerField(eng, 'miles', v)} />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput size="xs" min={0} decimalScale={2}
                                value={eng.travelCost ?? ''}
                                onChange={(v) => updateEngineerField(eng, 'travelCost', v)} />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput size="xs" min={0} decimalScale={2}
                                value={eng.nightRate ?? ''}
                                onChange={(v) => updateEngineerField(eng, 'nightRate', v)} />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput size="xs" min={0} decimalScale={2}
                                value={eng.hotelCost ?? ''}
                                onChange={(v) => updateEngineerField(eng, 'hotelCost', v)} />
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon size="xs" color="red" variant="subtle"
                                onClick={async () => {
                                  await distributionApi.deleteEngineer(dj.id, eng.id);
                                  load();
                                }}>
                                <IconTrash size={12} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        <Table.Tr style={{ fontWeight: 700 }}>
                          <Table.Td>Totals</Table.Td>
                          <Table.Td></Table.Td>
                          <Table.Td></Table.Td>
                          <Table.Td>{totalMiles.toFixed(0)}</Table.Td>
                          <Table.Td>{fmtCurrency(totalTravel)}</Table.Td>
                          <Table.Td>{fmtCurrency(totalNight)}</Table.Td>
                          <Table.Td>{fmtCurrency(totalHotel)}</Table.Td>
                        </Table.Tr>
                      </Table.Tbody>
                    </Table>
                  </Paper>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Documents (T-136) */}
            <Tabs.Panel value="documents" pt="md">
              <Stack gap="md">
                <Paper withBorder radius="md" p="lg">
                  <Stack gap="sm">
                    <Text fw={600} size="sm">Task Book / Method Statement Documents</Text>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && uploadDocType) uploadDocument(uploadDocType, file);
                      }} />
                    {['Task Book', 'Method Statement', 'Risk Assessment', 'RAMS Pack'].map(docType => (
                      <Group key={docType} justify="space-between">
                        <Text size="sm">{docType}</Text>
                        <Group gap="xs">
                          <Button size="xs" variant="outline"
                            onClick={() => { setUploadDocType(docType); fileInputRef.current?.click(); }}>
                            Upload
                          </Button>
                          <Button size="xs" variant="subtle" leftSection={<IconDownload size={12} />}
                            onClick={async () => {
                              const { url } = await distributionApi.getDocumentDownloadUrl(dj.id, docType);
                              window.open(url, '_blank');
                            }}>
                            Download
                          </Button>
                        </Group>
                      </Group>
                    ))}
                    {dj.documents.length > 0 && (
                      <>
                        <Divider />
                        <Text size="xs" c="dimmed">Uploaded ({dj.documents.length}):</Text>
                        {dj.documents.map(doc => (
                          <Text key={doc.id} size="xs">{doc.docType} — {doc.fileName}</Text>
                        ))}
                      </>
                    )}
                  </Stack>
                </Paper>

                {/* T-147: Certificate release gate */}
                <Paper withBorder radius="md" p="lg"
                  style={{ borderColor: dj.certificatesReleased ? 'var(--mantine-color-green-4)' : 'var(--mantine-color-orange-4)' }}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={600} size="sm">Completion Certificates &amp; Documents</Text>
                      {dj.certificatesReleased ? (
                        <Badge color="green" size="sm">Released</Badge>
                      ) : (
                        <Badge color="orange" size="sm">Locked — Awaiting Final Payment</Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      Certificates, O&amp;M manuals, and warranty documents are locked until final payment is confirmed.
                    </Text>
                    {['Completion Certificate', 'O&M Manual', 'Warranty Document'].map(docType => (
                      <Group key={docType} justify="space-between">
                        <Text size="sm">{docType}</Text>
                        <Button size="xs" variant="subtle" leftSection={<IconDownload size={12} />}
                          disabled={!dj.certificatesReleased}
                          onClick={async () => {
                            const { url } = await distributionApi.getDocumentDownloadUrl(dj.id, docType);
                            window.open(url, '_blank');
                          }}>
                          Download
                        </Button>
                      </Group>
                    ))}
                    {!dj.certificatesReleased && (
                      <Button size="sm" color="green"
                        onClick={async () => {
                          const updated = await distributionApi.releaseCertificates(dj.id);
                          setDj(updated);
                        }}>
                        Release Certificates (Finance/Admin)
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            {/* Payment Milestones (T-137) */}
            <Tabs.Panel value="financial" pt="md">
              <Stack gap="md">
                <Group justify="flex-end">
                  <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setAddMilestoneOpen(true)}>
                    Add Milestone
                  </Button>
                </Group>
                {dj.milestones.length === 0 ? (
                  <Text c="dimmed" size="sm">No payment milestones defined.</Text>
                ) : (
                  <Paper withBorder radius="md">
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Milestone</Table.Th>
                          <Table.Th>Amount</Table.Th>
                          <Table.Th>Trigger Event</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {dj.milestones.map((m) => (
                          <Table.Tr key={m.id}>
                            <Table.Td>{m.name}</Table.Td>
                            <Table.Td>{fmtCurrency(m.amount)}</Table.Td>
                            <Table.Td>{m.triggerEvent ?? '—'}</Table.Td>
                            <Table.Td>
                              <Badge
                                color={m.status === 'PAID' ? 'green' : 'orange'} variant="light"
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleMilestoneStatus(m)}>
                                {m.status}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Handover Sign-Off (T-138, T-139) */}
            <Tabs.Panel value="handover" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Quality &amp; Handover Sign-Off</Text>
                    <Badge color={handoverComplete ? 'green' : 'gray'} variant="light">
                      {HANDOVER_ITEMS.filter(([k]) => dj[k]).length}/{HANDOVER_ITEMS.length} complete
                    </Badge>
                  </Group>
                  {HANDOVER_ITEMS.map(([key, label]) => (
                    <Checkbox key={key} label={label} checked={dj[key]}
                      onChange={(e) => save({ [key]: e.currentTarget.checked } as any)} />
                  ))}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Progress Steps (T-141) */}
            <Tabs.Panel value="progress" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Installation Progress Steps</Text>
                  {dj.progressSteps.length === 0 ? (
                    <Text c="dimmed" size="sm">No progress steps recorded.</Text>
                  ) : (
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Step</Table.Th>
                          <Table.Th>Date</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {dj.progressSteps.map((step) => (
                          <Table.Tr key={step.id}>
                            <Table.Td>{step.stepName}</Table.Td>
                            <Table.Td>{step.stepDate ? step.stepDate.slice(0, 10) : '—'}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                  <Button size="sm" variant="light" leftSection={<IconPlus size={14} />}
                    onClick={() => {
                      if (!djId) return;
                      distributionApi.addProgressStep(djId, {
                        stepName: `Step ${dj.progressSteps.length + 1}`,
                      }).then(load);
                    }}>
                    Add Progress Step
                  </Button>
                </Stack>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>

      {/* Add Engineer Modal */}
      <Modal
        opened={addEngOpen}
        onClose={() => { setAddEngOpen(false); setNewEngName(''); }}
        title="Add Engineer"
      >
        <Stack gap="sm">
          <Select
            label="Engineer"
            placeholder="Select a field engineer"
            required
            searchable
            data={fieldEngineers.map(e => ({ value: e.name, label: e.name }))}
            value={newEngName}
            onChange={(v) => setNewEngName(v ?? '')}
            nothingFoundMessage="No field engineers found in staff directory"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => { setAddEngOpen(false); setNewEngName(''); }}>Cancel</Button>
            <Button onClick={addEngineer} disabled={!newEngName}>Add</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal opened={addMilestoneOpen} onClose={() => setAddMilestoneOpen(false)} title="Add Payment Milestone">
        <Stack gap="sm">
          <TextInput label="Milestone Name" required value={newMilestoneName}
            onChange={(e) => setNewMilestoneName(e.currentTarget.value)} />
          <NumberInput label="Amount (£)" decimalScale={2} value={newMilestoneAmount}
            onChange={setNewMilestoneAmount} />
          <TextInput label="Trigger Event" value={newMilestoneEvent}
            onChange={(e) => setNewMilestoneEvent(e.currentTarget.value)}
            placeholder="e.g. Deposit, Stage 1 Complete, Final Payment" />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setAddMilestoneOpen(false)}>Cancel</Button>
            <Button onClick={addMilestone} disabled={!newMilestoneName}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
