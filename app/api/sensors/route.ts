import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.sensor, { readings: { orderBy: { timestamp: 'desc' as const }, take: 50 } });
export const POST = createPostHandler(prisma.sensor);
