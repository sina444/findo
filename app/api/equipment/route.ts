import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.equipment, { greenhouse: true });
export const POST = createPostHandler(prisma.equipment);
