import { createListHandler, createPostHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const GET = createListHandler(prisma.alert);
export const POST = createPostHandler(prisma.alert);
