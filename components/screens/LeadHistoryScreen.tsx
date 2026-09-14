'use client';

import React, { useState } from 'react';
import { Lead, UserRole } from '@/types/findo';
import { leadService } from '@/services/leadService';
import { businessService } from '@/services/businessService';
import {
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  Phone,
  Coins,
  ChevronLeft,
  Calendar,
  Filter,
  FileText,
  Briefcase,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import {
  formatPriceToman,
  getTimeAgoFa,
  toPersianDigits,
  getStatusInfo,
  getUrgencyBadge,
} from '@/lib/utils';

interface LeadHistoryScreenProps {
  currentRole: UserRole;
  activeBusinessId?: string;
  onViewLeadDetails: (leadId: string) => void;
  onBack: () => void;
}

export const LeadHistoryScreen: React.FC<LeadHistoryScreenProps> = ({
  currentRole,
  activeBusinessId,
  onViewLeadDetails,
  onBack,
}) => {
  const allLeads = leadService.getAll();
  const effectiveBusinessId = activeBusinessId || 'biz_kordestan_mechanic';
  const business = businessService.getById(effectiveBusinessId);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const leads =
    currentRole === 'business'
      ? leadService.getLeadsForBusiness(effectiveBusinessId)
      : allLeads;

  const filtered = leads.filter((l) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return l.status === 'dispatched' || l.status === 'in_progress';
    if (filterStatus === 'accepted') return l.status === 'accepted';
    if (filterStatus === 'completed') return l.status === 'completed';
    return true;
  });

  const completedCount = leads.filter((l) => l.status === 'completed' || l.status === 'accepted').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            تاریخچه و گزارش عملکرد لیدها
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {business ? `واحد: ${business.businessNameFa}` : 'سوابق درخواست‌های ثبت شده در فایندو'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>بازگشت به داشبورد</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 block">کل درخواست‌های دریافتی</span>
          <p className="mt-1 text-lg sm:text-xl font-black text-white">
            {toPersianDigits(leads.length)} لید
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 block">لیدهای موفق و به سرانجام رسیده</span>
          <p className="mt-1 text-lg sm:text-xl font-black text-emerald-400">
            {toPersianDigits(completedCount)} خدمت
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 block">درآمد تقریبی حاصله در سنندج</span>
          <p className="mt-1 text-base sm:text-lg font-black text-cyan-300">
            {formatPriceToman(completedCount * 850000)}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'همه لیدها' },
          { id: 'active', label: 'در جریان و ارسال شده' },
          { id: 'accepted', label: 'پذیرفته شده' },
          { id: 'completed', label: 'تکمیل شده' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              telegramService.triggerHaptic('light');
              setFilterStatus(tab.id);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
            موردی در این وضعیت یافت نشد.
          </div>
        ) : (
          filtered.map((lead) => {
            const status = getStatusInfo(lead.status);
            const urgency = getUrgencyBadge(lead.urgency);
            const isUnlocked = lead.unlockedByBusinessIds?.includes(effectiveBusinessId);
            const hasVehicle = Boolean(lead.vehicle && lead.vehicle.brand);

            return (
              <div
                key={lead.id}
                onClick={() => {
                  telegramService.triggerHaptic('light');
                  onViewLeadDetails(lead.id);
                }}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                      {hasVehicle ? <Car className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {hasVehicle
                          ? `${lead.vehicle!.brand} ${lead.vehicle!.model}`
                          : lead.serviceTitle || lead.categoryTitleFa || 'خدمت درخواستی'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>{lead.districtNameFa}</span>
                        <span>•</span>
                        <span>{getTimeAgoFa(lead.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${status.className}`}>
                      {status.labelFa}
                    </span>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${urgency.className}`}>
                      {urgency.labelFa}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  «{lead.naturalLanguageQuery}»
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span>مشتری: <strong className="text-slate-200">{lead.customerName}</strong></span>
                    {isUnlocked && (
                      <span className="text-emerald-400 font-bold" dir="ltr">
                        {lead.customerPhone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-cyan-400 font-medium">
                    <span>مشاهده جزییات و استعلام‌ها ({toPersianDigits(lead.quotes?.length || 0)})</span>
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
