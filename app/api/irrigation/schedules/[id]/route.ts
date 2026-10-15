import { createPutHandler, createDeleteHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const PUT = createPutHandler(prisma.irrigationSchedule);
export const DELETE = createDeleteHandler(prisma.irrigationSchedule);
