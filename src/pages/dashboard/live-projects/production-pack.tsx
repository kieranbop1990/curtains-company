import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, Text, Badge,
  NumberInput, Select, Textarea, Switch, Center, Loader, Alert,
  Table, ActionIcon, Tabs, Divider, Progress, ThemeIcon, Modal, TextInput,
} from '@mantine/core';
import { IconArrowLeft, IconPlus, IconTrash, IconAlertCircle, IconChevronLeft, IconChevronRight, IconSend, IconDownload } from '@tabler/icons-react';
import { productionPackApi } from 'src/api/production-pack';
import type { ProductionPack, ProductionSystem, SystemFamily, CuttingListItem } from 'src/types/production-pack';

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
    { value: 'CSV-SINGLE', label: 'Single barrel' },
    { value: 'CSV-DOUBLE', label: 'Double/Multiple barrel' },
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
            <Button
              color="green"
              disabled={!canSendToStage5}
              leftSection={<IconSend size={16} />}
              onClick={() => setSendConfirmOpen(true)}>
              Send to Stage 5A — Stock Check &amp; Reservation
            </Button>
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
