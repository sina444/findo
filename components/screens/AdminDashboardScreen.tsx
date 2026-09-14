'use client';

import React, { useState } from 'react';
import { leadService } from '@/services/leadService';
import { businessService } from '@/services/businessService';
import { SANANDAJ_DISTRICTS } from '@/data/sanandajData';
import {
  BarChart3,
  Users,
  FileText,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Check,
  X,
  Clock,
  TrendingUp,
  Car,
  AlertTriangle,
  Award,
  Briefcase,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import {
  formatPriceToman,
  getTimeAgoFa,
  toPersianDigits,
  getStatusInfo,
} from '@/lib/utils';

interface AdminDashboardScreenProps {
  onViewLeadDetails: (leadId: string) => void;
  onRefreshData?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onViewLeadDetails,
  onRefreshData,
}) => {
  const [leads, setLeads] = useState(() => leadService.getAll());
  const [businesses, setBusinesses] = useState(() => businessService.getAll());
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const totalLeads = leads.length;
  const completedLeads = leads.filter((l) => l.status === 'completed' || l.status === 'accepted').length;
  const totalVerifiedBiz = businesses.filter((b) => b.isVerified).length;
  const estimatedGMV = completedLeads * 850000;

  const handleVerifyBusiness = (bizId: string) => {
    telegramService.triggerHaptic('medium');
    businessService.verify(bizId);
    setBusinesses([...businessService.getAll()]);
    setStatusFeedback('پروانه و صلاحیت فنی واحد صنفی با موفقیت تایید گردید.');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleResetDemoData = () => {
    telegramService.triggerHaptic('heavy');
    if (confirm('آیا می‌خواهید داده‌های سنندج به حالت پیش‌فرض برگردند؟')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مرکز کنترل و پایش مارکت‌پلیس فایندو
            </h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              مدیریت سنندج
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            نظارت بر جریان لیدها در ۱۲ رسته خدماتی، ارزیابی هوش مصنوعی و احراز هویت اصناف سنندج
          </p>
        </div>

        <button
          onClick={handleResetDemoData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>بازنشانی داده‌های نمونه</span>
        </button>
      </div>

      {statusFeedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>کل لیدهای خلق‌شده</span>
          </div>
          <p className="mt-1 text-xl font-black text-white">
            {toPersianDigits(totalLeads)} درخواست
          </p>
          <span className="text-[10px] text-cyan-400 mt-0.5 block">ارزیابی شده با AI</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>متخصصان و اصناف سنندج</span>
          </div>
          <p className="mt-1 text-xl font-black text-emerald-400">
            {toPersianDigits(businesses.length)} واحد
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {toPersianDigits(totalVerifiedBiz)} واحد تایید شده
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>نرخ تبدیل موفق</span>
          </div>
          <p className="mt-1 text-xl font-black text-amber-400">
            {toPersianDigits(Math.round((completedLeads / (totalLeads || 1)) * 100))}٪
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">پذیرش و اتمام کار</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Award className="h-3.5 w-3.5 text-purple-400" />
            <span>ارزش ناخالص تبادل (GMV)</span>
          </div>
          <p className="mt-1 text-sm sm:text-base font-black text-purple-300">
            {formatPriceToman(estimatedGMV)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">برآورد اجرت اصناف</span>
        </div>
      </div>

      {/* Sanandaj District Heatmap & Distribution */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <span>توزیع درخواست‌ها و پوشش در محله‌های سنندج</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SANANDAJ_DISTRICTS.map((district) => {
            const districtLeadsCount = leads.filter((l) => l.districtId === district.id).length;
            const districtBizCount = businesses.filter((b) => b.districtId === district.id).length;

            return (
              <div
                key={district.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{district.nameFa}</span>
                  <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    {toPersianDigits(districtLeadsCount)} لید
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {toPersianDigits(districtBizCount)} واحد تحت پوشش
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification Queue for Businesses */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>احراز هویت و صدور مجوز واحدهای صنفی سنندج</span>
          </h2>
          <span className="text-xs text-slate-400">
            {toPersianDigits(businesses.filter((b) => !b.isVerified).length)} واحد در انتظار
          </span>
        </div>

        <div className="space-y-2">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{b.businessNameFa}</span>
                  <span className="text-[11px] text-slate-400">({b.ownerName})</span>
                  {b.isVerified ? (
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      احراز شده
                    </span>
                  ) : (
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      در انتظار تایید مدارک
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  <span>محله: {b.districtNameFa}</span> • <span>شماره پروانه: {b.licenseNumber || 'SN-1092'}</span> •{' '}
                  <span>تلفن: {b.phone}</span>
                </div>
              </div>

              {!b.isVerified && (
                <button
                  onClick={() => handleVerifyBusiness(b.id)}
                  className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all self-end sm:self-auto"
                >
                  تایید و اعطای نشان اعتبار
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Leads Monitor */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>پایش لحظه‌ای لیدهای سنندج</span>
        </h2>

        <div className="space-y-2">
          {leads.map((l) => {
            const status = getStatusInfo(l.status);
            const leadTitle = l.vehicle?.brand
              ? `${l.vehicle.brand} ${l.vehicle.model}`
              : l.serviceTitle || l.categoryTitleFa || 'درخواست خدمت';

            return (
              <div
                key={l.id}
                onClick={() => onViewLeadDetails(l.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-white">{leadTitle}</span>
                  <span className="text-slate-400">• {l.districtNameFa}</span>
                  <span className="text-slate-500">({l.customerName})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${status.className}`}>
                    {status.labelFa}
                  </span>
                  <span className="text-[10px] text-slate-500">{getTimeAgoFa(l.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
