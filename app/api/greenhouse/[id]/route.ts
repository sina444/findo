import { createGetByIdHandler, createPutHandler, createDeleteHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

const include = {
  sensors: { include: { readings: { orderBy: { timestamp: 'desc' as const }, take: 50 } } },
  equipment: true,
  crops: true,
  irrigationSchedules: true,
  irrigationLogs: { orderBy: { timestamp: 'desc' as const }, take: 20 },
};

export const GET = createGetByIdHandler(prisma.greenhouse, include);
export const PUT = createPutHandler(prisma.greenhouse);
export const DELETE = createDeleteHandler(prisma.greenhouse);
