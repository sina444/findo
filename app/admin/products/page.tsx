'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Search, Package } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  category: string;
  image: string;
  images: string;
  description: string;
  shortDescription: string;
  specifications: string;
  careInstructions: string;
  inStock: boolean;
  badge?: string | null;
  features: string;
  rating: number;
  reviewCount: number;
  published: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const emptyProduct = {
  name: '', slug: '', price: 0, oldPrice: null, category: '', image: '',
  images: '[]', description: '', shortDescription: '', specifications: '[]',
  careInstructions: '[]', inStock: true, badge: '', features: '[]',
  rating: 5, reviewCount: 0, published: true, sortOrder: 0,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([apiGet('/products'), apiGet('/categories')]);
      setProducts(prods as Product[]);
      setCategories(cats as Category[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProduct, category: categories[0]?.slug || '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      ...p,
      images: p.images || '[]',
      specifications: p.specifications || '[]',
      careInstructions: p.careInstructions || '[]',
      features: p.features || '[]',
      oldPrice: p.oldPrice || '',
      badge: p.badge || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: String(form.price),
        oldPrice: form.oldPrice ? String(form.oldPrice) : null,
        rating: String(form.rating),
        reviewCount: String(form.reviewCount),
        sortOrder: Number(form.sortOrder),
        images: JSON.parse(form.images || '[]'),
        specifications: JSON.parse(form.specifications || '[]'),
        careInstructions: JSON.parse(form.careInstructions || '[]'),
        features: form.features ? JSON.parse(form.features) : [],
      };
      if (editing) {
        await apiPut(`/products/${editing.id}`, payload);
      } else {
        await apiPost('/products', payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError('ذخیره ناموفق بود. مقادیر JSON را بررسی کنید.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
    await apiDelete(`/products/${id}`);
    loadData();
  };

  const catName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20251F]">مدیریت محصولات</h1>
          <p className="mt-1 text-sm text-[#687067]">{products.length} محصول</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52]">
          <Plus className="h-4 w-4" />
          محصول جدید
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی محصول..."
          className="w-full rounded-lg border border-[#E8F0E5] bg-white py-2.5 pr-11 pl-4 text-sm outline-none focus:border-[#3F6B45]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-white/60" />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E8F0E5] bg-white">
          <table className="w-full">
            <thead className="border-b border-[#E8F0E5] bg-[#F7F5EC]">
              <tr>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">تصویر</th>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">نام محصول</th>
                <th className="hidden p-3 text-right text-xs font-semibold text-[#687067] md:table-cell">دسته</th>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">قیمت</th>
                <th className="hidden p-3 text-right text-xs font-semibold text-[#687067] sm:table-cell">موجودی</th>
                <th className="hidden p-3 text-right text-xs font-semibold text-[#687067] sm:table-cell">وضعیت</th>
                <th className="p-3 text-center text-xs font-semibold text-[#687067]">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-[#E8F0E5] last:border-0 hover:bg-[#F7F5EC]/50">
                  <td className="p-3">
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-medium text-[#20251F]">{p.name}</p>
                    <p className="text-xs text-[#687067]">{p.slug}</p>
                  </td>
                  <td className="hidden p-3 md:table-cell">
                    <span className="rounded-full bg-[#E8F0E5] px-2 py-0.5 text-xs text-[#3F6B45]">{catName(p.category)}</span>
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-semibold text-[#20251F]">{formatPrice(p.price)}</p>
                    {p.oldPrice && <p className="text-xs text-[#687067] line-through">{formatPrice(p.oldPrice)}</p>}
                  </td>
                  <td className="hidden p-3 sm:table-cell">
                    {p.inStock ? (
                      <span className="text-xs font-medium text-[#3F6B45]">موجود</span>
                    ) : (
                      <span className="text-xs font-medium text-red-500">ناموجود</span>
                    )}
                  </td>
                  <td className="hidden p-3 sm:table-cell">
                    {p.published ? (
                      <span className="text-xs font-medium text-[#3F6B45]">منتشر شده</span>
                    ) : (
                      <span className="text-xs font-medium text-[#C9825A]">پیش‌نویس</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-[#687067] hover:bg-[#E8F0E5] hover:text-[#3F6B45]">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-[#687067] hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="h-10 w-10 text-[#AFC8A8]" />
              <p className="mt-2 text-sm text-[#687067]">محصولی یافت نشد</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8F0E5] p-5">
              <h2 className="text-lg font-bold text-[#20251F]">{editing ? 'ویرایش محصول' : 'محصول جدید'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#687067] hover:text-[#20251F]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">نام محصول</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">نامک (slug)</label>
                  <input type="text" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">قیمت (دلار)</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">قیمت قبلی (اختیاری)</label>
                  <input type="number" step="0.01" value={form.oldPrice || ''} onChange={e => setForm({ ...form, oldPrice: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">دسته‌بندی</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white">
                    <option value="">انتخاب کنید</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">برچسب (اختیاری)</label>
                  <input type="text" value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })}
                    placeholder="مثلاً: پرفروش، تخفیف"
                    className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">تصویر اصلی (URL)</label>
                <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="/images/... یا /uploads/..."
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
                {form.image && <img src={form.image} alt="پیش‌نمایش" className="mt-2 h-20 w-20 rounded-lg object-cover" />}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">توضیح کوتاه</label>
                <textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">توضیحات کامل</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">ویژگی‌ها (هر خط یک ویژگی)</label>
                <textarea
                  value={(() => { try { return JSON.parse(form.features || '[]').join('\n'); } catch { return ''; } })()}
                  onChange={e => setForm({ ...form, features: JSON.stringify(e.target.value.split('\n').filter(Boolean)) })}
                  rows={3}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">دستورالعمل مراقبت (هر خط یک مورد)</label>
                <textarea
                  value={(() => { try { return JSON.parse(form.careInstructions || '[]').join('\n'); } catch { return ''; } })()}
                  onChange={e => setForm({ ...form, careInstructions: JSON.stringify(e.target.value.split('\n').filter(Boolean)) })}
                  rows={3}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">مشخصات (هر خط: برچسب: مقدار)</label>
                <textarea
                  value={(() => { try { return JSON.parse(form.specifications || '[]').map((s: any) => `${s.label}: ${s.value}`).join('\n'); } catch { return ''; } })()}
                  onChange={e => setForm({ ...form, specifications: JSON.stringify(e.target.value.split('\n').filter(Boolean).map(line => { const [label, ...rest] = line.split(':'); return { label: label?.trim() || '', value: rest.join(':').trim() }; })) })}
                  rows={4}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#20251F]">گالری تصاویر (هر خط یک URL)</label>
                <textarea
                  value={(() => { try { return JSON.parse(form.images || '[]').join('\n'); } catch { return ''; } })()}
                  onChange={e => setForm({ ...form, images: JSON.stringify(e.target.value.split('\n').filter(Boolean)) })}
                  rows={3}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white" />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })}
                    className="h-4 w-4 rounded border-[#AFC8A8] text-[#3F6B45]" />
                  <span className="text-sm text-[#20251F]">موجود</span>
                </label>
                <label className="flex items-center! gap-2">
                  <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                    className="h-4 w-4 rounded border-[#AFC8A8] text-[#3F6B45]" />
                  <span className="text-sm text-[#20251F]">منتشر شده</span>
                </label>
              </div>

              <div className="flex gap-3 border-t border-[#E8F0E5] pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-[#3F6B45] py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52] disabled:opacity-50">
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[#E8F0E5] px-6 py-2.5 text-sm font-medium text-[#687067] hover:bg-[#F7F5EC]">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
