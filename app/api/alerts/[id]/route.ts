import { createPutHandler, createDeleteHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const PUT = createPutHandler(prisma.alert);
export const DELETE = createDeleteHandler(prisma.alert);
