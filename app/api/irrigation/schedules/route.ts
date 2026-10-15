import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.irrigationSchedule, { greenhouse: true, crop: true });
export const POST = createPostHandler(prisma.irrigationSchedule);
