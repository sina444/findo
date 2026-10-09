'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/admin-api';

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  location: string;
  published: boolean;
}

const emptyT = { name: '', avatar: '', rating: 5, text: '', location: '', published: true };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<any>(emptyT);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try { setItems(await apiGet('/testimonials')); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => { setEditing(null); setForm(emptyT); setModalOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm(t); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, rating: String(form.rating) };
      if (editing) await apiPut(`/testimonials/${editing.id}`, payload);
      else await apiPost('/testimonials', payload);
      setModalOpen(false);
      loadData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این نظر مطمئن هستید؟')) return;
    await apiDelete(`/testimonials/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20251F]">نظرات مشتریان</h1>
          <p className="mt-1 text-sm text-[#687067]">{items.length} نظر</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52]">
          <Plus className="h-4 w-4" /> نظر جدید
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-white/60" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(t => (
            <div key={t.id} className="rounded-xl border border-[#E8F0E5] bg-white p-5">
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-[#20251F]">{t.name}</p>
                  <p className="text-xs text-[#687067]">{t.location}</p>
                </div>
                <div className="mr-auto flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-[#687067]">{t.text}</p>
              <div className="mt-3 flex items-center justify-between">
                {t.published
                  ? <span className="text-xs font-medium text-[#3F6B45]">منتشر شده</span>
                  : <span className="text-xs font-medium text-[#C9825A]">پیش‌نویس</span>}
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-lg bg-[#F7F5EC] px-3 py-1.5 text-xs text-[#687067] hover:bg-[#E8F0E5]">ویرایش</button>
                  <button onClick={() => handleDelete(t.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-500 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-12">
              <Star className="h-10 w-10 text-[#AFC8A8]" />
              <p className="mt-2 text-sm text-[#687067]">نظری یافت نشد</p>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8F0E5] p-5">
              <h2 className="text-lg font-bold text-[#20251F]">{editing ? 'ویرایش نظر' : 'نظر جدید'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#687067]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">نام</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">موقعیت</label>
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">آواتار (URL)</label>
                <input type="text" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                {form.avatar && <img src={form.avatar} alt="" className="mt-2 h-12 w-12 rounded-full object-cover" />}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">امتیاز (۱-۵)</label>
                <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">متن نظر</label>
                <textarea required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={4}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="h-4 w-4 rounded border-[#AFC8A8] text-[#3F6B45]" />
                <span className="text-sm text-[#20251F]">منتشر شده</span>
              </label>
              <div className="flex gap-3 border-t border-[#E8F0E5] pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-[#3F6B45] py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52] disabled:opacity-50">
                  {saving ? 'ذخیره...' : 'ذخیره'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[#E8F0E5] px-6 py-2.5 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
