'use client';

import { useEffect, useState, useCallback } from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, Eye, X } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'در انتظار', color: 'bg-[#C9825A]', icon: Clock },
  PAID: { label: 'پرداخت‌شده', color: 'bg-[#3F6B45]', icon: CheckCircle2 },
  SHIPPED: { label: 'ارسال‌شده', color: 'bg-blue-500', icon: Truck },
  DELIVERED: { label: 'تحویل‌شده', color: 'bg-[#7FA77D]', icon: Package },
  CANCELLED: { label: 'لغوشده', color: 'bg-red-500', icon: XCircle },
};

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setOrders(await apiGet('/orders'));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = orders.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    String(o.orderNumber).includes(search)
  );

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      await apiPut(`/orders/${orderId}`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selected?.id === orderId) {
        setSelected(prev => prev ? { ...prev, status } : null);
      }
    } catch { /* ignore */ }
    setUpdating(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#20251F]">مدیریت سفارش‌ها</h1>
        <p className="mt-1 text-sm text-[#687067]">{orders.length} سفارش</p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی سفارش..."
          className="w-full rounded-lg border border-[#E8F0E5] bg-white py-2.5 pr-11 pl-4 text-sm outline-none focus:border-[#3F6B45]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-white/60" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E8F0E5] bg-white p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-[#AFC8A8]" />
          <p className="mt-4 text-sm text-[#687067]">هیچ سفارشی یافت نشد</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E8F0E5] bg-white">
          <table className="w-full">
            <thead className="border-b border-[#E8F0E5] bg-[#F7F5EC]">
              <tr>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">شماره</th>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">مشتری</th>
                <th className="hidden p-3 text-right text-xs font-semibold text-[#687067] md:table-cell">تاریخ</th>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">مبلغ</th>
                <th className="p-3 text-right text-xs font-semibold text-[#687067]">وضعیت</th>
                <th className="p-3 text-center text-xs font-semibold text-[#687067]">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const StatusIcon = STATUS_CONFIG[o.status]?.icon || Clock;
                return (
                  <tr key={o.id} className="border-b border-[#E8F0E5] last:border-0 hover:bg-[#F7F5EC]/50">
                    <td className="p-3">
                      <span className="font-semibold text-[#20251F]">#{o.orderNumber}</span>
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium text-[#20251F]">{o.customerName}</p>
                      <p className="text-xs text-[#687067]" dir="ltr">{o.email}</p>
                    </td>
                    <td className="hidden p-3 md:table-cell">
                      <span className="text-xs text-[#687067]">
                        {new Date(o.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-[#20251F]">{formatPrice(o.total)}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white ${STATUS_CONFIG[o.status]?.color || 'bg-gray-400'}`}>
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_CONFIG[o.status]?.label || o.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => setSelected(o)}
                          className="rounded-lg p-2 text-[#687067] hover:bg-[#E8F0E5] hover:text-[#3F6B45]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#20251F]">سفارش #{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-[#687067] hover:bg-[#F7F5EC]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-[#F7F5EC] p-4 text-sm">
              <div>
                <p className="text-xs text-[#687067]">مشتری</p>
                <p className="font-medium text-[#20251F]">{selected.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-[#687067]">ایمیل</p>
                <p className="font-medium text-[#20251F]" dir="ltr">{selected.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#687067]">تلفن</p>
                <p className="font-medium text-[#20251F]" dir="ltr">{selected.phone}</p>
              </div>
              <div>
                <p className="text-xs text-[#687067]">تاریخ</p>
                <p className="font-medium text-[#20251F]">{new Date(selected.createdAt).toLocaleDateString('fa-IR')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#687067]">آدرس</p>
                <p className="font-medium text-[#20251F]">{selected.address}، {selected.city}، {selected.zip}</p>
              </div>
              {selected.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-[#687067]">توضیحات</p>
                  <p className="text-[#20251F]">{selected.notes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="mb-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#20251F]">اقلام سفارش</h3>
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-[#E8F0E5] p-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#20251F]">{item.name}</p>
                    <p className="text-xs text-[#687067]">تعداد: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#20251F]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mb-4 space-y-2 border-t border-[#E8F0E5] pt-4">
              <div className="flex justify-between text-sm text-[#687067]">
                <span>جمع کل</span>
                <span>{formatPrice(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#687067]">
                <span>ارسال</span>
                <span>{selected.shipping === 0 ? 'رایگان' : formatPrice(selected.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#687067]">
                <span>مالیات</span>
                <span>{formatPrice(selected.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E8F0E5] pt-2 text-base font-bold text-[#20251F]">
                <span>مبلغ نهایی</span>
                <span>{formatPrice(selected.total)}</span>
              </div>
            </div>

            {/* Status management */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#20251F]">تغییر وضعیت سفارش</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(status => {
                  const config = STATUS_CONFIG[status];
                  const active = selected.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selected.id, status)}
                      disabled={updating}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? `${config.color} text-white`
                          : 'border border-[#E8F0E5] text-[#687067] hover:bg-[#F7F5EC]'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
