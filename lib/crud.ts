import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type PrismaModel = any;

export function createListHandler(model: PrismaModel, include?: any) {
  return async (req: NextRequest) => {
    try {
      const items = await (model as any).findMany({
        include,
        orderBy: { createdAt: 'desc' as const },
      });
      return NextResponse.json(items);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}

export function createPostHandler(model: PrismaModel) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const item = await (model as any).create({ data: body });
      return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}

export function createGetByIdHandler(model: PrismaModel, include?: any) {
  return async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const item = await (model as any).findUnique({
        where: { id: params.id },
        include,
      });
      if (!item) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
      return NextResponse.json(item);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}

export function createPutHandler(model: PrismaModel) {
  return async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await req.json();
      const item = await (model as any).update({
        where: { id: params.id },
        data: body,
      });
      return NextResponse.json(item);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}

export function createDeleteHandler(model: PrismaModel) {
  return async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await (model as any).delete({ where: { id: params.id } });
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}
