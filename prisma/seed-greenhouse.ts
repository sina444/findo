import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Seeding greenhouse data...');

  // Create a greenhouse
  const gh = await prisma.greenhouse.create({
    data: {
      name: 'گلخانه شماره ۱',
      location: 'تهران - لواسان',
      area: 500,
      description: 'گلخانه اصلی تولید گوجه‌فرنگی و خیار',
      active: true,
    },
  });

  // Create sensors
  const sensorTypes = [
    { name: 'حسگر دمای محیط', type: 'TEMPERATURE', unit: '°C', value: 24.5 },
    { name: 'حسگر رطوبت هوا', type: 'HUMIDITY', unit: '%', value: 65 },
    { name: 'حسگر نور', type: 'LIGHT', unit: 'lux', value: 12000 },
    { name: 'حسگر CO₂', type: 'CO2', unit: 'ppm', value: 420 },
    { name: 'حسگر رطوبت خاک', type: 'SOIL_MOISTURE', unit: '%', value: 45 },
    { name: 'حسگر اسیدیته خاک', type: 'SOIL_PH', unit: 'pH', value: 6.8 },
  ];

  const sensors = [];
  for (const s of sensorTypes) {
    const sensor = await prisma.sensor.create({
      data: {
        greenhouseId: gh.id,
        name: s.name,
        type: s.type,
        unit: s.unit,
        status: 'ONLINE',
        lastReading: s.value,
        lastReadingAt: new Date(),
      },
    });
    sensors.push(sensor);

    // Create 24 hours of readings
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * (s.value * 0.1);
      await prisma.sensorReading.create({
        data: {
          sensorId: sensor.id,
          value: Number((s.value + variation).toFixed(2)),
          timestamp,
        },
      });
    }
  }

  // Create equipment
  const equipment = [
    { name: 'فن تهویه شماره ۱', type: 'FAN', status: 'ONLINE' },
    { name: 'پمپ آب اصلی', type: 'PUMP', status: 'ONLINE' },
    { name: 'سیستم گرمایش', type: 'HEATER', status: 'OFFLINE' },
    { name: 'سیستم نورپردازی LED', type: 'LIGHT', status: 'ONLINE' },
    { name: 'سیستم سرمایش', type: 'COOLER', status: 'MAINTENANCE' },
  ];

  for (const eq of equipment) {
    await prisma.equipment.create({
      data: {
        greenhouseId: gh.id,
        name: eq.name,
        type: eq.type,
        status: eq.status,
        lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextService: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create crops
  const crop1 = await prisma.crop.create({
    data: {
      greenhouseId: gh.id,
      name: 'گوجه‌فرنگی',
      variety: 'صنایع',
      plantDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      plantCount: 200,
      area: 200,
      growthStage: 'FRUITING',
      status: 'ACTIVE',
      notes: 'وضعیت رشد مناسب',
    },
  });

  const crop2 = await prisma.crop.create({
    data: {
      greenhouseId: gh.id,
      name: 'خیار',
      variety: 'گلخانه‌ای',
      plantDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      expectedHarvestDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      plantCount: 150,
      area: 150,
      growthStage: 'FLOWERING',
      status: 'ACTIVE',
    },
  });

  // Create irrigation schedule
  await prisma.irrigationSchedule.create({
    data: {
      greenhouseId: gh.id,
      cropId: crop1.id,
      name: 'آبیاری صبح گوجه‌فرنگی',
      method: 'DRIP',
      frequency: 'DAILY',
      durationMin: 30,
      waterAmount: 200,
      active: true,
    },
  });

  await prisma.irrigationSchedule.create({
    data: {
      greenhouseId: gh.id,
      cropId: crop2.id,
      name: 'آبیاری عصر خیار',
      method: 'DRIP',
      frequency: 'EVERY_2_DAYS',
      durationMin: 25,
      waterAmount: 150,
      active: true,
    },
  });

  // Create irrigation logs (last 7 days)
  for (let i = 6; i >= 0; i--) {
    await prisma.irrigationLog.create({
      data: {
        greenhouseId: gh.id,
        cropId: i % 2 === 0 ? crop1.id : crop2.id,
        method: 'DRIP',
        durationMin: 25 + Math.floor(Math.random() * 10),
        waterAmount: 150 + Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create expenses
  const expenses = [
    { category: 'SEED', description: 'خرید بذر گوجه‌فرنگی', amount: 500000 },
    { category: 'FERTILIZER', description: 'کود کامل', amount: 1200000 },
    { category: 'WATER', description: 'قبض آب ماهانه', amount: 800000 },
    { category: 'ELECTRICITY', description: 'قبض برق ماهانه', amount: 1500000 },
    { category: 'LABOR', description: 'دستمزد کارگر', amount: 3000000 },
    { category: 'EQUIPMENT', description: 'خرید پمپ آب', amount: 2500000 },
    { category: 'REPAIR', description: 'تعمیر فن', amount: 400000 },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        ...exp,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        cropId: Math.random() > 0.5 ? crop1.id : crop2.id,
      },
    });
  }

  // Create harvests
  await prisma.harvest.create({
    data: { cropId: crop1.id, amount: 50, quality: 'GOOD', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  await prisma.harvest.create({
    data: { cropId: crop2.id, amount: 30, quality: 'EXCELLENT', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  });

  // Create alerts
  await prisma.alert.create({
    data: { type: 'HIGH_TEMP', severity: 'WARNING', message: 'دمای محیط بالاتر از حد مجاز است (۳۲°C)', source: 'sensor-1' },
  });
  await prisma.alert.create({
    data: { type: 'SENSOR_OFFLINE', severity: 'CRITICAL', message: 'سیستم گرمایش آفلاین است', source: 'equipment-3' },
  });
  await prisma.alert.create({
    data: { type: 'IRRIGATION_DUE', severity: 'INFO', message: 'زمان آبیاری خیار فرا رسیده است', source: 'schedule-2' },
  });

  // Create workers
  await prisma.worker.create({ data: { name: 'علی محمدی', role: 'GREENHOUSE_MANAGER', phone: '09123456789', email: 'ali@example.com', active: true } });
  await prisma.worker.create({ data: { name: 'حسن رضایی', role: 'AGRONOMIST', phone: '09123456790', active: true } });
  await prisma.worker.create({ data: { name: 'رضا کریمی', role: 'WORKER', phone: '09123456791', active: true } });

  // Create tasks
  await prisma.task.create({ data: { title: 'بررسی حسگرها', description: 'تمام حسگرها را چک کنید', assignedTo: 'حسن رضایی', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  await prisma.task.create({ data: { title: 'آبیاری گوجه‌فرنگی', assignedTo: 'رضا کریمی', status: 'PENDING', priority: 'MEDIUM', dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000) } });
  await prisma.task.create({ data: { title: 'نظافت گلخانه', assignedTo: 'علی محمدی', status: 'COMPLETED', priority: 'LOW', completedAt: new Date() } });

  console.log('✅ Greenhouse data seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
