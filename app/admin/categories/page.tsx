'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Tags } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/admin-api';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  sortOrder: number;
}

const emptyCat = { name: '', slug: '', image: '', description: '', sortOrder: 0 };

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<any>(emptyCat);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try { setCats(await apiGet('/categories')); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => { setEditing(null); setForm(emptyCat); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm(c); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await apiPut(`/categories/${editing.id}`, form);
      else await apiPost('/categories', form);
      setModalOpen(false);
      loadData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این دسته مطمئن هستید؟')) return;
    await apiDelete(`/categories/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20251F]">مدیریت دسته‌بندی‌ها</h1>
          <p className="mt-1 text-sm text-[#687067]">{cats.length} دسته</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52]">
          <Plus className="h-4 w-4" /> دسته جدید
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-white/60" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {cats.map(c => (
            <div key={c.id} className="overflow-hidden rounded-xl border border-[#E8F0E5] bg-white">
              <div className="relative h-28 bg-[#F7F5EC]">
                {c.image && <img src={c.image} alt={c.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-[#20251F]">{c.name}</h3>
                <p className="text-xs text-[#687067]">{c.slug}</p>
                <p className="mt-1 line-clamp-1 text-xs text-[#687067]">{c.description}</p>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => openEdit(c)} className="flex-1 rounded-lg bg-[#F7F5EC] py-1.5 text-xs font-medium text-[#687067] hover:bg-[#E8F0E5]">
                    ویرایش
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-500 hover:bg-red-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cats.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-12">
              <Tags className="h-10 w-10 text-[#AFC8A8]" />
              <p className="mt-2 text-sm text-[#687067]">دسته‌ای یافت نشد</p>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8F0E5] p-5">
              <h2 className="text-lg font-bold text-[#20251F]">{editing ? 'ویرایش دسته' : 'دسته جدید'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#687067]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">نام</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">نامک (slug)</label>
                <input type="text" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">تصویر (URL)</label>
                <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                {form.image && <img src={form.image} alt="" className="mt-2 h-20 w-20 rounded-lg object-cover" />}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">توضیحات</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
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
