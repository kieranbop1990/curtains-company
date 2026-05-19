import { useState } from 'react';
import {
  Button,
  Tooltip,
  Modal,
  Stack,
  Textarea,
  Text,
  Badge,
  Group,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconShieldCheck } from '@tabler/icons-react';

export type GateCategory = 'fields' | 'documents' | 'approvals' | 'financial' | 'assignment';

export type GateCheck = {
  label: string;
  passed: boolean;
  category: GateCategory;
};

export type GateResult = {
  canAdvance: boolean;
  blockers: GateCheck[];
  all: GateCheck[];
};

export type AdminOverride = {
  adminId: string;
  adminName: string;
  reason: string;
  overriddenGates: string[];
};

export function evaluateGate(checks: GateCheck[]): GateResult {
  const blockers = checks.filter((c) => !c.passed);
  return { canAdvance: blockers.length === 0, blockers, all: checks };
}

const CATEGORY_LABELS: Record<GateCategory, string> = {
  fields: 'Required Fields',
  documents: 'Documents',
  approvals: 'Approvals',
  financial: 'Financial',
  assignment: 'Assignment',
};

interface StageGateButtonProps {
  checks: GateCheck[];
  nextStageLabel: string;
  isAdmin?: boolean;
  onAdvance: () => void | Promise<void>;
  onAdminOverride?: (override: Omit<AdminOverride, 'adminId' | 'adminName'>) => void | Promise<void>;
  loading?: boolean;
}

export function StageGateButton({
  checks,
  nextStageLabel,
  isAdmin = false,
  onAdvance,
  onAdminOverride,
  loading = false,
}: StageGateButtonProps) {
  const result = evaluateGate(checks);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const blockersByCategory = result.blockers.reduce<Partial<Record<GateCategory, string[]>>>(
    (acc, b) => {
      if (!acc[b.category]) acc[b.category] = [];
      acc[b.category]!.push(b.label);
      return acc;
    },
    {}
  );

  const tooltipContent = result.canAdvance ? '' : (
    Object.entries(blockersByCategory)
      .map(([cat, labels]) => `${CATEGORY_LABELS[cat as GateCategory]}: ${labels!.join(', ')}`)
      .join(' | ')
  );

  async function handleOverrideSubmit() {
    if (!overrideReason.trim()) return;
    setSubmitting(true);
    try {
      await onAdminOverride?.({
        reason: overrideReason.trim(),
        overriddenGates: result.blockers.map((b) => b.label),
      });
      setOverrideOpen(false);
      setOverrideReason('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack gap="sm">
        {!result.canAdvance && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            variant="light"
            title="Cannot advance — unmet requirements"
          >
            <Stack gap={4}>
              {Object.entries(blockersByCategory).map(([cat, labels]) => (
                <div key={cat}>
                  <Text size="xs" fw={600} c="orange.8">{CATEGORY_LABELS[cat as GateCategory]}</Text>
                  {labels!.map((l) => (
                    <Text key={l} size="xs" c="dimmed">• {l}</Text>
                  ))}
                </div>
              ))}
            </Stack>
          </Alert>
        )}

        <Group gap="sm">
          <Tooltip
            label={tooltipContent}
            disabled={result.canAdvance}
            multiline
            maw={320}
            withArrow
          >
            <Button
              size="lg"
              color="blue"
              fullWidth={!isAdmin || result.canAdvance}
              flex={isAdmin && !result.canAdvance ? 1 : undefined}
              disabled={!result.canAdvance}
              loading={loading}
              rightSection={<IconArrowRight size={18} />}
              onClick={onAdvance}
            >
              Send to {nextStageLabel}
            </Button>
          </Tooltip>

          {isAdmin && !result.canAdvance && onAdminOverride && (
            <Button
              size="lg"
              color="red"
              variant="outline"
              leftSection={<IconShieldCheck size={18} />}
              onClick={() => setOverrideOpen(true)}
            >
              Admin Override
            </Button>
          )}
        </Group>
      </Stack>

      <Modal
        opened={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title={
          <Group gap="xs">
            <IconShieldCheck size={18} color="red" />
            <Text fw={600}>Admin Override — {nextStageLabel}</Text>
          </Group>
        }
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            You are bypassing {result.blockers.length} unmet gate{result.blockers.length !== 1 ? 's' : ''}.
            This action will be recorded in the audit log.
          </Alert>

          <Stack gap={4}>
            <Text size="sm" fw={500}>Gates being overridden:</Text>
            {result.blockers.map((b) => (
              <Badge key={b.label} color="red" variant="light" size="sm">{b.label}</Badge>
            ))}
          </Stack>

          <Textarea
            label="Override reason (required)"
            placeholder="Explain why this gate is being bypassed..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.currentTarget.value)}
            minRows={3}
            required
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setOverrideOpen(false)}>Cancel</Button>
            <Button
              color="red"
              disabled={!overrideReason.trim()}
              loading={submitting}
              onClick={handleOverrideSubmit}
            >
              Override & Advance
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
