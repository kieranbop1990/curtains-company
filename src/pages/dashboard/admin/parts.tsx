import { useEffect, useState } from 'react';
import {
  Container, Title, Stack, Group, Button, Table, Badge, TextInput,
  Select, Modal, Switch, Alert, Center, Loader, Text, ActionIcon, Tooltip,
  NumberInput, Textarea, Paper,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { partsApi } from 'src/api/parts';
import type { Part } from 'src/types/parts';
import { PART_CATEGORIES, CATEGORY_COLORS } from 'src/types/parts';

interface FormState {
  name: string;
  category: string;
  description: string;
  unitCost: number | '';
  unit: string;
  supplier: string;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  name: '', category: '', description: '', unitCost: '', unit: '', supplier: '', active: true,
};

function fmt(n?: number) {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PartsLibraryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setParts(await partsApi.getAll(!showInactive));
    } catch {
      setError('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showInactive]);

  const filtered = parts.filter(p => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) ||
        p.partRef.toLowerCase().includes(q) ||
        (p.supplier ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p: Part) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category,
      description: p.description ?? '',
      unitCost: p.unitCost ?? '',
      unit: p.unit ?? '',
      supplier: p.supplier ?? '',
      active: p.active,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.category) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description || undefined,
        unitCost: form.unitCost !== '' ? Number(form.unitCost) : undefined,
        unit: form.unit || undefined,
        supplier: form.supplier || undefined,
        active: form.active,
      };
      if (editing) {
        const updated = await partsApi.update(editing.id, payload);
        setParts(ps => ps.map(p => p.id === updated.id ? updated : p));
        notifications.show({ message: 'Part updated', color: 'green' });
      } else {
        const created = await partsApi.create(payload);
        setParts(ps => [...ps, created]);
        notifications.show({ message: `Part ${created.partRef} added`, color: 'green' });
      }
      setModalOpen(false);
    } catch {
      notifications.show({ message: 'Failed to save part', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (p: Part) => {
    try {
      await partsApi.deactivate(p.id);
      setParts(ps => ps.filter(x => x.id !== p.id));
      notifications.show({ message: `${p.name} deactivated`, color: 'orange' });
    } catch {
      notifications.show({ message: 'Failed to deactivate part', color: 'red' });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2} fw={700}>Parts Library</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add Part
          </Button>
        </Group>

        <Paper withBorder p="sm" radius="md">
          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder="Search name, ref, supplier…"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={e => { const v = e.currentTarget.value; setSearch(v); }}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Select
              placeholder="All categories"
              clearable
              data={PART_CATEGORIES.map(c => ({ value: c, label: c }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ minWidth: 180 }}
            />
            <Switch
              label="Show inactive"
              checked={showInactive}
              onChange={e => { const v = e.currentTarget.checked; setShowInactive(v); }}
            />
          </Group>
        </Paper>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">{error}</Alert>
        )}

        {loading ? (
          <Center py="xl"><Loader /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Ref</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Unit Cost</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Supplier</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center" c="dimmed" py="md">No parts found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filtered.map(p => (
                <Table.Tr key={p.id}>
                  <Table.Td><Text size="sm" c="dimmed">{p.partRef}</Text></Table.Td>
                  <Table.Td fw={500}>{p.name}</Table.Td>
                  <Table.Td>
                    <Badge color={CATEGORY_COLORS[p.category] ?? 'gray'} variant="light">
                      {p.category}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>{p.description ?? '—'}</Text>
                  </Table.Td>
                  <Table.Td>{fmt(p.unitCost)}</Table.Td>
                  <Table.Td>{p.unit ?? '—'}</Table.Td>
                  <Table.Td>{p.supplier ?? '—'}</Table.Td>
                  <Table.Td>
                    <Badge color={p.active ? 'green' : 'gray'} variant="dot">
                      {p.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Tooltip label="Edit">
                        <ActionIcon variant="subtle" onClick={() => openEdit(p)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      {p.active && (
                        <Tooltip label="Deactivate">
                          <ActionIcon variant="subtle" color="red" onClick={() => deactivate(p)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Part — ${editing.partRef}` : 'Add Part'}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            required
            value={form.name}
            onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, name: v })); }}
          />
          <Select
            label="Category"
            required
            data={PART_CATEGORIES.map(c => ({ value: c, label: c }))}
            value={form.category || null}
            onChange={v => setForm(f => ({ ...f, category: v ?? '' }))}
          />
          <Textarea
            label="Description"
            autosize
            minRows={2}
            value={form.description}
            onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, description: v })); }}
          />
          <Group grow>
            <NumberInput
              label="Unit Cost (£)"
              prefix="£"
              decimalScale={2}
              min={0}
              value={form.unitCost}
              onChange={v => setForm(f => ({ ...f, unitCost: typeof v === 'number' ? v : '' }))}
            />
            <TextInput
              label="Unit"
              placeholder="each / metre / set"
              value={form.unit}
              onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, unit: v })); }}
            />
          </Group>
          <TextInput
            label="Supplier"
            value={form.supplier}
            onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, supplier: v })); }}
          />
          {editing && (
            <Switch
              label="Active"
              checked={form.active}
              onChange={e => { const v = e.currentTarget.checked; setForm(f => ({ ...f, active: v })); }}
            />
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!form.name.trim() || !form.category}>
              {editing ? 'Save Changes' : 'Add Part'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
