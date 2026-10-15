'use client';

import { useEffect, useState, useCallback } from 'react';
import { Cpu, Plus, Edit2, Trash2, Wrench } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, EQUIPMENT_TYPES, type Equipment, type Greenhouse } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, Modal, ConfirmDialog, EmptyState, LoadingGrid, Field, inputClass, StatCard, StatusDot } from '@/components/admin/GreenhouseUI';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ greenhouseId: '', name: '', type: 'FAN', status: 'OFFLINE', notes: '', lastService: '', nextService: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eq, gh] = await Promise.all([apiGet<Equipment[]>('/equipment'), apiGet<Greenhouse[]>('/greenhouse')]);
      setEquipment(eq); setGreenhouses(gh);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ greenhouseId: greenhouses[0]?.id || '', name: '', type: 'FAN', status: 'OFFLINE', notes: '', lastService: '', nextService: '' });
    setModalOpen(true);
  };

  const openEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setForm({
      greenhouseId: eq.greenhouseId, name: eq.name, type: eq.type, status: eq.status, notes: eq.notes || '',
      lastService: eq.lastService?.split('T')[0] || '', nextService: eq.nextService?.split('T')[0] || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      lastService: form.lastService ? new Date(form.lastService) : null,
      nextService: form.nextService ? new Date(form.nextService) : null,
    };
    if (editingId) await apiPut(`/equipment/${editingId}`, payload);
    else await apiPost('/equipment', payload);
    setModalOpen(false); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiDelete(`/equipment/${deleteId}`);
    setDeleteId(null); load();
  };

  const statusCounts = equipment.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div>
      <PageHeader
        title="تجهیزات و اینترنت اشیا"
        subtitle="مدیریت حسگرها، پمپ‌ها، فن‌ها و تجهیزات گلخانه"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">
            <Plus className="h-4 w-4" /> تجهیز جدید
          </button>
        }
      />

      {loading ? <LoadingGrid /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="کل تجهیزات" value={equipment.length} icon={Cpu} color="bg-[#3F6B45]" />
            <StatCard label="آنلاین" value={statusCounts.ONLINE || 0} icon={Cpu} color="bg-green-500" />
            <StatCard label="آفلاین" value={statusCounts.OFFLINE || 0} icon={Cpu} color="bg-gray-400" />
            <StatCard label="نیازمند تعمیر" value={(statusCounts.MAINTENANCE || 0) + (statusCounts.ERROR || 0)} icon={Wrench} color="bg-amber-500" />
          </div>

          {equipment.length === 0 ? (
            <SectionCard className="mt-6"><EmptyState title="تجهیزی ثبت نشده است" message="حسگرها، پمپ‌ها و سایر تجهیزات را اینجا مدیریت کنید" icon={Cpu} /></SectionCard>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipment.map(eq => (
                <SectionCard key={eq.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot status={eq.status} />
                      <div>
                        <h3 className="font-bold text-[#20251F]">{eq.name}</h3>
                        <p className="text-xs text-[#687067]">{EQUIPMENT_TYPES[eq.type] || eq.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(eq)} className="rounded p-1.5 text-[#687067] hover:bg-[#F7F5EC]"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(eq.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge color={eq.status === 'ONLINE' ? 'green' : eq.status === 'OFFLINE' ? 'gray' : eq.status === 'MAINTENANCE' ? 'yellow' : 'red'}>
                      {eq.status === 'ONLINE' ? 'آنلاین' : eq.status === 'OFFLINE' ? 'آفلاین' : eq.status === 'MAINTENANCE' ? 'در تعمیر' : 'خطا'}
                    </Badge>
                  </div>
                  {eq.nextService && <p className="mt-2 text-xs text-[#687067]">سرویس بعدی: {new Date(eq.nextService).toLocaleDateString('fa-IR')}</p>}
                </SectionCard>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'ویرایش تجهیز' : 'تجهیز جدید'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="نام تجهیز" required><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="گلخانه" required>
              <select className={inputClass} value={form.greenhouseId} onChange={e => setForm({ ...form, greenhouseId: e.target.value })} required>
                <option value="">انتخاب</option>
                {greenhouses.map(gh => <option key={gh.id} value={gh.id}>{gh.name}</option>)}
              </select>
            </Field>
            <Field label="نوع تجهیز">
              <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {Object.entries(EQUIPMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="وضعیت">
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="ONLINE">آنلاین</option><option value="OFFLINE">آفلاین</option><option value="MAINTENANCE">در تعمیر</option><option value="ERROR">خطا</option>
              </select>
            </Field>
            <Field label="آخرین سرویس"><input type="date" className={inputClass} value={form.lastService} onChange={e => setForm({ ...form, lastService: e.target.value })} /></Field>
            <Field label="سرویس بعدی"><input type="date" className={inputClass} value={form.nextService} onChange={e => setForm({ ...form, nextService: e.target.value })} /></Field>
          </div>
          <Field label="یادداشت"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ذخیره</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف تجهیز" message="آیا از حذف این تجهیز مطمئن هستید؟" />
    </div>
  );
}
