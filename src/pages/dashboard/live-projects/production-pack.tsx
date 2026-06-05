import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, Text, Badge,
  NumberInput, Select, Textarea, Switch, Center, Loader, Alert,
  Table, ActionIcon, Tabs, Divider, Progress, ThemeIcon, Modal, TextInput,
  Checkbox, PasswordInput, SimpleGrid,
} from '@mantine/core';
import {
  IconArrowLeft, IconPlus, IconTrash, IconAlertCircle, IconChevronLeft,
  IconChevronRight, IconSend, IconDownload, IconLock, IconFileText,
  IconClipboardCheck, IconPackage, IconTag, IconDatabase,
} from '@tabler/icons-react';
import { productionPackApi } from 'src/api/production-pack';
import type { ProductionPack, ProductionSystem, SystemFamily, CuttingListItem } from 'src/types/production-pack';

const DEFAULT_FORMULA_CONFIG = {
  dc80_side_channel_deduction_mm: 45,
  dc80_header_allowance_mm: 80,
  dc80_bottom_bar_deduction_mm: 30,
  csv_side_channel_deduction_mm: 50,
  csv_header_allowance_mm: 90,
  csv_bottom_bar_deduction_mm: 35,
};

const QC_CHECKLIST_ITEMS = [
  'Dimensions verified',
  'Barrel diameter confirmed',
  'Cutting list checked',
  'Fabric type correct',
  'Motor installed',
  'Control panel wired',
  'Manual override tested',
  'Drop test completed',
  'Labelled correctly',
  'Signed off by QC',
];

function barrelDiameter(family: SystemFamily | null): string {
  if (family === 'NECO_DC80') return 'Ø89 mm';
  if (family === 'CSV') return 'Ø100 mm';
  return '—';
}

const FAMILY_OPTIONS = [
  { value: 'NECO_DC80', label: 'NECO DC80' },
  { value: 'CSV', label: 'CSV' },
];

const VARIANT_OPTIONS: Record<SystemFamily, { value: string; label: string }[]> = {
  NECO_DC80: [
    { value: 'DC80-10', label: 'DC80-10' },
    { value: 'DC80-25', label: 'DC80-25' },
    { value: 'DC80-40', label: 'DC80-40' },
  ],
  CSV: [
    { value: 'CSV-SMALL', label: 'CSV Small' },
    { value: 'CSV-LARGE', label: 'CSV Large' },
    { value: 'CSV-XL', label: 'CSV XL' },
  ],
};

const ACCESSORIES_DEFAULT = [
  { name: 'Control Panel', quantity: 1, price: null },
  { name: 'Detector', quantity: 1, price: null },
  { name: 'Motor', quantity: 1, price: null },
  { name: 'Battery', quantity: 1, price: null },
  { name: 'Manual Override', quantity: 0, price: null },
  { name: 'Activation Device', quantity: 1, price: null },
];

