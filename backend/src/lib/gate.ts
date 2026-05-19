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
  return {
    canAdvance: blockers.length === 0,
    blockers,
    all: checks,
  };
}

export function buildStageGateChecks(params: {
  mandatoryFieldsFilled: boolean;
  documentsUploaded: boolean;
  approvalsRecorded: boolean;
  financialStatusOk: boolean;
  responsiblePersonAssigned: boolean;
}): GateCheck[] {
  return [
    { label: 'All mandatory fields completed', passed: params.mandatoryFieldsFilled, category: 'fields' },
    { label: 'Required documents uploaded', passed: params.documentsUploaded, category: 'documents' },
    { label: 'Required approvals recorded', passed: params.approvalsRecorded, category: 'approvals' },
    { label: 'Financial status checked', passed: params.financialStatusOk, category: 'financial' },
    { label: 'Responsible person assigned', passed: params.responsiblePersonAssigned, category: 'assignment' },
  ];
}
