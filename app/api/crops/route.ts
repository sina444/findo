import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.crop, {
  greenhouse: true,
  irrigationLogs: { orderBy: { timestamp: 'desc' as const }, take: 10 },
  harvests: { orderBy: { date: 'desc' as const } },
  expenses: { orderBy: { date: 'desc' as const } },
});
export const POST = createPostHandler(prisma.crop);
