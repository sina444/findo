import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get('sensorId');
    const hours = parseInt(searchParams.get('hours') || '24');
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const readings = await prisma.sensorReading.findMany({
      where: {
        ...(sensorId ? { sensorId } : {}),
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
      take: 500,
    });
    return NextResponse.json(readings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reading = await prisma.sensorReading.create({ data: body });

    // Update sensor's last reading
    await prisma.sensor.update({
      where: { id: body.sensorId },
      data: {
        lastReading: body.value,
        lastReadingAt: new Date(),
        status: 'ONLINE',
      },
    });

    return NextResponse.json(reading, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
