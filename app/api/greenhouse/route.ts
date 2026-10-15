import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.greenhouse, {
  sensors: true,
  equipment: true,
  crops: true,
});

export const POST = createPostHandler(prisma.greenhouse);
