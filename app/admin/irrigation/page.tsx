'use client';

import { useEffect, useState, useCallback } from 'react';
import { Droplets, Plus, Trash2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiGet, apiPost, apiDelete, IRRIGATION_METHODS, type IrrigationSchedule, type IrrigationLog, type Greenhouse, type Crop } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, Modal, ConfirmDialog, EmptyState, LoadingGrid, Field, inputClass, StatCard } from '@/components/admin/GreenhouseUI';

export default function IrrigationPage() {
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [logs, setLogs] = useState<IrrigationLog[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [form, setForm] = useState({ greenhouseId: '', cropId: '', name: '', method: 'DRIP', frequency: 'DAILY', durationMin: 30, waterAmount: 100, active: true, notes: '' });
  const [logForm, setLogForm] = useState({ greenhouseId: '', cropId: '', method: 'DRIP', durationMin: 30, waterAmount: 100, notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sched, logData, gh, cr] = await Promise.all([
        apiGet<IrrigationSchedule[]>('/irrigation/schedules'),
        apiGet<IrrigationLog[]>('/irrigation/logs'),
        apiGet<Greenhouse[]>('/greenhouse'),
        apiGet<Crop[]>('/crops'),
      ]);
      setSchedules(sched); setLogs(logData); setGreenhouses(gh); setCrops(cr);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/irrigation/schedules', { ...form, cropId: form.cropId || null, durationMin: Number(form.durationMin), waterAmount: Number(form.waterAmount) });
    setModalOpen(false); load();
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/irrigation/logs', { ...logForm, cropId: logForm.cropId || null, durationMin: Number(logForm.durationMin), waterAmount: Number(logForm.waterAmount) });
    setLogModalOpen(false); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiDelete(`/irrigation/schedules/${deleteId}`);
    setDeleteId(null); load();
  };

  // Water usage chart data (last 7 days)
  const waterChartData = logs.slice(0, 7).reverse().map(log => ({
    date: new Date(log.timestamp).toLocaleDateString('fa-IR', { day: '2-digit', month: '2-digit' }),
    water: log.waterAmount,
  }));

  const totalWater = logs.reduce((sum, l) => sum + l.waterAmount, 0);

  return (
    <div>
      <PageHeader
        title="مدیریت آبیاری هوشمند"
        subtitle="برنامه‌ریزی و ثبت آبیاری، مدیریت مصرف آب"
        action={
          <div className="flex gap-2">
            <button onClick={() => setLogModalOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#3F6B45] px-4 py-2 text-sm font-medium text-[#3F6B45] hover:bg-[#E8F0E5]">
              <Calendar className="h-4 w-4" /> ثبت آبیاری
            </button>
            <button onClick={() => { setForm({ greenhouseId: greenhouses[0]?.id || '', cropId: '', name: '', method: 'DRIP', frequency: 'DAILY', durationMin: 30, waterAmount: 100, active: true, notes: '' }); setModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">
              <Plus className="h-4 w-4" /> برنامه جدید
            </button>
          </div>
        }
      />

      {loading ? <LoadingGrid /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="برنامه‌های فعال" value={schedules.filter(s => s.active).length} icon={Droplets} color="bg-[#3F6B45]" />
            <StatCard label="کل برنامه‌ها" value={schedules.length} icon={Calendar} color="bg-[#7FA77D]" />
            <StatCard label="کل مصرف آب" value={totalWater} unit="لیتر" icon={Droplets} color="bg-[#AFC8A8]" />
            <StatCard label="ثبت‌های اخیر" value={logs.length} icon={Calendar} color="bg-[#C9825A]" />
          </div>

          {waterChartData.length > 0 && (
            <SectionCard title="نمودار مصرف آب" className="mt-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={waterChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#687067" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#687067" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} name="مصرف آب (لیتر)" />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="برنامه‌های آبیاری">
              {schedules.length === 0 ? <EmptyState title="برنامه‌ای ثبت نشده است" icon={Droplets} /> : (
                <div className="space-y-2">
                  {schedules.map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#E8F0E5] p-3">
                      <div>
                        <p className="font-medium text-[#20251F]">{s.name}</p>
                        <p className="text-xs text-[#687067]">{IRRIGATION_METHODS[s.method]} • {s.frequency === 'DAILY' ? 'روزانه' : s.frequency === 'EVERY_2_DAYS' ? 'هر ۲ روز' : s.frequency === 'WEEKLY' ? 'هفتگی' : 'سفارشی'} • {s.durationMin} دقیقه • {s.waterAmount} لیتر</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={s.active ? 'green' : 'gray'}>{s.active ? 'فعال' : 'غیرفعال'}</Badge>
                        <button onClick={() => setDeleteId(s.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="تاریخچه آبیاری">
              {logs.length === 0 ? <EmptyState title="ثبتی وجود ندارد" icon={Calendar} /> : (
                <div className="space-y-2">
                  {logs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between rounded-lg border border-[#E8F0E5] p-3">
                      <div>
                        <p className="text-sm font-medium text-[#20251F]">{IRRIGATION_METHODS[log.method]}</p>
                        <p className="text-xs text-[#687067]">{log.durationMin} دقیقه • {log.waterAmount} لیتر</p>
                      </div>
                      <span className="text-xs text-[#687067]">{new Date(log.timestamp).toLocaleDateString('fa-IR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}

      {/* Schedule modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="برنامه آبیاری جدید">
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="نام برنامه" required><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="گلخانه" required>
              <select className={inputClass} value={form.greenhouseId} onChange={e => setForm({ ...form, greenhouseId: e.target.value })} required>
                <option value="">انتخاب</option>
                {greenhouses.map(gh => <option key={gh.id} value={gh.id}>{gh.name}</option>)}
              </select>
            </Field>
            <Field label="محصول (اختیاری)">
              <select className={inputClass} value={form.cropId} onChange={e => setForm({ ...form, cropId: e.target.value })}>
                <option value="">بدون محصول</option>
                {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="روش آبیاری">
              <select className={inputClass} value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                {Object.entries(IRRIGATION_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="فرکانس">
              <select className={inputClass} value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="DAILY">روزانه</option><option value="EVERY_2_DAYS">هر ۲ روز</option><option value="WEEKLY">هفتگی</option><option value="CUSTOM">سفارشی</option>
              </select>
            </Field>
            <Field label="مدت زمان (دقیقه)"><input type="number" className={inputClass} value={form.durationMin} onChange={e => setForm({ ...form, durationMin: Number(e.target.value) })} /></Field>
            <Field label="مقدار آب (لیتر)"><input type="number" className={inputClass} value={form.waterAmount} onChange={e => setForm({ ...form, waterAmount: Number(e.target.value) })} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ذخیره</button>
          </div>
        </form>
      </Modal>

      {/* Log modal */}
      <Modal open={logModalOpen} onClose={() => setLogModalOpen(false)} title="ثبت آبیاری">
        <form onSubmit={handleCreateLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="گلخانه" required>
              <select className={inputClass} value={logForm.greenhouseId} onChange={e => setLogForm({ ...logForm, greenhouseId: e.target.value })} required>
                <option value="">انتخاب</option>
                {greenhouses.map(gh => <option key={gh.id} value={gh.id}>{gh.name}</option>)}
              </select>
            </Field>
            <Field label="محصول (اختیاری)">
              <select className={inputClass} value={logForm.cropId} onChange={e => setLogForm({ ...logForm, cropId: e.target.value })}>
                <option value="">بدون محصول</option>
                {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="روش آبیاری">
              <select className={inputClass} value={logForm.method} onChange={e => setLogForm({ ...logForm, method: e.target.value })}>
                {Object.entries(IRRIGATION_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="مدت زمان (دقیقه)"><input type="number" className={inputClass} value={logForm.durationMin} onChange={e => setLogForm({ ...logForm, durationMin: Number(e.target.value) })} /></Field>
            <Field label="مقدار آب (لیتر)"><input type="number" className={inputClass} value={logForm.waterAmount} onChange={e => setLogForm({ ...logForm, waterAmount: Number(e.target.value) })} /></Field>
          </div>
          <Field label="یادداشت"><input className={inputClass} value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} /></Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setLogModalOpen(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ثبت</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف برنامه" message="آیا از حذف این برنامه آبیاری مطمئن هستید؟" />
    </div>
  );
}
