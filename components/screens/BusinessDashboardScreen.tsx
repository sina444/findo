'use client';

import React, { useState } from 'react';
import { BusinessProfile, Lead } from '@/types/findo';
import { leadService } from '@/services/leadService';
import { businessService } from '@/services/businessService';
import {
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  Car,
  Coins,
  CheckCircle2,
  XCircle,
  Unlock,
  CreditCard,
  Plus,
  Eye,
  Phone,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Layers,
  Wrench,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import {
  formatPriceToman,
  getTimeAgoFa,
  toPersianDigits,
  getUrgencyBadge,
  getStatusInfo,
} from '@/lib/utils';

interface BusinessDashboardScreenProps {
  activeBusinessId: string;
  onSelectBusinessId: (id: string) => void;
  onViewLeadDetails: (leadId: string) => void;
  onOpenPricing: () => void;
  onOpenRegisterNew: () => void;
  onViewHistory: () => void;
}

export const BusinessDashboardScreen: React.FC<BusinessDashboardScreenProps> = ({
  activeBusinessId,
  onSelectBusinessId,
  onViewLeadDetails,
  onOpenPricing,
  onOpenRegisterNew,
  onViewHistory,
}) => {
  const allBusinesses = businessService.getAll();
  const currentBusiness = businessService.getById(activeBusinessId) || allBusinesses[0];

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Get relevant leads for this business
  const businessLeads = leadService.getLeadsForBusiness(currentBusiness.id);

  // Active incoming leads (status = created or dispatched)
  const incomingLeads = businessLeads.filter(
    (l) => l.status === 'created' || l.status === 'dispatched'
  );
  const acceptedLeads = businessLeads.filter((l) => l.status === 'accepted' || l.status === 'in_progress');

  const handleUnlockLead = (leadId: string) => {
    telegramService.triggerHaptic('medium');
    const result = leadService.unlockContact(leadId, currentBusiness.id);
    if (result.success) {
      telegramService.triggerHaptic('success');
      setFeedback('شماره تماس مشتری با موفقیت بازگشایی شد.');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      telegramService.triggerHaptic('error');
      setFeedback(result.message);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleAcceptLead = (leadId: string) => {
    telegramService.triggerHaptic('medium');
    leadService.updateStatus(leadId, 'accepted', currentBusiness.id);
    telegramService.triggerHaptic('success');
    setFeedback('لید با موفقیت پذیرفته شد و به نام کسب‌وکار شما ثبت گردید.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner with Business Profile Selector & Wallet Balance */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0b1626] to-[#070e1b] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Active Business Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">کسب‌وکار فعال شما:</span>
                <select
                  value={currentBusiness.id}
                  onChange={(e) => onSelectBusinessId(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold text-white focus:border-cyan-500 focus:outline-none"
                >
                  {allBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.businessNameFa} ({b.districtNameFa})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                مدیر: <strong className="text-slate-200">{currentBusiness.ownerName}</strong> • تلفن: {toPersianDigits(currentBusiness.phone)}
              </p>
            </div>
          </div>

          {/* Credit Wallet Badge & Actions */}
          <div className="flex items-center gap-3 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[11px] text-amber-300 font-medium block">اعتبار کیف پول فایندو:</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <strong className="text-base font-black text-white">
                  {toPersianDigits(currentBusiness.credits)}
                </strong>
                <span className="text-xs text-slate-400">لید</span>
              </div>
            </div>

            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>شارژ بسته اعتباری</span>
            </button>
          </div>
        </div>

        {/* Business Metrics Row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-800/80 pt-4 text-xs">
          <div className="rounded-xl bg-slate-950/40 p-2.5 border border-slate-800/40">
            <span className="text-slate-400 block">لیدهای دریافتی جدید:</span>
            <strong className="text-cyan-400 text-sm font-black mt-0.5 block">
              {toPersianDigits(incomingLeads.length)} لید فعال
            </strong>
          </div>

          <div className="rounded-xl bg-slate-950/40 p-2.5 border border-slate-800/40">
            <span className="text-slate-400 block">لیدهای پذیرفته شده:</span>
            <strong className="text-emerald-400 text-sm font-black mt-0.5 block">
              {toPersianDigits(acceptedLeads.length)} خدمت
            </strong>
          </div>

          <div className="rounded-xl bg-slate-950/40 p-2.5 border border-slate-800/40">
            <span className="text-slate-400 block">سفارش‌های پایان‌یافته:</span>
            <strong className="text-white text-sm font-black mt-0.5 block">
              {toPersianDigits(currentBusiness.completedLeadsCount)} مشتری
            </strong>
          </div>

          <div className="rounded-xl bg-slate-950/40 p-2.5 border border-slate-800/40">
            <span className="text-slate-400 block">امتیاز مشتریان سنندج:</span>
            <strong className="text-amber-400 text-sm font-black mt-0.5 block">
              ⭐ {toPersianDigits(currentBusiness.rating)} / ۵.۰
            </strong>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-cyan-900/60 bg-cyan-950/40 p-3.5 text-xs text-cyan-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Incoming Leads Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>لیدهای جدید منطبق با تخصص شما در سنندج ({toPersianDigits(incomingLeads.length)})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            درخواست‌هایی که هوش مصنوعی فایندو برای کسب‌وکار شما واجد شرایط تشخیص داده است
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onViewHistory}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            تاریخچه تراکنش‌ها و لیدها
          </button>

          <button
            onClick={onOpenRegisterNew}
            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-slate-700"
          >
            + ثبت واحد صنفی جدید
          </button>
        </div>
      </div>

      {/* Incoming Leads List */}
      <div className="space-y-3">
        {incomingLeads.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400 space-y-2">
            <p>در حال حاضر لید جدیدی در انتظار نیست. با ثبت درخواست جدید از طرف مشتریان، لیدها بلافاصله اینجا نمایش داده می‌شوند.</p>
          </div>
        ) : (
          incomingLeads.map((lead) => {
            const isUnlocked = lead.unlockedByBusinessIds?.includes(currentBusiness.id);
            const urgencyBadge = getUrgencyBadge(lead.urgency);
            const hasVehicle = Boolean(lead.vehicle && lead.vehicle.brand);

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-500/40 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/70 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {hasVehicle ? <Car className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm sm:text-base text-white">
                          {hasVehicle
                            ? `${lead.vehicle!.brand} ${lead.vehicle!.model}`
                            : lead.serviceTitle || lead.categoryTitleFa || 'خدمت درخواستی'}
                        </strong>
                        {hasVehicle && lead.vehicle!.year && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                            {toPersianDigits(lead.vehicle!.year)}
                          </span>
                        )}
                        {lead.categoryTitleFa && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {lead.categoryTitleFa}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        مشتری: {lead.customerName} • {getTimeAgoFa(lead.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${urgencyBadge.className}`}>
                      {urgencyBadge.labelFa}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg">
                      <MapPin className="h-3 w-3 text-cyan-400" />
                      <span>{lead.districtNameFa}</span>
                    </span>
                  </div>
                </div>

                {/* Natural prompt & AI analysis */}
                <div className="space-y-2 text-xs">
                  <p className="text-slate-200 leading-relaxed font-medium bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                    «{lead.naturalLanguageQuery}»
                  </p>

                  {lead.qualification && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>
                        تشخیص هوش مصنوعی: <strong className="text-cyan-300">{lead.qualification.titleFa || lead.qualification.serviceNameFa}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        برآورد دستمزد: <strong className="text-emerald-400">
                          {formatPriceToman(lead.qualification.estimatedCostTomanMin || lead.qualification.targetBudgetEstimate?.minToman || lead.qualification.estimatedPriceMin || 200000)} تا {formatPriceToman(lead.qualification.estimatedCostTomanMax || lead.qualification.targetBudgetEstimate?.maxToman || lead.qualification.estimatedPriceMax || 800000)}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Card & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
                  <div>
                    {isUnlocked ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">شماره تماس:</span>
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="font-bold text-emerald-400 dir-ltr hover:underline"
                        >
                          {toPersianDigits(lead.customerPhone)}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        اطلاعات تماس قفل است (نیاز به ۱ اعتبار)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onViewLeadDetails(lead.id)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>مشاهده کامل و ثبت استعلام</span>
                    </button>

                    {!isUnlocked ? (
                      <button
                        onClick={() => handleUnlockLead(lead.id)}
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-sm"
                      >
                        بازگشایی تماس (۱ اعتبار)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAcceptLead(lead.id)}
                        className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-sm"
                      >
                        پذیرش قطعی کار
                      </button>
                    )}
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
