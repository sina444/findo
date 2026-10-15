'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileBarChart, Download, Sprout, Droplets, Wallet, Cpu, Users } from 'lucide-react';
import { apiGet, EXPENSE_CATEGORIES, type Expense, type Harvest, type Crop, type IrrigationLog, type Equipment, type Worker, type Task, type Alert } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, EmptyState, LoadingGrid, StatCard, Badge } from '@/components/admin/GreenhouseUI';

export default function ReportsPage() {
  const [data, setData] = useState<{ expenses: Expense[]; harvests: Harvest[]; crops: Crop[]; logs: IrrigationLog[]; equipment: Equipment[]; workers: Worker[]; tasks: Task[]; alerts: Alert[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [expenses, harvests, crops, logs, equipment, workers, tasks, alerts] = await Promise.all([
        apiGet<Expense[]>('/expenses'), apiGet<Harvest[]>('/harvests'), apiGet<Crop[]>('/crops'),
        apiGet<IrrigationLog[]>('/irrigation/logs'), apiGet<Equipment[]>('/equipment'),
        apiGet<Worker[]>('/workers'), apiGet<Task[]>('/tasks'), apiGet<Alert[]>('/alerts'),
      ]);
      setData({ expenses, harvests, crops, logs, equipment, workers, tasks, alerts });
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => window.print();

  if (loading) return <div><PageHeader title="گزارش‌گیری" /><LoadingGrid /></div>;
  if (!data) return <SectionCard><EmptyState title="داده‌ای برای نمایش وجود ندارد" icon={FileBarChart} /></SectionCard>;

  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalWater = data.logs.reduce((s, l) => s + l.waterAmount, 0);
  const activeCrops = data.crops.filter(c => c.status === 'ACTIVE');
  const onlineEquipment = data.equipment.filter(e => e.status === 'ONLINE');
  const completedTasks = data.tasks.filter(t => t.status === 'COMPLETED');
  const criticalAlerts = data.alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged);

  return (
    <div>
      <PageHeader title="گزارش‌گیری پیشرفته" subtitle="گزارش جامع وضعیت گلخانه" action={
        <button onClick={handlePrint} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">
          <Download className="h-4 w-4" /> چاپ گزارش
        </button>
      } />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="کل هزینه‌ها" value={totalExpenses.toLocaleString('fa-IR')} unit="تومان" icon={Wallet} color="bg-red-500" />
        <StatCard label="کل مصرف آب" value={totalWater.toLocaleString('fa-IR')} unit="لیتر" icon={Droplets} color="bg-blue-500" />
        <StatCard label="محصولات فعال" value={activeCrops.length} icon={Sprout} color="bg-[#3F6B45]" />
        <StatCard label="تجهیزات آنلاین" value={onlineEquipment.length} icon={Cpu} color="bg-[#7FA77D]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="کارکنان" value={data.workers.length} icon={Users} color="bg-[#AFC8A8]" />
        <StatCard label="وظایف تکمیل شده" value={completedTasks.length} icon={FileBarChart} color="bg-green-500" />
        <StatCard label="هشدارهای بحرانی" value={criticalAlerts.length} icon={FileBarChart} color="bg-red-500" />
        <StatCard label="کل برداشت‌ها" value={data.harvests.length} icon={Sprout} color="bg-[#C9825A]" />
      </div>

      {/* Expenses by category */}
      <SectionCard title="گزارش هزینه‌ها به تفکیک دسته" className="mt-6">
        {data.expenses.length === 0 ? <EmptyState title="هزینه‌ای ثبت نشده است" icon={Wallet} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#E8F0E5] text-[#687067]">
                <th className="py-2 pr-2 text-right">دسته</th><th className="py-2 text-right">تعداد</th><th className="py-2 text-right">مجموع</th>
              </tr></thead>
              <tbody>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => {
                  const items = data.expenses.filter(e => e.category === key);
                  if (items.length === 0) return null;
                  const sum = items.reduce((s, e) => s + e.amount, 0);
                  return (
                    <tr key={key} className="border-b border-[#E8F0E5]">
                      <td className="py-2 pr-2"><Badge color="blue">{label}</Badge></td>
                      <td className="py-2 text-[#20251F]">{items.length}</td>
                      <td className="py-2 font-medium text-[#20251F]">{sum.toLocaleString('fa-IR')} تومان</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Crop status report */}
      <SectionCard title="گزارش وضعیت محصولات" className="mt-6">
        {data.crops.length === 0 ? <EmptyState title="محصولی ثبت نشده است" icon={Sprout} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#E8F0E5] text-[#687067]">
                <th className="py-2 pr-2 text-right">نام</th><th className="py-2 text-right">مرحله</th><th className="py-2 text-right">وضعیت</th><th className="py-2 text-right">تاریخ کاشت</th>
              </tr></thead>
              <tbody>
                {data.crops.map(crop => (
                  <tr key={crop.id} className="border-b border-[#E8F0E5]">
                    <td className="py-2 pr-2 font-medium text-[#20251F]">{crop.name}</td>
                    <td className="py-2"><Badge color="green">{crop.growthStage === 'SEEDLING' ? 'پاجوش' : crop.growthStage === 'VEGETATIVE' ? 'رویشی' : crop.growthStage === 'FLOWERING' ? 'گلدهی' : crop.growthStage === 'FRUITING' ? 'میوه‌دهی' : crop.growthStage === 'HARVEST_READY' ? 'آماده برداشت' : 'برداشت شده'}</Badge></td>
                    <td className="py-2"><Badge color={crop.status === 'ACTIVE' ? 'green' : 'gray'}>{crop.status === 'ACTIVE' ? 'فعال' : crop.status === 'HARVESTED' ? 'برداشت شده' : 'ناموفق'}</Badge></td>
                    <td className="py-2 text-[#20251F]">{new Date(crop.plantDate).toLocaleDateString('fa-IR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Equipment report */}
      <SectionCard title="گزارش وضعیت تجهیزات" className="mt-6">
        {data.equipment.length === 0 ? <EmptyState title="تجهیزی ثبت نشده است" icon={Cpu} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#E8F0E5] text-[#687067]">
                <th className="py-2 pr-2 text-right">نام</th><th className="py-2 text-right">نوع</th><th className="py-2 text-right">وضعیت</th>
              </tr></thead>
              <tbody>
                {data.equipment.map(eq => (
                  <tr key={eq.id} className="border-b border-[#E8F0E5]">
                    <td className="py-2 pr-2 font-medium text-[#20251F]">{eq.name}</td>
                    <td className="py-2 text-[#687067]">{eq.type}</td>
                    <td className="py-2"><Badge color={eq.status === 'ONLINE' ? 'green' : eq.status === 'OFFLINE' ? 'gray' : 'yellow'}>{eq.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
