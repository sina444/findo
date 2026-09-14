'use client';

import React, { useState } from 'react';
import { Lead, UserRole, BusinessProfile } from '@/types/findo';
import { leadService } from '@/services/leadService';
import { businessService } from '@/services/businessService';
import {
  Car,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Coins,
  Send,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  User,
  Wrench,
  Truck,
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

interface LeadDetailsScreenProps {
  leadId: string;
  currentRole: UserRole;
  activeBusinessId?: string;
  onBack: () => void;
  onRefresh?: () => void;
}

export const LeadDetailsScreen: React.FC<LeadDetailsScreenProps> = ({
  leadId,
  currentRole,
  activeBusinessId,
  onBack,
  onRefresh,
}) => {
  const [lead, setLead] = useState<Lead | undefined>(() => leadService.getLeadById(leadId));
  const [quotePrice, setQuotePrice] = useState('450000');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [canVisit, setCanVisit] = useState(true);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isError, setIsError] = useState(false);

  if (!lead) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
        <p className="text-sm text-slate-300">درخواست مورد نظر یافت نشد.</p>
        <button
          onClick={onBack}
          className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const effectiveBusinessId = activeBusinessId || 'biz_kordestan_mechanic';
  const business = businessService.getById(effectiveBusinessId);
  const isUnlocked =
    currentRole === 'customer' ||
    currentRole === 'admin' ||
    lead.unlockedByBusinessIds?.includes(effectiveBusinessId);

  const statusInfo = getStatusInfo(lead.status);
  const urgencyInfo = getUrgencyBadge(lead.urgency);

  const handleUnlockContact = () => {
    telegramService.triggerHaptic('medium');
    const result = leadService.unlockContact(lead.id, effectiveBusinessId);
    if (result.success && result.lead) {
      setLead({ ...result.lead });
      setFeedbackMsg(result.message);
      setIsError(false);
      telegramService.triggerHaptic('success');
      onRefresh?.();
    } else {
      setFeedbackMsg(result.message);
      setIsError(true);
      telegramService.triggerHaptic('error');
    }
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    if (!quotePrice || isNaN(Number(quotePrice))) {
      setFeedbackMsg('لطفاً مبلغ برآوردی را به درستی وارد فرمایید.');
      setIsError(true);
      return;
    }

    setIsSubmittingQuote(true);
    telegramService.triggerHaptic('medium');

    const result = leadService.submitQuote(lead.id, {
      businessId: business.id,
      businessNameFa: business.businessNameFa,
      specialistName: business.ownerName,
      phone: business.phone,
      estimatedCost: Number(quotePrice),
      message: quoteMessage.trim() || 'آماده ارائه خدمت در سریع‌ترین زمان در سنندج هستیم.',
      canVisitLocation: canVisit,
    });

    setIsSubmittingQuote(false);
    if (result.success) {
      telegramService.triggerHaptic('success');
      setFeedbackMsg('پیشنهاد قیمت با موفقیت برای مشتری ارسال شد.');
      setIsError(false);
      setQuoteMessage('');
      const refreshed = leadService.getLeadById(lead.id);
      if (refreshed) setLead({ ...refreshed });
      onRefresh?.();
    }
  };

  const handleStatusChange = (newStatus: any) => {
    telegramService.triggerHaptic('medium');
    leadService.updateStatus(lead.id, newStatus, effectiveBusinessId);
    const refreshed = leadService.getLeadById(lead.id);
    if (refreshed) setLead({ ...refreshed });
    setFeedbackMsg(`وضعیت به «${getStatusInfo(newStatus).labelFa}» تغییر یافت.`);
    setIsError(false);
    onRefresh?.();
  };

  const hasVehicle = Boolean(lead.vehicle && lead.vehicle.brand);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>بازگشت</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">شناسه: {toPersianDigits(lead.id)}</span>
          <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${statusInfo.className}`}>
            {statusInfo.labelFa}
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
            isError
              ? 'border border-rose-900/60 bg-rose-950/40 text-rose-300'
              : 'border border-emerald-900/60 bg-emerald-950/40 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Lead Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-6">
        {/* Title, Vehicle & Customer Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {hasVehicle ? <Car className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  {hasVehicle
                    ? `${lead.vehicle!.brand} ${lead.vehicle!.model}`
                    : lead.serviceTitle || lead.categoryTitleFa || 'خدمت درخواستی فایندو'}
                </h1>
                {hasVehicle && lead.vehicle!.year && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    مدل {toPersianDigits(lead.vehicle!.year)}
                  </span>
                )}
                {lead.categoryTitleFa && (
                  <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs text-cyan-300 border border-cyan-800">
                    {lead.categoryTitleFa}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ثبت شده توسط: <strong className="text-slate-200">{lead.customerName}</strong> ({getTimeAgoFa(lead.createdAt)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${urgencyInfo.className}`}>
              {urgencyInfo.labelFa}
            </span>
          </div>
        </div>

        {/* Location & Problem Statement */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>محله در سنندج:</span>
            <strong className="text-white">{lead.districtNameFa}</strong>
            {lead.exactAddress && (
              <span className="text-slate-400">({lead.exactAddress})</span>
            )}
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">متن نیاز ثبت شده توسط کاربر:</span>
            <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-sm text-slate-200 leading-relaxed font-medium">
              «{lead.naturalLanguageQuery}»
            </p>
          </div>
        </div>

        {/* AI Triage Diagnosis in Lead Details */}
        {lead.qualification && (
          <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/15 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>تحلیل هوش مصنوعی فایندو: {lead.qualification.titleFa || lead.qualification.serviceNameFa}</span>
              </span>
              <span className="text-slate-400">
                اطمینان: {toPersianDigits(Math.round(lead.qualification.confidenceScore * 100))}٪
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {lead.qualification.probableCause || lead.qualification.probableFaultOrScope || lead.qualification.probableFault}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-1 border-t border-cyan-900/40">
              <span>
                برآورد دستمزد: <strong className="text-emerald-400">
                  {formatPriceToman(lead.qualification.estimatedCostTomanMin || lead.qualification.targetBudgetEstimate?.minToman || lead.qualification.estimatedPriceMin || 200000)} تا {formatPriceToman(lead.qualification.estimatedCostTomanMax || lead.qualification.targetBudgetEstimate?.maxToman || lead.qualification.estimatedPriceMax || 800000)}
                </strong>
              </span>
              {lead.qualification.requiresTowTruck && (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  <span>نیازمند اعزام یدک‌کش</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Info: Locked / Unlocked */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-400" />
              <span>اطلاعات تماس مستقیم مشتری</span>
            </h2>

            {isUnlocked ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <Unlock className="h-3.5 w-3.5" />
                <span>اطلاعات بازگشایی شده</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                <Lock className="h-3.5 w-3.5" />
                <span>اطلاعات قفل است (۱ اعتبار)</span>
              </span>
            )}
          </div>

          {isUnlocked ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 p-4">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">شماره تماس مستقیم:</span>
                <a
                  href={`tel:${lead.customerPhone}`}
                  className="text-base font-black text-emerald-400 tracking-wider dir-ltr inline-block hover:underline"
                >
                  {toPersianDigits(lead.customerPhone)}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${lead.customerPhone}`}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>تماس تلفنی</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-300">
                  برای مشاهده شماره تلفن کامل مشتری و تماس فوری، این لید را با ۱ اعتبار بازگشایی کنید.
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  موجودی اعتبار واحد شما: {toPersianDigits(business?.credits || 0)} اعتبار
                </span>
              </div>

              <button
                id="unlock-lead-contact-btn"
                onClick={handleUnlockContact}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 shrink-0"
              >
                <Unlock className="h-3.5 w-3.5" />
                <span>بازگشایی تماس (۱ اعتبار)</span>
              </button>
            </div>
          )}
        </div>

        {/* Specialist Quotes list */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <span>پیشنهادهای قیمت متخصصان ({toPersianDigits(lead.quotes?.length || 0)})</span>
          </h2>

          {!lead.quotes || lead.quotes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">هنوز استعلام قیمتی برای این درخواست ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {lead.quotes.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-xs">{q.businessNameFa}</strong>
                      <span className="text-slate-400">({q.specialistName || q.mechanicName})</span>
                      {q.canVisitLocation && (
                        <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] text-cyan-300 border border-cyan-800">
                          اعزام در محل سنندج
                        </span>
                      )}
                    </div>
                    {q.message && <p className="text-slate-300 mt-1">«{q.message}»</p>}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-slate-400 text-[11px] block">برآورد هزینه:</span>
                    <strong className="text-emerald-400 text-sm">{formatPriceToman(q.estimatedCost)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Business Quote Submission Box (For Business Role) */}
        {currentRole === 'business' && (
          <form onSubmit={handleSubmitQuote} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-cyan-400" />
              <span>ارسال پیشنهاد قیمت یا زمان‌بندی به مشتری</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  مبلغ تقریبی دستمزد و خدمت (تومان)
                </label>
                <input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="450000"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canVisit}
                    onChange={(e) => setCanVisit(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                  />
                  <span>امکان اعزام و خدمت در محل مشتری در سنندج را دارم</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                توضیحات تکمیلی یا زمان پیشنهادی به مشتری
              </label>
              <input
                type="text"
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="مثال: قطعه اورجینال موجود است و ظرف ۳۰ دقیقه در محل حاضر می‌شویم."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingQuote}
              className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
            >
              ثبت و ارسال پیشنهاد به مشتری
            </button>
          </form>
        )}

        {/* Lead Workflow Status Change for Businesses/Admins */}
        {(currentRole === 'business' || currentRole === 'admin') && (
          <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">تغییر وضعیت چرخه خدمت:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleStatusChange('accepted')}
                className="rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-slate-300 transition-all"
              >
                پذیرش قطعی لید
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white px-2.5 py-1 text-slate-300 transition-all"
              >
                شروع انجام کار
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className="rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 px-2.5 py-1 text-slate-300 transition-all font-bold"
              >
                تکمیل کار و تسویه
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white px-2.5 py-1 text-slate-300 transition-all"
              >
                لغو لید
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
