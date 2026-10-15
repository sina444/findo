'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react';
import { apiGet, apiPut, apiDelete, ALERT_SEVERITY, type Alert } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, ConfirmDialog, EmptyState, LoadingGrid, StatCard } from '@/components/admin/GreenhouseUI';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAlerts(await apiGet<Alert[]>('/alerts')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAck = async (id: string) => {
    await apiPut(`/alerts/${id}`, { acknowledged: true });
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiDelete(`/alerts/${deleteId}`);
    setDeleteId(null); load();
  };

  const critical = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged);
  const warnings = alerts.filter(a => a.severity === 'WARNING' && !a.acknowledged);
  const info = alerts.filter(a => a.severity === 'INFO' && !a.acknowledged);

  return (
    <div>
      <PageHeader title="هشدارها و اعلان‌ها" subtitle="مدیریت هشدارهای گلخانه و اتوماسیون" />

      {loading ? <LoadingGrid /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="بحرانی" value={critical.length} icon={AlertCircle} color="bg-red-500" />
            <StatCard label="هشدار" value={warnings.length} icon={Bell} color="bg-amber-500" />
            <StatCard label="اطلاع‌رسانی" value={info.length} icon={Bell} color="bg-blue-500" />
            <StatCard label="کل هشدارها" value={alerts.length} icon={Bell} color="bg-[#3F6B45]" />
          </div>

          <SectionCard title="همه هشدارها" className="mt-6">
            {alerts.length === 0 ? <EmptyState title="هشداری وجود ندارد" icon={Bell} /> : (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between rounded-lg border border-[#E8F0E5] p-3">
                    <div className="flex items-center gap-3">
                      <Badge color={alert.severity === 'CRITICAL' ? 'red' : alert.severity === 'WARNING' ? 'yellow' : 'blue'}>
                        {ALERT_SEVERITY[alert.severity]}
                      </Badge>
                      <div>
                        <p className={`text-sm ${alert.acknowledged ? 'text-[#687067] line-through' : 'text-[#20251F]'}`}>{alert.message}</p>
                        <p className="text-xs text-[#687067]">{new Date(alert.createdAt).toLocaleString('fa-IR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!alert.acknowledged && (
                        <button onClick={() => handleAck(alert.id)} className="rounded p-1.5 text-[#3F6B45] hover:bg-[#E8F0E5]"><Check className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => setDeleteId(alert.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف هشدار" message="آیا از حذف این هشدار مطمئن هستید؟" />
    </div>
  );
}
