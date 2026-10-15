import { createPutHandler, createDeleteHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const PUT = createPutHandler(prisma.sensor);
export const DELETE = createDeleteHandler(prisma.sensor);
