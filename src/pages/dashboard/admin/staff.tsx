import { useEffect, useState } from 'react';
import {
  Container, Title, Stack, Group, Button, Table, Badge, TextInput,
  Select, Modal, Switch, Alert, Center, Loader, Text, ActionIcon, Tooltip,
} from '@mantine/core';
import { IconPlus, IconEdit, IconUserOff, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { staffApi } from 'src/api/staff';
import type { StaffMember } from 'src/types/staff';
import { STAFF_ROLES, ROLE_LABELS } from 'src/types/staff';

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'red',
  OFFICE_OPERATIONS: 'blue',
  ENGINEER_FIELD: 'green',
  FINANCE_ACCOUNTS: 'yellow',
  PRODUCTION: 'violet',
};

interface FormState {
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
}

const EMPTY_FORM: FormState = { name: '', role: '', email: '', phone: '', active: true };

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async (activeOnly: boolean) => {
    setLoading(true);
    setError(null);
    try {
      setStaff(await staffApi.getAll(!activeOnly));
    } catch {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(showInactive); }, [showInactive]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (m: StaffMember) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, email: m.email ?? '', phone: m.phone ?? '', active: m.active });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.role) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await staffApi.update(editing.id, {
          name: form.name, role: form.role,
          email: form.email || undefined, phone: form.phone || undefined,
          active: form.active,
        });
        setStaff(s => s.map(m => m.id === updated.id ? updated : m));
        notifications.show({ message: 'Staff member updated', color: 'green' });
      } else {
        const created = await staffApi.create({
          name: form.name, role: form.role,
          email: form.email || undefined, phone: form.phone || undefined,
        });
        setStaff(s => [...s, created]);
        notifications.show({ message: 'Staff member added', color: 'green' });
      }
      setModalOpen(false);
    } catch {
      notifications.show({ message: 'Failed to save', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (m: StaffMember) => {
    try {
      await staffApi.deactivate(m.id);
      setStaff(s => s.filter(x => x.id !== m.id));
      notifications.show({ message: `${m.name} deactivated`, color: 'orange' });
    } catch {
      notifications.show({ message: 'Failed to deactivate', color: 'red' });
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2} fw={700}>Staff Directory</Title>
          <Group>
            <Switch
              label="Show inactive"
              checked={showInactive}
              onChange={e => { const v = e.currentTarget.checked; setShowInactive(v); }}
            />
            <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
              Add Staff Member
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">{error}</Alert>
        )}

        {loading ? (
          <Center py="xl"><Loader /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Phone</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {staff.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="md">No staff members found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : staff.map(m => (
                <Table.Tr key={m.id}>
                  <Table.Td fw={500}>{m.name}</Table.Td>
                  <Table.Td>
                    <Badge color={ROLE_COLOR[m.role] ?? 'gray'} variant="light">
                      {ROLE_LABELS[m.role] ?? m.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{m.email ?? '—'}</Table.Td>
                  <Table.Td>{m.phone ?? '—'}</Table.Td>
                  <Table.Td>
                    <Badge color={m.active ? 'green' : 'gray'} variant="dot">
                      {m.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Tooltip label="Edit">
                        <ActionIcon variant="subtle" onClick={() => openEdit(m)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      {m.active && (
                        <Tooltip label="Deactivate">
                          <ActionIcon variant="subtle" color="red" onClick={() => deactivate(m)}>
                            <IconUserOff size={16} />
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
        title={editing ? 'Edit Staff Member' : 'Add Staff Member'}
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
            label="Role"
            required
            data={STAFF_ROLES.map(r => ({ value: r.value, label: r.label }))}
            value={form.role || null}
            onChange={v => setForm(f => ({ ...f, role: v ?? '' }))}
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, email: v })); }}
          />
          <TextInput
            label="Phone"
            value={form.phone}
            onChange={e => { const v = e.currentTarget.value; setForm(f => ({ ...f, phone: v })); }}
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
            <Button onClick={save} loading={saving} disabled={!form.name.trim() || !form.role}>
              {editing ? 'Save Changes' : 'Add Member'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
