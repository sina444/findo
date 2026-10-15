import { createPutHandler, createDeleteHandler } from '@/lib/crud';
import { prisma } from '@/lib/prisma';

export const PUT = createPutHandler(prisma.chatConversation);
export const DELETE = createDeleteHandler(prisma.chatConversation);
