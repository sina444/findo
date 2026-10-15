import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.plantScan, { crop: true });
export const POST = createPostHandler(prisma.plantScan);