export default function ProductionPackPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [pack, setPack] = useState<ProductionPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSystemIdx, setActiveSystemIdx] = useState(0);
  const [addSystemOpen, setAddSystemOpen] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formulaUnlocked, setFormulaUnlocked] = useState(false);
  const [formulaPassphrase, setFormulaPassphrase] = useState('');
  const [formulaPassError, setFormulaPassError] = useState(false);
  const [formulaConfig, setFormulaConfig] = useState({ ...DEFAULT_FORMULA_CONFIG });
  const [formulaSaving, setFormulaSaving] = useState(false);
  const [qcChecks, setQcChecks] = useState<Record<string, Record<string, boolean>>>({});

  const load = useCallback(() => {
    if (!packId) return;
    setLoading(true);
    productionPackApi.get(packId)
      .then(setPack)
      .catch(() => setError('Failed to load production pack'))
      .finally(() => setLoading(false));
  }, [packId]);

  useEffect(() => { load(); }, [load]);

  const activeSystem: ProductionSystem | null = pack?.systems[activeSystemIdx] ?? null;

  const updateSystem = async (patch: Partial<ProductionSystem>) => {
    if (!pack || !activeSystem) return;
    setSaving(true);
    try {
      const updated = await productionPackApi.updateSystem(pack.id, activeSystem.id, patch);
      setPack(prev => prev ? {
        ...prev, systems: prev.systems.map(s => s.id === updated.id ? updated : s),
      } : prev);
    } finally {
      setSaving(false);
    }
  };

  const addSystem = async () => {
    if (!pack) return;
    const system = await productionPackApi.addSystem(pack.id, {
      accessories: ACCESSORIES_DEFAULT,
    });
    setPack(prev => prev ? { ...prev, systems: [...prev.systems, system] } : prev);
    setActiveSystemIdx((pack.systems.length));
    setAddSystemOpen(false);
  };

  const deleteSystem = async (systemId: string) => {
    if (!pack) return;
    await productionPackApi.deleteSystem(pack.id, systemId);
    const newSystems = pack.systems.filter(s => s.id !== systemId);
    setPack(prev => prev ? { ...prev, systems: newSystems } : prev);
    setActiveSystemIdx(Math.max(0, activeSystemIdx - 1));
  };

  const sendToStage5 = async () => {
    if (!pack) return;
    setSending(true);
    try {
      await productionPackApi.sendToStage5(pack.id);
      navigate(`/dashboard/manufacturing`);
    } catch {
      setError('Failed to send to manufacturing');
    } finally {
      setSending(false);
      setSendConfirmOpen(false);
    }
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error || !pack) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error ?? 'Pack not found'}</Alert>
    </Container>
  );

  const systemsComplete = pack.systems.every(s => s.family && s.variant && s.widthMm && s.heightMm);
  const canSendToStage5 = pack.systems.length > 0 && pack.status === 'DRAFT' && systemsComplete;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}>Back</Button>
            <Title order={2} fw={700}>{pack.packRef}</Title>
            <Badge color="blue" variant="light">{pack.status}</Badge>
          </Group>
          <Stack gap={4} align="flex-end">
            <Group gap="xs">
              <Button variant="subtle" size="sm" leftSection={<IconLock size={14} />}
                onClick={() => { setFormulaOpen(true); setFormulaUnlocked(false); setFormulaPassphrase(''); setFormulaPassError(false); }}>
                Formula Config
              </Button>
              <Button
                color="green"
                disabled={!canSendToStage5}
                leftSection={<IconSend size={16} />}
                onClick={() => setSendConfirmOpen(true)}>
                Send to Stage 5A — Stock Check &amp; Reservation
              </Button>
            </Group>
            {pack.systems.length > 0 && !systemsComplete && (
              <Text size="xs" c="orange">All systems need family, variant and dimensions</Text>
            )}
          </Stack>
        </Group>

        {/* System navigation (T-092) */}
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between">
            <Group>
              <Text fw={600} size="sm">Systems</Text>
              {pack.systems.map((s, i) => (
                <Button key={s.id} size="xs"
                  variant={i === activeSystemIdx ? 'filled' : 'light'}
                  onClick={() => setActiveSystemIdx(i)}>
                  System {s.systemIndex} {s.family ? `(${s.variant ?? s.family})` : ''}
                </Button>
              ))}
              <Button size="xs" variant="outline" leftSection={<IconPlus size={12} />}
                onClick={() => setAddSystemOpen(true)}>
                Add System
              </Button>
            </Group>
            <Group gap="xs">
              <ActionIcon disabled={activeSystemIdx === 0} onClick={() => setActiveSystemIdx(i => i - 1)}>
                <IconChevronLeft size={16} />
              </ActionIcon>
              <Text size="sm">{activeSystemIdx + 1} of {pack.systems.length}</Text>
              <ActionIcon disabled={activeSystemIdx >= pack.systems.length - 1}
                onClick={() => setActiveSystemIdx(i => i + 1)}>
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>

        {activeSystem ? (
          <Tabs defaultValue="config">
            <Tabs.List>
              <Tabs.Tab value="config">Configuration</Tabs.Tab>
              <Tabs.Tab value="cutting">Cutting List</Tabs.Tab>
              <Tabs.Tab value="accessories">Accessories</Tabs.Tab>
              <Tabs.Tab value="options">Options</Tabs.Tab>
              <Tabs.Tab value="spec-sheet" leftSection={<IconFileText size={14} />}>Spec Sheet</Tabs.Tab>
              <Tabs.Tab value="qc-forms" leftSection={<IconClipboardCheck size={14} />}>QC Forms</Tabs.Tab>
              <Tabs.Tab value="packing-list" leftSection={<IconPackage size={14} />}>Packing List</Tabs.Tab>
              <Tabs.Tab value="labels" leftSection={<IconTag size={14} />}>Labels</Tabs.Tab>
              <Tabs.Tab value="stock" leftSection={<IconDatabase size={14} />}>Stock & Purchasing</Tabs.Tab>
              <Tabs.Tab value="reservation" leftSection={<IconClipboardCheck size={14} />}>Reservation List</Tabs.Tab>
            </Tabs.List>

            {/* Configuration (T-089, T-091) */}
            <Tabs.Panel value="config" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">System {activeSystem.systemIndex} Configuration</Text>
                    <ActionIcon color="red" variant="subtle" size="sm"
                      onClick={() => deleteSystem(activeSystem.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                  <Grid gap="sm">
                    <Grid.Col span={6}>
                      <Select label="System Family" required
                        data={FAMILY_OPTIONS}
                        value={activeSystem.family}
                        onChange={(v) => updateSystem({ family: v as SystemFamily, variant: null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Select label="Variant" required
                        data={activeSystem.family ? VARIANT_OPTIONS[activeSystem.family] : []}
                        value={activeSystem.variant}
                        disabled={!activeSystem.family}
                        onChange={(v) => updateSystem({ variant: v })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="Width (mm)" required min={0}
                        value={activeSystem.widthMm ?? ''}
                        onChange={(v) => updateSystem({ widthMm: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput label="Height (mm)" required min={0}
                        value={activeSystem.heightMm ?? ''}
                        onChange={(v) => updateSystem({ heightMm: typeof v === 'number' ? v : null })} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Textarea label="Notes / Special Instructions"
                        value={activeSystem.notes ?? ''}
                        onChange={(e) => updateSystem({ notes: e.currentTarget.value })} />
                    </Grid.Col>
                  </Grid>
                  {activeSystem.qrCodeUrl && (
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>System QR Code</Text>
                      <img src={activeSystem.qrCodeUrl} alt="QR Code" style={{ width: 128, height: 128 }} />
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Cutting List (T-093) */}
            <Tabs.Panel value="cutting" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Fabrication Cutting List</Text>
                    <Group gap="xs">
                      <Badge color={activeSystem.cuttingList ? 'green' : 'gray'} variant="light">
                        {activeSystem.cuttingList ? 'Computed' : 'Enter dimensions first'}
                      </Badge>
                      {activeSystem.cuttingList && activeSystem.cuttingList.length > 0 && (
                        <Button size="xs" variant="light" leftSection={<IconDownload size={12} />}
                          onClick={() => productionPackApi.downloadSystemPdf(pack.id, activeSystem.id, 'cutting-list', `cutting-list-SYS${activeSystem.systemIndex}.pdf`)}>
                          PDF
                        </Button>
                      )}
                    </Group>
                  </Group>
                  {activeSystem.cuttingList && activeSystem.cuttingList.length > 0 ? (
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Component</Table.Th>
                          <Table.Th>Dimension</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {(activeSystem.cuttingList as CuttingListItem[]).map((item) => (
                          <Table.Tr key={item.component}>
                            <Table.Td>{item.component}</Table.Td>
                            <Table.Td>{item.dimension}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  ) : (
                    <Text c="dimmed" size="sm">Enter width, height and variant to generate the cutting list.</Text>
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Accessories (T-094) */}
            <Tabs.Panel value="accessories" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">Controls &amp; Accessories</Text>
                  <Table striped withTableBorder withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Price (£)</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {((activeSystem.accessories as any[]) ?? ACCESSORIES_DEFAULT).map((item: any, idx: number) => (
                        <Table.Tr key={item.name}>
                          <Table.Td>{item.name}</Table.Td>
                          <Table.Td>
                            <NumberInput size="xs" min={0} value={item.quantity}
                              onChange={(v) => {
                                const acc = [...((activeSystem.accessories as any[]) ?? ACCESSORIES_DEFAULT)];
                                acc[idx] = { ...acc[idx], quantity: typeof v === 'number' ? v : 0 };
                                updateSystem({ accessories: acc });
                              }} />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput size="xs" min={0} decimalScale={2}
                              value={item.price ?? ''}
                              onChange={(v) => {
                                const acc = [...((activeSystem.accessories as any[]) ?? ACCESSORIES_DEFAULT)];
                                acc[idx] = { ...acc[idx], price: typeof v === 'number' ? v : null };
                                updateSystem({ accessories: acc });
                              }} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Per-system Options (T-096) */}
            <Tabs.Panel value="options" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Text fw={600} size="sm">System Options</Text>
                  <Switch label="Customer Supplied"
                    checked={activeSystem.customerSupplied}
                    onChange={(e) => updateSystem({ customerSupplied: e.currentTarget.checked })} />
                  <Switch label="Add Instruction Manual"
                    checked={activeSystem.addManual}
                    onChange={(e) => updateSystem({ addManual: e.currentTarget.checked })} />
                  <Switch label="Add Warranty Card"
                    checked={activeSystem.addWarrantyCard}
                    onChange={(e) => updateSystem({ addWarrantyCard: e.currentTarget.checked })} />
                </Stack>
              </Paper>
            </Tabs.Panel>
            {/* Spec Sheet (T-097) */}
            <Tabs.Panel value="spec-sheet" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Production Specification — System {activeSystem.systemIndex}</Text>
                    <Button size="xs" variant="light" leftSection={<IconDownload size={12} />}
                      onClick={() => productionPackApi.downloadSystemPdf(pack.id, activeSystem.id, 'spec-sheet', `spec-sheet-SYS${activeSystem.systemIndex}.pdf`)}>
                      Download Spec Sheet PDF
                    </Button>
                  </Group>
                  <Divider />
                  <SimpleGrid cols={2} spacing="md">
                    <div><Text size="xs" c="dimmed">System Family</Text><Text size="sm" fw={500}>{activeSystem.family === 'NECO_DC80' ? 'NECO DC80' : activeSystem.family === 'CSV' ? 'CSV' : '—'}</Text></div>
                    <div><Text size="xs" c="dimmed">Variant</Text><Text size="sm" fw={500}>{activeSystem.variant ?? '—'}</Text></div>
                    <div><Text size="xs" c="dimmed">Width</Text><Text size="sm" fw={500}>{activeSystem.widthMm != null ? `${activeSystem.widthMm} mm` : '—'}</Text></div>
                    <div><Text size="xs" c="dimmed">Height</Text><Text size="sm" fw={500}>{activeSystem.heightMm != null ? `${activeSystem.heightMm} mm` : '—'}</Text></div>
                    <div><Text size="xs" c="dimmed">Barrel Diameter</Text><Text size="sm" fw={500}>{barrelDiameter(activeSystem.family)}</Text></div>
                    <div><Text size="xs" c="dimmed">Customer Supplied</Text><Text size="sm" fw={500}>{activeSystem.customerSupplied ? 'Yes' : 'No'}</Text></div>
                    <div><Text size="xs" c="dimmed">Instruction Manual</Text><Text size="sm" fw={500}>{activeSystem.addManual ? 'Included' : 'Not included'}</Text></div>
                    <div><Text size="xs" c="dimmed">Warranty Card</Text><Text size="sm" fw={500}>{activeSystem.addWarrantyCard ? 'Included' : 'Not included'}</Text></div>
                    <div><Text size="xs" c="dimmed">Active Accessories</Text><Text size="sm" fw={500}>{(activeSystem.accessories ?? []).filter((a: any) => a.quantity > 0).length} items</Text></div>
                    <div><Text size="xs" c="dimmed">Pack Reference</Text><Text size="sm" fw={500}>{pack.packRef}</Text></div>
                  </SimpleGrid>
                  {activeSystem.notes && (
                    <>
                      <Divider label="Notes / Special Instructions" labelPosition="left" />
                      <Text size="sm">{activeSystem.notes}</Text>
                    </>
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* QC Forms (T-098) */}
            <Tabs.Panel value="qc-forms" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  {(() => {
                    const checks = qcChecks[activeSystem.id] ?? {};
                    const doneCount = QC_CHECKLIST_ITEMS.filter(item => checks[item]).length;
                    const allDone = doneCount === QC_CHECKLIST_ITEMS.length;
                    return (
                      <>
                        <Group justify="space-between">
                          <Text fw={600} size="sm">QC Checklist — System {activeSystem.systemIndex}</Text>
                          <Group gap="xs">
                            {allDone && <Badge color="green" variant="light">QC Complete</Badge>}
                            <Button size="xs" variant="light" leftSection={<IconDownload size={12} />}
                              onClick={() => productionPackApi.downloadSystemPdf(pack.id, activeSystem.id, 'qc-form', `qc-form-SYS${activeSystem.systemIndex}.pdf`)}>
                              Download QC PDF
                            </Button>
                          </Group>
                        </Group>
                        <Progress value={(doneCount / QC_CHECKLIST_ITEMS.length) * 100} size="sm" color={allDone ? 'green' : 'blue'} />
                        <Text size="xs" c="dimmed">{doneCount} of {QC_CHECKLIST_ITEMS.length} items checked</Text>
                        <Stack gap="xs">
                          {QC_CHECKLIST_ITEMS.map(item => (
                            <Checkbox key={item} label={item}
                              checked={checks[item] ?? false}
                              onChange={e => setQcChecks(prev => ({
                                ...prev,
                                [activeSystem.id]: { ...prev[activeSystem.id], [item]: e.currentTarget.checked },
                              }))} />
                          ))}
                        </Stack>
                      </>
                    );
                  })()}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Packing List (T-099) */}
            <Tabs.Panel value="packing-list" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Packing List — System {activeSystem.systemIndex}</Text>
                    <Button size="xs" variant="light" leftSection={<IconDownload size={12} />}
                      onClick={() => productionPackApi.downloadSystemPdf(pack.id, activeSystem.id, 'packing-list', `packing-list-SYS${activeSystem.systemIndex}.pdf`)}>
                      Download PDF
                    </Button>
                  </Group>
                  {(() => {
                    const rows: { item: string; description: string; qty: number; notes: string }[] = [];
                    (activeSystem.cuttingList ?? []).forEach((cl: CuttingListItem) => {
                      rows.push({ item: 'Component', description: cl.component, qty: 1, notes: cl.dimension });
                    });
                    (activeSystem.accessories ?? []).filter((a: any) => a.quantity > 0).forEach((acc: any) => {
                      rows.push({ item: 'Accessory', description: acc.name, qty: acc.quantity, notes: acc.price != null ? `£${acc.price}` : '' });
                    });
                    if (activeSystem.addManual) rows.push({ item: 'Document', description: 'Instruction Manual', qty: 1, notes: '' });
                    if (activeSystem.addWarrantyCard) rows.push({ item: 'Document', description: 'Warranty Card', qty: 1, notes: '' });
                    if (rows.length === 0) return <Text c="dimmed" size="sm">Enter dimensions and configure accessories first.</Text>;
                    return (
                      <Table striped withTableBorder withColumnBorders>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Item</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th>Qty</Table.Th>
                            <Table.Th>Notes</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {rows.map((r, i) => (
                            <Table.Tr key={i}>
                              <Table.Td>{r.item}</Table.Td>
                              <Table.Td>{r.description}</Table.Td>
                              <Table.Td>{r.qty}</Table.Td>
                              <Table.Td>{r.notes}</Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    );
                  })()}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Labels (T-100) */}
            <Tabs.Panel value="labels" pt="md">
              <Stack gap="md">
                {!activeSystem.family || !activeSystem.widthMm || !activeSystem.heightMm ? (
                  <Text c="dimmed" size="sm">Configure system family and dimensions first.</Text>
                ) : (
                  <>
                    <Group gap="lg" align="flex-start">
                      {/* System Label */}
                      <Paper withBorder radius="md" p="md" style={{ width: 280, border: '2px solid var(--mantine-color-gray-4)' }}>
                        <Stack gap="xs">
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>System Label</Text>
                          <Text fw={800} size="lg">{activeSystem.variant ?? activeSystem.family}</Text>
                          <Text size="sm">W: {activeSystem.widthMm}mm × H: {activeSystem.heightMm}mm</Text>
                          <Text size="sm">Barrel: {barrelDiameter(activeSystem.family)}</Text>
                          <Text size="xs" c="dimmed">Serial: {pack.packRef}-SYS{activeSystem.systemIndex}</Text>
                          {activeSystem.qrCodeUrl
                            ? <img src={activeSystem.qrCodeUrl} alt="QR" style={{ width: 64, height: 64 }} />
                            : <div style={{ width: 64, height: 64, background: 'var(--mantine-color-gray-2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text size="xs" c="dimmed">QR</Text></div>
                          }
                        </Stack>
                      </Paper>
                      {/* Box Label */}
                      <Paper withBorder radius="md" p="md" style={{ width: 320, border: '2px solid var(--mantine-color-gray-4)' }}>
                        <Stack gap="xs">
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Box Label</Text>
                          <Text fw={800} size="md">Fire Curtain — {activeSystem.variant ?? activeSystem.family}</Text>
                          <Text size="sm">{activeSystem.widthMm}mm W × {activeSystem.heightMm}mm H</Text>
                          <Text size="sm">Pack: {pack.packRef}</Text>
                          <Badge color="red" variant="filled" size="sm">HEAVY — HANDLE WITH CARE</Badge>
                          <Text size="xs" fw={500}>Fire Curtains Ltd</Text>
                        </Stack>
                      </Paper>
                    </Group>
                    <Button variant="outline" size="sm" leftSection={<IconDownload size={14} />} style={{ width: 'fit-content' }}
                      onClick={() => productionPackApi.downloadSystemPdf(pack.id, activeSystem.id, 'labels', `labels-SYS${activeSystem.systemIndex}.pdf`)}>
                      Print Labels
                    </Button>
                  </>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Stock & Purchasing (T-101) */}
            <Tabs.Panel value="stock" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Stock & Purchase Requirements — System {activeSystem.systemIndex}</Text>
                    <Button size="xs" variant="light" leftSection={<IconDownload size={12} />}
                      onClick={() => productionPackApi.downloadSystemPdf(pack.id, activeSystem.id, 'stock-requirements', `stock-requirements-SYS${activeSystem.systemIndex}.pdf`)}>
                      Download
                    </Button>
                  </Group>
                  {(() => {
                    const rows: { component: string; qty: number; unit: string; notes: string }[] = [];
                    (activeSystem.cuttingList ?? []).forEach((cl: CuttingListItem) => {
                      rows.push({ component: cl.component, qty: 1, unit: 'pcs', notes: cl.dimension });
                    });
                    (activeSystem.accessories ?? []).filter((a: any) => a.quantity > 0).forEach((acc: any) => {
                      rows.push({ component: acc.name, qty: acc.quantity, unit: 'pcs', notes: '—' });
                    });
                    if (rows.length === 0) return <Text c="dimmed" size="sm">Enter dimensions to generate stock requirements.</Text>;
                    return (
                      <>
                        <Table striped withTableBorder withColumnBorders>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Component</Table.Th>
                              <Table.Th>Required Qty</Table.Th>
                              <Table.Th>Unit</Table.Th>
                              <Table.Th>Notes</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {rows.map((r, i) => (
                              <Table.Tr key={i}>
                                <Table.Td>{r.component}</Table.Td>
                                <Table.Td>{r.qty}</Table.Td>
                                <Table.Td>{r.unit}</Table.Td>
                                <Table.Td>{r.notes}</Table.Td>
                              </Table.Tr>
                            ))}
                            <Table.Tr style={{ fontWeight: 700 }}>
                              <Table.Td>Total Line Items</Table.Td>
                              <Table.Td>{rows.length}</Table.Td>
                              <Table.Td colSpan={2} />
                            </Table.Tr>
                          </Table.Tbody>
                        </Table>
                        <Group gap="xs">
                          <Button variant="outline" size="sm" disabled title="Feature coming soon">
                            Create Purchase Order
                          </Button>
                        </Group>
                      </>
                    );
                  })()}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Stage 5A Reservation List — spans ALL systems */}
            <Tabs.Panel value="reservation" pt="md">
              <Paper withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text fw={600} size="sm">Stage 5A — Stock Reservation List</Text>
                      <Text size="xs" c="dimmed">All components across every system reserved for manufacturing.</Text>
                    </Stack>
                    <Badge color={pack.status === 'STAGE5' ? 'green' : 'gray'} variant="light">
                      {pack.status === 'STAGE5' ? 'Sent to Stage 5' : 'Pending — not yet sent'}
                    </Badge>
                  </Group>
                  <Divider />
                  {(() => {
                    const rows: { system: number; component: string; qty: number; spec: string }[] = [];
                    pack.systems.forEach(s => {
                      (s.cuttingList ?? []).forEach((cl: CuttingListItem) => {
                        rows.push({ system: s.systemIndex, component: cl.component, qty: 1, spec: cl.dimension });
                      });
                      ((s.accessories as any[]) ?? []).filter((a: any) => a.quantity > 0).forEach((acc: any) => {
                        rows.push({ system: s.systemIndex, component: acc.name, qty: acc.quantity, spec: acc.price != null ? `£${acc.price}` : '—' });
                      });
                    });
                    if (rows.length === 0) {
                      return <Text c="dimmed" size="sm">Configure systems with dimensions to generate the reservation list.</Text>;
                    }
                    return (
                      <>
                        <Table striped withTableBorder withColumnBorders>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>System</Table.Th>
                              <Table.Th>Component</Table.Th>
                              <Table.Th>Qty</Table.Th>
                              <Table.Th>Spec / Dimension</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {rows.map((r, i) => (
                              <Table.Tr key={i}>
                                <Table.Td>SYS-{r.system}</Table.Td>
                                <Table.Td>{r.component}</Table.Td>
                                <Table.Td>{r.qty}</Table.Td>
                                <Table.Td>{r.spec}</Table.Td>
                              </Table.Tr>
                            ))}
                            <Table.Tr style={{ fontWeight: 700 }}>
                              <Table.Td colSpan={2}>Total Items</Table.Td>
                              <Table.Td>{rows.reduce((s, r) => s + r.qty, 0)}</Table.Td>
                              <Table.Td />
                            </Table.Tr>
                          </Table.Tbody>
                        </Table>
                        <Text size="xs" c="dimmed">Sent to warehouse automatically when the pack advances to Stage 5A.</Text>
                      </>
                    );
                  })()}
                </Stack>
              </Paper>
            </Tabs.Panel>

          </Tabs>
        ) : (
          <Paper withBorder radius="md" p="xl">
            <Center>
              <Stack align="center" gap="sm">
                <Text c="dimmed">No systems added yet.</Text>
                <Button leftSection={<IconPlus size={14} />} onClick={() => setAddSystemOpen(true)}>
                  Add First System
                </Button>
              </Stack>
            </Center>
          </Paper>
        )}

        {/* Add System Modal */}
        <Modal opened={addSystemOpen} onClose={() => setAddSystemOpen(false)} title="Add System">
          <Stack gap="sm">
            <Text size="sm">A new system will be added as System {(pack.systems.length + 1)} of {pack.systems.length + 1}.</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setAddSystemOpen(false)}>Cancel</Button>
              <Button onClick={addSystem}>Add System</Button>
            </Group>
          </Stack>
        </Modal>

        {/* Formula Config Modal */}
        <Modal opened={formulaOpen} onClose={() => setFormulaOpen(false)} title="Formula Configuration — Admin Only" size="lg">
          {!formulaUnlocked ? (
            <Stack gap="md">
              <Text size="sm" c="dimmed">Enter the admin passphrase to unlock formula settings.</Text>
              <PasswordInput label="Admin Passphrase"
                value={formulaPassphrase}
                onChange={e => setFormulaPassphrase(e.currentTarget.value)}
                error={formulaPassError ? 'Invalid passphrase' : undefined} />
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setFormulaOpen(false)}>Cancel</Button>
                <Button leftSection={<IconLock size={14} />} onClick={() => {
                  if (formulaPassphrase === 'FIRECURTAIN') {
                    setFormulaUnlocked(true);
                    setFormulaPassError(false);
                    productionPackApi.getFormulaConfig().then(cfg => setFormulaConfig(cfg as typeof DEFAULT_FORMULA_CONFIG)).catch(() => {});
                  } else {
                    setFormulaPassError(true);
                  }
                }}>Unlock</Button>
              </Group>
            </Stack>
          ) : (
            <Stack gap="md">
              <Alert color="yellow" icon={<IconAlertCircle size={14} />} variant="light">
                Warning: Changing these values will affect all future cutting list calculations. Existing packs are unaffected.
              </Alert>
              <Text size="sm" c="dimmed">These values are locked in production. Changes require admin code authorisation.</Text>
              <Divider label="NECO DC80 Constants" labelPosition="left" />
              {([
                ['dc80_side_channel_deduction_mm', 'DC80 Side Channel Deduction (mm)'],
                ['dc80_header_allowance_mm', 'DC80 Header Allowance (mm)'],
                ['dc80_bottom_bar_deduction_mm', 'DC80 Bottom Bar Deduction (mm)'],
              ] as [keyof typeof DEFAULT_FORMULA_CONFIG, string][]).map(([key, label]) => (
                <NumberInput key={key} label={label} value={formulaConfig[key]}
                  onChange={v => setFormulaConfig(prev => ({ ...prev, [key]: typeof v === 'number' ? v : prev[key] }))} />
              ))}
              <Divider label="CSV Constants" labelPosition="left" />
              {([
                ['csv_side_channel_deduction_mm', 'CSV Side Channel Deduction (mm)'],
                ['csv_header_allowance_mm', 'CSV Header Allowance (mm)'],
                ['csv_bottom_bar_deduction_mm', 'CSV Bottom Bar Deduction (mm)'],
              ] as [keyof typeof DEFAULT_FORMULA_CONFIG, string][]).map(([key, label]) => (
                <NumberInput key={key} label={label} value={formulaConfig[key]}
                  onChange={v => setFormulaConfig(prev => ({ ...prev, [key]: typeof v === 'number' ? v : prev[key] }))} />
              ))}
              <Group justify="space-between">
                <Button variant="subtle" leftSection={<IconLock size={14} />}
                  onClick={() => setFormulaUnlocked(false)}>Lock &amp; Close</Button>
                <Button loading={formulaSaving} onClick={async () => {
                  setFormulaSaving(true);
                  try { await productionPackApi.updateFormulaConfig(formulaConfig); }
                  finally { setFormulaSaving(false); }
                }}>Save Formula Config</Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Send to Stage 5 confirm */}
        <Modal opened={sendConfirmOpen} onClose={() => setSendConfirmOpen(false)} title="Send to Manufacturing">
          <Stack gap="sm">
            <Text>This will create a manufacturing job for {pack.systems.length} system(s) and transition to Stage 5A — Stock Check &amp; Reservation.</Text>
            <Text size="sm" c="dimmed">This action cannot be undone.</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setSendConfirmOpen(false)}>Cancel</Button>
              <Button color="green" loading={sending} onClick={sendToStage5}>Confirm — Send to Stage 5A</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
