'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiGet, apiPost, apiDelete, EXPENSE_CATEGORIES, type Expense, type Harvest } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, Modal, ConfirmDialog, EmptyState, LoadingGrid, Field, inputClass, StatCard } from '@/components/admin/GreenhouseUI';

const PIE_COLORS = ['#3F6B45', '#7FA77D', '#AFC8A8', '#C9825A', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function FinancePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: 'SEED', description: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [exp, har] = await Promise.all([apiGet<Expense[]>('/expenses'), apiGet<Harvest[]>('/harvests')]);
      setExpenses(exp); setHarvests(har);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/expenses', { ...form, amount: Number(form.amount), date: new Date(form.date) });
    setModalOpen(false); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiDelete(`/expenses/${deleteId}`);
    setDeleteId(null); load();
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRevenue = harvests.reduce((s, h) => s + h.amount * 50000, 0); // assumed 50k per kg
  const profit = totalRevenue - totalExpenses;

  // Expenses by category
  const categoryData = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: EXPENSE_CATEGORIES[name] || name, value }));

  // Monthly data
  const monthlyData = expenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleDateString('fa-IR', { month: 'short' });
    const existing = acc.find(a => a.month === month);
    if (existing) existing.amount += e.amount; else acc.push({ month, amount: e.amount });
    return acc;
  }, [] as { month: string; amount: number }[]);

  return (
    <div>
      <PageHeader
        title="مدیریت مالی گلخانه"
        subtitle="هزینه‌ها، درآمد و تحلیل سود و زیان"
        action={
          <button onClick={() => { setForm({ category: 'SEED', description: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }); setModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">
            <Plus className="h-4 w-4" /> ثبت هزینه
          </button>
        }
      />

      {loading ? <LoadingGrid /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="کل هزینه‌ها" value={totalExpenses.toLocaleString('fa-IR')} unit="تومان" icon={TrendingDown} color="bg-red-500" />
            <StatCard label="کل درآمد" value={totalRevenue.toLocaleString('fa-IR')} unit="تومان" icon={TrendingUp} color="bg-[#3F6B45]" />
            <StatCard label="سود/زیان" value={profit.toLocaleString('fa-IR')} unit="تومان" icon={Wallet} color={profit >= 0 ? 'bg-[#3F6B45]' : 'bg-red-500'} />
            <StatCard label="تعداد برداشت" value={harvests.length} icon={TrendingUp} color="bg-[#7FA77D]" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {categoryData.length > 0 && (
              <SectionCard title="هزینه‌ها به تفکیک دسته">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: any) => Number(v).toLocaleString('fa-IR') + ' تومان'} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
            )}

            {monthlyData.length > 0 && (
              <SectionCard title="روند هزینه‌ها">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#687067" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#687067" />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: any) => Number(v).toLocaleString('fa-IR') + ' تومان'} />
                    <Bar dataKey="amount" fill="#C9825A" radius={[4, 4, 0, 0]} name="هزینه (تومان)" />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            )}
          </div>

          <SectionCard title="لیست هزینه‌ها" className="mt-6">
            {expenses.length === 0 ? <EmptyState title="هزینه‌ای ثبت نشده است" icon={Wallet} /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8F0E5] text-[#687067]">
                      <th className="py-2 pr-2 text-right">تاریخ</th>
                      <th className="py-2 text-right">دسته</th>
                      <th className="py-2 text-right">توضیحات</th>
                      <th className="py-2 text-right">مبلغ</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id} className="border-b border-[#E8F0E5]">
                        <td className="py-2 pr-2 text-[#20251F]">{new Date(exp.date).toLocaleDateString('fa-IR')}</td>
                        <td className="py-2"><Badge color="blue">{EXPENSE_CATEGORIES[exp.category] || exp.category}</Badge></td>
                        <td className="py-2 text-[#20251F]">{exp.description}</td>
                        <td className="py-2 font-medium text-[#20251F]">{exp.amount.toLocaleString('fa-IR')} تومان</td>
                        <td className="py-2"><button onClick={() => setDeleteId(exp.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="ثبت هزینه جدید">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="دسته هزینه" required>
            <select className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="توضیحات" required><input className={inputClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="مبلغ (تومان)" required><input type="number" className={inputClass} value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required /></Field>
            <Field label="تاریخ" required><input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></Field>
          </div>
          <Field label="یادداشت"><input className={inputClass} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ذخیره</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف هزینه" message="آیا از حذف این هزینه مطمئن هستید؟" />
    </div>
  );
}
