'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sprout, Plus, Edit2, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, GROWTH_STAGES, CROP_STATUS, type Crop, type Greenhouse } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, Modal, ConfirmDialog, EmptyState, LoadingGrid, Field, inputClass } from '@/components/admin/GreenhouseUI';

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    greenhouseId: '', name: '', variety: '', plantDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '', plantCount: 0, area: 0, growthStage: 'SEEDLING', status: 'ACTIVE', notes: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cropData, ghData] = await Promise.all([
        apiGet<Crop[]>('/crops'),
        apiGet<Greenhouse[]>('/greenhouse'),
      ]);
      setCrops(cropData);
      setGreenhouses(ghData);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ greenhouseId: greenhouses[0]?.id || '', name: '', variety: '', plantDate: new Date().toISOString().split('T')[0], expectedHarvestDate: '', plantCount: 0, area: 0, growthStage: 'SEEDLING', status: 'ACTIVE', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (crop: Crop) => {
    setEditingId(crop.id);
    setForm({
      greenhouseId: crop.greenhouseId, name: crop.name, variety: crop.variety || '',
      plantDate: crop.plantDate.split('T')[0], expectedHarvestDate: crop.expectedHarvestDate?.split('T')[0] || '',
      plantCount: crop.plantCount, area: crop.area, growthStage: crop.growthStage, status: crop.status, notes: crop.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      plantDate: new Date(form.plantDate),
      expectedHarvestDate: form.expectedHarvestDate ? new Date(form.expectedHarvestDate) : null,
      plantCount: Number(form.plantCount),
      area: Number(form.area),
    };
    if (editingId) {
      await apiPut(`/crops/${editingId}`, payload);
    } else {
      await apiPost('/crops', payload);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiDelete(`/crops/${deleteId}`);
    setDeleteId(null);
    load();
  };

  const stageColors: Record<string, string> = { SEEDLING: 'blue', VEGETATIVE: 'green', FLOWERING: 'purple', FRUITING: 'yellow', HARVEST_READY: 'green', HARVESTED: 'gray' };

  return (
    <div>
      <PageHeader
        title="مدیریت محصولات کشت"
        subtitle="مدیریت چرخه کاشت تا برداشت محصولات"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">
            <Plus className="h-4 w-4" /> محصول جدید
          </button>
        }
      />

      {loading ? <LoadingGrid /> : crops.length === 0 ? (
        <SectionCard><EmptyState title="محصولی ثبت نشده است" message="برای شروع یک محصول جدید ایجاد کنید" icon={Sprout} /></SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {crops.map(crop => (
            <SectionCard key={crop.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#20251F]">{crop.name}</h3>
                  {crop.variety && <p className="text-sm text-[#687067]">{crop.variety}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(crop)} className="rounded p-1.5 text-[#687067] hover:bg-[#F7F5EC]"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(crop.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#687067]">تاریخ کاشت:</span><span className="text-[#20251F]">{new Date(crop.plantDate).toLocaleDateString('fa-IR')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#687067]">تعداد گیاه:</span><span className="text-[#20251F]">{crop.plantCount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#687067]">مساحت:</span><span className="text-[#20251F]">{crop.area} م²</span></div>
                {crop.expectedHarvestDate && <div className="flex justify-between text-sm"><span className="text-[#687067]">برداشت تقریبی:</span><span className="text-[#20251F]">{new Date(crop.expectedHarvestDate).toLocaleDateString('fa-IR')}</span></div>}
              </div>
              <div className="mt-3 flex gap-2">
                <Badge color={stageColors[crop.growthStage] || 'gray'}>{GROWTH_STAGES[crop.growthStage]}</Badge>
                <Badge color={crop.status === 'ACTIVE' ? 'green' : 'gray'}>{CROP_STATUS[crop.status]}</Badge>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'ویرایش محصول' : 'محصول جدید'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="نام محصول" required>
              <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="رقم/واریته">
              <input className={inputClass} value={form.variety} onChange={e => setForm({ ...form, variety: e.target.value })} />
            </Field>
            <Field label="گلخانه" required>
              <select className={inputClass} value={form.greenhouseId} onChange={e => setForm({ ...form, greenhouseId: e.target.value })} required>
                <option value="">انتخاب کنید</option>
                {greenhouses.map(gh => <option key={gh.id} value={gh.id}>{gh.name}</option>)}
              </select>
            </Field>
            <Field label="تاریخ کاشت" required>
              <input type="date" className={inputClass} value={form.plantDate} onChange={e => setForm({ ...form, plantDate: e.target.value })} required />
            </Field>
            <Field label="تاریخ برداشت تقریبی">
              <input type="date" className={inputClass} value={form.expectedHarvestDate} onChange={e => setForm({ ...form, expectedHarvestDate: e.target.value })} />
            </Field>
            <Field label="تعداد گیاه">
              <input type="number" className={inputClass} value={form.plantCount} onChange={e => setForm({ ...form, plantCount: Number(e.target.value) })} />
            </Field>
            <Field label="مساحت (متر مربع)">
              <input type="number" step="0.1" className={inputClass} value={form.area} onChange={e => setForm({ ...form, area: Number(e.target.value) })} />
            </Field>
            <Field label="مرحله رشد">
              <select className={inputClass} value={form.growthStage} onChange={e => setForm({ ...form, growthStage: e.target.value })}>
                {Object.entries(GROWTH_STAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="وضعیت">
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {Object.entries(CROP_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="یادداشت">
            <textarea className={inputClass} rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ذخیره</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف محصول" message="آیا از حذف این محصول مطمئن هستید؟" />
    </div>
  );
}
