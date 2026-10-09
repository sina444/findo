'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, FileText } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/admin-api';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  published: boolean;
}

const emptyPost = { title: '', excerpt: '', category: '', image: '', date: '', readTime: '', published: true };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<any>(emptyPost);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try { setPosts(await apiGet('/blog')); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => { setEditing(null); setForm({ ...emptyPost, date: new Date().toLocaleDateString('fa-IR') }); setModalOpen(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setForm(p); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await apiPut(`/blog/${editing.id}`, form);
      else await apiPost('/blog', form);
      setModalOpen(false);
      loadData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این پست مطمئن هستید؟')) return;
    await apiDelete(`/blog/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20251F]">مدیریت وبلاگ</h1>
          <p className="mt-1 text-sm text-[#687067]">{posts.length} پست</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52]">
          <Plus className="h-4 w-4" /> پست جدید
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-white/60" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(p => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-[#E8F0E5] bg-white">
              <div className="h-32 bg-[#F7F5EC]">
                {p.image && <img src={p.image} alt={p.title} className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-[#3F6B45]">{p.category}</span>
                <h3 className="mt-1 text-sm font-semibold text-[#20251F]">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-[#687067]">{p.excerpt}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#687067]">{p.date}</span>
                  {p.published
                    ? <span className="text-xs font-medium text-[#3F6B45]">منتشر شده</span>
                    : <span className="text-xs font-medium text-[#C9825A]">پیش‌نویس</span>}
                </div>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => openEdit(p)} className="flex-1 rounded-lg bg-[#F7F5EC] py-1.5 text-xs font-medium text-[#687067] hover:bg-[#E8F0E5]">ویرایش</button>
                  <button onClick={() => handleDelete(p.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-500 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-12">
              <FileText className="h-10 w-10 text-[#AFC8A8]" />
              <p className="mt-2 text-sm text-[#687067]">پستی یافت نشد</p>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8F0E5] p-5">
              <h2 className="text-lg font-bold text-[#20251F]">{editing ? 'ویرایش پست' : 'پست جدید'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#687067]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">عنوان</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">خلاصه</label>
                <textarea required value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">دسته</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">زمان مطالعه</label>
                  <input type="text" value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })}
                    placeholder="۵ دقیقه مطالعه"
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">تاریخ</label>
                <input type="text" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">تصویر (URL)</label>
                <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                {form.image && <img src={form.image} alt="" className="mt-2 h-20 w-full rounded-lg object-cover" />}
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
