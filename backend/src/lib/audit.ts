import { prisma } from './prisma.js';

export async function logStageTransition(params: {
  recordId: string;
  recordType: string;
  actorId: string;
  actorName: string;
  fromStage: string;
  toStage: string;
  method: 'NORMAL' | 'ADMIN_OVERRIDE';
  overrideReason?: string;
}) {
  return prisma.stageTransitionLog.create({
    data: {
      recordId: params.recordId,
      recordType: params.recordType,
      actorId: params.actorId,
      actorName: params.actorName,
      fromStage: params.fromStage,
      toStage: params.toStage,
      transitionMethod: params.method,
      overrideReason: params.overrideReason ?? null,
    },
  });
}

export async function getTransitionLog(recordId: string, recordType: string) {
  return prisma.stageTransitionLog.findMany({
    where: { recordId, recordType },
    orderBy: { createdAt: 'asc' },
  });
}
