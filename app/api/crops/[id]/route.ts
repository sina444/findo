import { createGetByIdHandler, createPutHandler, createDeleteHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

const include = {
  greenhouse: true,
  irrigationLogs: { orderBy: { timestamp: 'desc' as const }, take: 20 },
  harvests: { orderBy: { date: 'desc' as const } },
  expenses: { orderBy: { date: 'desc' as const } },
};

export const GET = createGetByIdHandler(prisma.crop, include);
export const PUT = createPutHandler(prisma.crop);
export const DELETE = createDeleteHandler(prisma.crop);
